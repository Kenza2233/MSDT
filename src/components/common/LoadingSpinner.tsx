"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ label, className, fullPage }: LoadingSpinnerProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      {label && <p className="text-sm font-medium text-slate-500">{label}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-white">{content}</div>;
  }

  return content;
}
