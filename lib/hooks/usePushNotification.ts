"use client";
import { useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";

// NEXT_PUBLIC_VAPID_PUBLIC_KEY must be the uncompressed P-256 public key in base64url (65 bytes).
// Generate with: npx ts-node -e "const c=require('crypto');const k=c.generateKeyPairSync('ec',{namedCurve:'prime256v1'});..."
// or use the vapid-keygen script in scripts/generate-vapid-keys.js
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export type PushState = "idle" | "subscribing" | "subscribed" | "denied" | "unsupported";

export function usePushNotification(driverId: string | null) {
  const [state, setState] = useState<PushState>("idle");

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!driverId) return false;
    if (typeof window === "undefined") return false;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return false;
    }
    if (!VAPID_PUBLIC_KEY) {
      console.warn("[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");
      return false;
    }

    setState("subscribing");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = subscription.toJSON();
      const endpoint = json.endpoint;
      const p256dh   = json.keys?.p256dh;
      const authKey  = json.keys?.auth;

      if (!endpoint || !p256dh || !authKey) {
        console.error("[push] subscription missing keys");
        setState("idle");
        return false;
      }

      const { error } = await getSupabase()
        .from("driver_push_subscriptions")
        .upsert(
          { driver_id: driverId, endpoint, p256dh, auth_key: authKey },
          { onConflict: "driver_id,endpoint" }
        );

      if (error) {
        console.error("[push] save subscription failed:", error.message);
        setState("idle");
        return false;
      }

      setState("subscribed");
      return true;
    } catch (err) {
      console.error("[push] subscribe error:", err);
      setState("idle");
      return false;
    }
  }, [driverId]);

  return { pushState: state, subscribe };
}
