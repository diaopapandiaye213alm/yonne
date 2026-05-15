"use client";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { useMerchantsStore } from "@/lib/store/merchants";

export function OnboardingGuard() {
  const router    = useRouter();
  const pathname  = usePathname();
  const session   = useSession();
  const { merchants, fetchMerchants } = useMerchantsStore();
  const checked   = useRef(false);

  // Ensure merchant list is loaded
  useEffect(() => {
    if (merchants.length === 0) fetchMerchants();
  }, [merchants.length, fetchMerchants]);

  useEffect(() => {
    if (pathname === "/merchant/onboarding") return;
    if (checked.current) return;

    // Fast path: localStorage already set
    try {
      if (localStorage.getItem("yonne_merchant_onboarding_done") === "1") return;
    } catch { /* ignore */ }

    // Server path: wait for session + merchants to load, then check DB flag
    if (!session) return; // still loading
    if (merchants.length === 0) return; // still loading

    // RLS ensures the merchants store only contains the current user's merchant
    const merchant = merchants[0];
    checked.current = true;
    if (merchant?.onboardingDone) {
      // Sync back to localStorage so future checks are instant
      try { localStorage.setItem("yonne_merchant_onboarding_done", "1"); } catch { /* ignore */ }
      return;
    }

    router.replace("/merchant/onboarding");
  }, [pathname, router, session, merchants]);

  return null;
}
