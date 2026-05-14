"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function OnboardingGuard() {
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/merchant/onboarding") return;
    const done = localStorage.getItem("yonne_merchant_onboarding_done");
    if (!done) {
      router.replace("/merchant/onboarding");
    }
  }, [pathname, router]);

  return null;
}
