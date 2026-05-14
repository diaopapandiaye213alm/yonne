// SMS via Africa's Talking
// Variables d'env requises: AT_API_KEY, AT_USERNAME (défaut: "sandbox" en dev)

const AT_BASE = "https://api.africastalking.com/version1/messaging";

export async function sendSms(to: string, message: string): Promise<void> {
  const apiKey   = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME ?? "sandbox";
  if (!apiKey) return; // SMS désactivé si pas de clé configurée

  // Normalise le numéro sénégalais → format international +221
  const phone = to.replace(/\s/g, "").replace(/^0/, "").replace(/^\+?221/, "+221");
  if (!phone.startsWith("+221")) return;

  try {
    const body = new URLSearchParams({
      username,
      to: phone,
      message,
      from: "YONNE",
    });
    await fetch(AT_BASE, {
      method: "POST",
      headers: {
        apiKey,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
  } catch {
    // SMS failure is non-blocking
  }
}
