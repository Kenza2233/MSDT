"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Upload, Image as ImageIcon, Send, Users, History, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Upload Images", href: "/upload", icon: Upload },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
  { name: "Send to Groups", href: "/send", icon: Send },
  { name: "My Groups", href: "/groups", icon: Users },
  { name: "Send History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 flex items-center gap-3"><div className="bg-blue-600 p-2 rounded-lg"><Send className="h-6 w-6 text-white" /></div><span className="font-bold text-lg">BulkSender</span></div>
      <nav className="flex-1 px-4 space-y-1">{navItems.map((item) => {
        const isActive = pathname === item.href;
        return <Link key={item.name} href={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium", isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}><item.icon className="h-5 w-5" />{item.name}</Link>;
      })}</nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-800/50 mb-4">
          <Avatar className="h-9 w-9"><AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback></Avatar>
          <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user?.name}</p></div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white" onClick={() => logout()}><LogOut className="h-5 w-5" />Logout</Button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 z-50"><NavContent /></aside>
      <header className="md:hidden flex items-center justify-between h-16 px-4 bg-slate-900 text-white sticky top-0 z-40">
        <div className="flex items-center gap-2"><Send className="h-5 w-5 text-blue-500" /><span className="font-bold">BulkSender</span></div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}><SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button></SheetTrigger><SheetContent side="left" className="p-0 w-64 border-none"><NavContent /></SheetContent></Sheet>
      </header>
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <header className="hidden md:flex h-16 items-center px-8 border-b bg-white sticky top-0 z-30"><h1 className="text-lg font-semibold">{navItems.find((item) => item.href === pathname)?.name || "Dashboard"}</h1></header>
        <div className="p-4 md:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
