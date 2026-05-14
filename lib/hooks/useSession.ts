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

function ensureFetched() {
  if (_resolved || _fetchPromise) return;
  _fetchPromise = fetch("/api/auth/me")
    .then(r => (r.ok ? r.json() : null))
    .then(data => { _resolved = true; notify(data as SessionState); })
    .catch(() => { _resolved = true; notify(null); });
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
