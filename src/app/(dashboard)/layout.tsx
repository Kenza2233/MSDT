"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Image as ImageIcon,
  Send,
  Users,
  History,
  Settings,
  Menu,
  X,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Upload Images", href: "/upload", icon: Upload },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
  { name: "Send to Groups", href: "/send", icon: Send },
  { name: "My Groups", href: "/groups", icon: Users },
  { name: "Send History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Auto-init user on first mount
    fetch("/api/init");
  }, []);

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 animate-pulse-glow">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight italic">BulkSender</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4 scrollbar-thin overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"
                  : "hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform group-hover:scale-110",
                isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
              )} />
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/30 rounded-2xl border border-white/5">
          <Avatar className="h-10 w-10 border-2 border-indigo-500/50">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">A</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">Admin</span>
            <span className="text-xs text-slate-500">Global Account</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        "lg:ml-64"
      )}>
        {/* Mobile Header */}
        <header className="lg:hidden h-16 glass sticky top-0 z-40 px-4 flex items-center justify-between border-b border-slate-200/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-1.5 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black text-slate-900 italic">BulkSender</span>
          </Link>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>

        {/* Top bar (Desktop) */}
        <div className="hidden lg:flex h-16 px-8 items-center justify-between glass border-b border-slate-200/50 sticky top-0 z-30">
          <h1 className="text-lg font-bold text-slate-800 capitalize">
            {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                Live Mode
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8 animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
