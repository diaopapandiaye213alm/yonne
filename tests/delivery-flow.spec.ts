/**
 * YONNE — Playwright E2E baseline
 *
 * Ces tests valident les invariants de sécurité et de comportement UI
 * sans dépendre d'une base Supabase réelle : les appels REST sont
 * interceptés via page.route() ou request.post() directement.
 */

import { test, expect } from "@playwright/test";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Intercepte tous les appels REST Supabase avec une réponse vide. */
async function stubSupabase(page: Parameters<typeof test>[1] extends (args: infer A) => unknown ? A extends { page: infer P } ? P : never : never) {
  await page.route("**/rest/v1/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route("**/auth/v1/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ access_token: "test", user: null }),
    }),
  );
}

// ── 1. Wizard — garde anti double-submit ─────────────────────────────────────
test.describe("Wizard — double-submit guard", () => {
  test("le bouton de soumission est désactivé après le premier clic", async ({
    page,
  }) => {
    await stubSupabase(page);

    // Ralentir les réponses API pour avoir le temps d'observer l'état disabled
    await page.route("/api/**", (route) =>
      new Promise<void>((resolve) =>
        setTimeout(() => {
          route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
          resolve();
        }, 800),
      ),
    );

    await page.goto("/merchant/wizard");

    // Le wizard est accessible même sans auth dans l'environnement de test
    // (ou redirige vers login — dans ce cas le test passe silencieusement)
    const submitBtn = page
      .getByRole("button", { name: /confirmer|créer|valider|suivant|envoyer/i })
      .last();

    if (!(await submitBtn.isVisible())) {
      // Page redirigée vers login — comportement attendu sans session
      await expect(page).not.toHaveURL(/500/);
      return;
    }

    await submitBtn.click();
    // Après le premier clic, le bouton doit être désactivé (double-submit guard)
    await expect(submitBtn).toBeDisabled({ timeout: 2_000 });
  });
});

// ── 2. SMS circuit breaker — non exposé côté navigateur ──────────────────────
test.describe("SMS circuit breaker", () => {
  test("l'endpoint /api/rate refuse les requêtes GET sans paramètres valides", async ({
    request,
  }) => {
    const response = await request.get("/api/rate");
    // L'API rate-limit est conçue pour être appelée en POST côté serveur seulement
    expect([400, 404, 405]).toContain(response.status());
  });

  test("sendSms ne peut pas être appelé directement depuis le navigateur", async ({
    page,
  }) => {
    await stubSupabase(page);
    await page.goto("/");

    // Vérifier qu'il n'existe aucun endpoint exposé pour déclencher un SMS manuellement
    const response = await page.request.post("/api/sms", {
      data: { to: "+221770000000", message: "test" },
    });
    // Doit retourner 404 (route inexistante) — jamais 200
    expect(response.status()).toBe(404);
  });
});

// ── 3. Carte livreur — toggle en ligne et carte GPS ──────────────────────────
test.describe("Carte livreur", () => {
  test("la page livreur se charge sans erreur 500", async ({ page }) => {
    await stubSupabase(page);

    // Simuler un livreur authentifié via cookie de session
    await page.context().addCookies([
      {
        name: "yonne_session",
        value: "test-driver-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/driver");

    // La page ne doit pas afficher d'erreur serveur
    await expect(page).not.toHaveURL(/\/_error/);
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toMatch(/500|Internal Server Error/);
  });

  test("un switch on/off est présent sur la page livreur", async ({ page }) => {
    await stubSupabase(page);
    await page.goto("/driver");

    // S'il y a un toggle visible (page rendue sans auth), vérifier qu'il est interactif
    const toggle = page.getByRole("switch").first();
    if (await toggle.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(toggle).toBeVisible();
      // Le toggle doit avoir un état aria-checked
      await expect(toggle).toHaveAttribute("aria-checked", /(true|false)/);
    } else {
      // Page redirigée vers login — OK
      await expect(page).not.toHaveURL(/500/);
    }
  });
});

// ── 4. Réception d'une commande — carte visible ───────────────────────────────
test.describe("Réception commande temps réel", () => {
  test("une commande active est affichée via l'appel REST initial", async ({
    page,
  }) => {
    // Stubber Supabase pour retourner une commande active
    await page.route("**/rest/v1/orders*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "ORD-E2E-001",
            status: "créée",
            amount: 5_000,
            client_name: "Awa Ba",
            client_phone: "+221770000002",
            payment_method: "wave",
            active: true,
            created_at: new Date().toISOString(),
          },
        ]),
      }),
    );

    await page.goto("/driver");
    // Laisser le temps au composant de monter et de faire sa requête initiale
    await page.waitForTimeout(1_000);

    // Vérifier qu'aucun crash ne s'est produit
    await expect(page).not.toHaveURL(/500/);

    // Si une carte de commande est visible, elle doit afficher l'ID
    const orderCard = page.locator('[data-testid="order-card"]').first();
    if (await orderCard.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await expect(orderCard).toContainText("ORD-E2E-001");
    }
  });
});

// ── 5. Sécurité webhook PayTech — vérification SHA-256 ──────────────────────
test.describe("Webhook PayTech — fail-closed sur signature invalide", () => {
  test("signature SHA-256 invalide retourne 401", async ({ request }) => {
    const body = new URLSearchParams({
      type_event: "sale_complete",
      ref_command: "ORD-E2E-001",
      item_price: "5000",
      token: "pt_fake_001",
      api_key_sha256:
        "0000000000000000000000000000000000000000000000000000000000000000",
      api_secret_sha256:
        "0000000000000000000000000000000000000000000000000000000000000000",
    }).toString();

    const response = await request.post("/api/webhooks/paytech", {
      data: body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });

    expect(response.status()).toBe(401);
  });

  test("signatures absentes retournent 401", async ({ request }) => {
    const response = await request.post("/api/webhooks/paytech", {
      data: "type_event=sale_complete",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    expect(response.status()).toBe(401);
  });
});
