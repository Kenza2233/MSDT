"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  Image as ImageIcon,
  Send,
  Users,
  Clock,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Upload Images", href: "/upload", icon: Upload },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
  { name: "Send to Groups", href: "/send", icon: Send },
  { name: "Groups", href: "/groups", icon: Users },
  { name: "History", href: "/history", icon: Clock },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out border-r border-slate-700",
        collapsed ? "w-20" : "w-[260px]"
      )}
    >
      <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Send className="h-6 w-6 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight truncate">TG Bulk Sender</span>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
              )}
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "group-hover:text-white")} />
              {!collapsed && <span className="font-medium text-sm tracking-wide">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        {!collapsed && (
          <div className="mb-4 px-2 py-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shrink-0">
                {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-slate-400 truncate italic">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 h-11 px-4 rounded-xl",
            collapsed && "justify-center"
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="font-medium text-sm tracking-wide text-current">Logout</span>}
        </Button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-10 -right-4 bg-slate-800 border border-slate-700 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 shadow-xl hidden md:block"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
