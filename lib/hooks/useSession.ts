"use client";
import { useState, useEffect } from "react";
import type { SessionPayload } from "@/lib/auth";

type SessionState = SessionPayload | null;

// Module-level cache — all hook instances share one fetch
let _resolved = false;
let _session: SessionState = null;
const _listeners = new Set<(s: SessionState) => void>();

function notify(s: SessionState) {
  _session = s;
  _listeners.forEach(fn => fn(s));
}

let _fetchPromise: Promise<void> | null = null;
let _retryCount = 0;
const MAX_RETRIES = 3;
let _retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

function scheduleRetry(delayMs: number) {
  _retryTimeoutId = setTimeout(() => {
    _retryTimeoutId = null;
    _fetchPromise = null;
    ensureFetched();
  }, delayMs);
}

function ensureFetched() {
  if (_resolved || _fetchPromise) return;
  _fetchPromise = fetch("/api/auth/me")
    .then(r => {
      if (!r.ok) return null;
      // Guard against proxies (Nginx 502/504) returning HTML error pages
      const ct = r.headers.get("content-type") ?? "";
      if (!ct.includes("application/json")) return null;
      return r.json() as Promise<SessionState>;
    })
    .then(data => {
      _resolved = true;
      _retryCount = 0;
      notify(data as SessionState);
    })
    .catch(() => {
      _fetchPromise = null;
      if (_retryCount < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** _retryCount, 8000);
        _retryCount++;
        scheduleRetry(delay);
      } else {
        _resolved = true;
        _retryCount = 0;
        notify(null);
      }
    });
}

// Call on logout so that the next login gets a fresh session fetch.
export function clearSession() {
  if (_retryTimeoutId !== null) {
    clearTimeout(_retryTimeoutId);
    _retryTimeoutId = null;
  }
  _resolved = false;
  _session = null;
  _fetchPromise = null;
  _retryCount = 0;
  notify(null);
}

export function useSession(): SessionPayload | null {
  const [session, setSession] = useState<SessionState>(_resolved ? _session : null);

  useEffect(() => {
    _listeners.add(setSession);
    ensureFetched();
    if (_resolved) setSession(_session);
    return () => { _listeners.delete(setSession); };
  }, []);

  return session;
}
