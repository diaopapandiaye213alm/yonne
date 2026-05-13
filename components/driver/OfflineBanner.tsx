"use client";
import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline]           = useState(false);
  const [justBack, setJustBack]         = useState(false);

  useEffect(() => {
    function onOffline() { setOffline(true); setJustBack(false); }
    function onOnline()  { setOffline(false); setJustBack(true); setTimeout(() => setJustBack(false), 3000); }
    window.addEventListener("offline", onOffline);
    window.addEventListener("online",  onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online",  onOnline);
    };
  }, []);

  if (!offline && !justBack) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[2000] flex items-center justify-center gap-2 py-2 text-xs font-semibold transition-all ${
      offline ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
    }`}>
      {offline
        ? <><WifiOff className="w-3.5 h-3.5" /> Hors ligne — les données sont mises en cache</>
        : <><Wifi className="w-3.5 h-3.5" /> Connexion rétablie</>
      }
    </div>
  );
}
