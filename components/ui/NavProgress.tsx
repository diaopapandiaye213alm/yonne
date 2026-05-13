"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavProgress() {
  const pathname = usePathname();
  const [visible, setVisible]   = useState(false);
  const [width,   setWidth]     = useState(0);

  useEffect(() => {
    setVisible(true);
    setWidth(0);

    const t1 = setTimeout(() => setWidth(70),  50);
    const t2 = setTimeout(() => setWidth(90),  400);
    const t3 = setTimeout(() => setWidth(100), 700);
    const t4 = setTimeout(() => setVisible(false), 900);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-gold-400 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(21,128,61,0.5)]"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
