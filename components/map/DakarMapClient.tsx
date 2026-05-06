"use client";
import dynamic from "next/dynamic";

const DakarMap = dynamic(() => import("./DakarMap"), { ssr: false, loading: () => <div className="h-[480px] rounded-lg bg-cream-100 animate-pulse" /> });

export default DakarMap;
