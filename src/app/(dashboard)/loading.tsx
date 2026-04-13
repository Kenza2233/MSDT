"use client";

import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-500/10 animate-scale-in">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Initializing Platform...</p>
    </div>
  );
}
