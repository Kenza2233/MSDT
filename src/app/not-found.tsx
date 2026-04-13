import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
      <div className="max-w-md space-y-10">
        <div className="relative">
          <h1 className="text-[12rem] font-black text-indigo-600/10 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-24 w-24 rounded-3xl bg-white shadow-xl flex items-center justify-center text-indigo-600 border border-slate-100">
                <Search className="h-10 w-10" />
             </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Page Not Found</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Oops! The page you're looking for doesn't exist or has been moved to a new destination.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 gap-2">
            <Link href="/">
              <Home className="h-5 w-5" /> Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 gap-2">
             <Link href="javascript:history.back()">
                <ArrowLeft className="h-5 w-5" /> Go Back
             </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
