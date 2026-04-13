"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
      <div className="max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
            <AlertCircle className="h-12 w-12" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Something went wrong</h2>
          <p className="mt-2 text-slate-500 font-medium leading-relaxed">
            An unexpected error occurred. We've been notified and are working on it.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={reset}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold border-slate-200 gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" /> Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
