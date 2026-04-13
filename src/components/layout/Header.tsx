"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getPageTitle = (path: string) => {
    if (path === "/") return "Dashboard";
    if (path.startsWith("/upload")) return "Upload Images";
    if (path.startsWith("/gallery")) return "Media Gallery";
    if (path.startsWith("/send")) return "Send to Groups";
    if (path.startsWith("/groups")) return "Group Management";
    if (path.startsWith("/history")) return "Send History";
    if (path.startsWith("/settings")) return "Settings";
    return "Application";
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar */}
        <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-64">
                <Sidebar />
              </SheetContent>
            </Sheet>
        </div>

        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden lg:flex relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search everything..."
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white h-9 rounded-lg"
          />
        </div>

        <Button variant="ghost" size="icon" className="h-9 w-9 relative text-slate-500 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-indigo-500 rounded-full border-2 border-white" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs shadow-sm">
                {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none mb-0.5">{user?.name || "User"}</p>
                <p className="text-[10px] text-slate-500 leading-none truncate max-w-[100px]">{user?.email}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-xl border-slate-200">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer py-2.5 rounded-lg">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-2.5 rounded-lg">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer py-2.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 focus:text-rose-600 focus:bg-rose-50"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
