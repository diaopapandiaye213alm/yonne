"use client";
import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // Check for updates on each page load
        reg.update().catch(() => {});
      })
      .catch((err) => {
        // Non-fatal — PWA features degrade gracefully
        console.warn("[sw] registration failed:", err);
      });
  }, []);

  return null;
}
