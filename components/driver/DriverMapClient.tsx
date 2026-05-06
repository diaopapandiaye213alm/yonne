"use client";
import dynamic from "next/dynamic";

const DriverMapClient = dynamic(() => import("@/components/map/DakarMap"), {
  ssr: false,
  loading: () => (
    <div
      className="bg-cream-100 animate-pulse w-full"
      style={{ height: "calc(100dvh - 56px)" }}
    />
  ),
});

export default DriverMapClient;
