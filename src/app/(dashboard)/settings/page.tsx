"use client";

import { useState, useEffect } from "react";
import {
  User,
  Bot,
  Shield,
  Trash2,
  Save,
  Key,
  AlertTriangle,
  LogOut,
  Bell,
  Monitor,
  Database,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [botToken, setBotToken] = useState(user?.botToken || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setBotToken(user.botToken || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, botToken }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearData = async (type: "history" | "images") => {
    if (!confirm(`Are you sure you want to clear all ${type}? This action cannot be undone.`)) return;

    try {
      const res = await fetch("/api/settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} cleared successfully`);
      }
    } catch (err) {
      toast.error("Failed to clear data");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h2>
        <p className="text-slate-500 font-medium mt-1">Global platform and account configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Profile Settings */}
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" /> Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl h-12 border-slate-200 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl h-12 border-slate-200 focus:ring-indigo-500"
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Telegram Bot Token</label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      className="rounded-xl h-12 border-slate-200 focus:ring-indigo-500 font-mono"
                    />
                    <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-slate-200 gap-2">
                       <RefreshCw className="h-4 w-4" /> Test
                    </Button>
                  </div>
               </div>
               <div className="pt-4 flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl font-bold shadow-lg shadow-indigo-500/20 gap-2"
                  >
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
               </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" /> Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
               <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <Key className="h-6 w-6" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-800">Change Password</p>
                        <p className="text-xs text-slate-500 font-medium">Update your account access credentials.</p>
                     </div>
                  </div>
                  <Button variant="outline" className="rounded-xl font-bold border-slate-200">Update Password</Button>
               </div>
               <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <Monitor className="h-6 w-6" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-800">Active Sessions</p>
                        <p className="text-xs text-slate-500 font-medium">Currently logged in from 1 device.</p>
                     </div>
                  </div>
                  <Button variant="ghost" className="rounded-xl font-bold text-rose-500 hover:bg-rose-50">Revoke All</Button>
               </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-2 border-rose-100 shadow-sm rounded-[2.5rem] overflow-hidden bg-rose-50/30">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" /> Danger Zone
              </CardTitle>
              <CardDescription className="text-rose-500 font-medium">Actions here are permanent and cannot be reversed.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleClearData("history")}
                    className="rounded-2xl h-16 font-bold border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white transition-all gap-3"
                  >
                    <Trash2 className="h-5 w-5" /> Clear Send History
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleClearData("images")}
                    className="rounded-2xl h-16 font-bold border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white transition-all gap-3"
                  >
                    <Trash2 className="h-5 w-5" /> Delete All Images
                  </Button>
               </div>
               <Button variant="ghost" className="w-full h-12 text-rose-400 font-bold hover:bg-rose-100/50 hover:text-rose-600 rounded-xl">
                 Delete Account Permanently
               </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
           {/* Bot Status */}
           <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-8 flex flex-col items-center text-center">
                 <div className={cn(
                   "h-20 w-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg",
                   user?.botToken ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-slate-100 text-slate-400"
                 )}>
                    <Bot className="h-10 w-10" />
                 </div>
                 <h4 className="text-xl font-black text-slate-900">Bot Connection</h4>
                 <p className="text-slate-400 font-medium text-sm mt-1 mb-6">
                    {user?.botToken ? "Your Telegram bot is successfully integrated." : "Connect your Telegram bot to start sending."}
                 </p>
                 <Badge className={cn(
                   "rounded-lg px-3 py-1 font-black uppercase tracking-widest border-none mb-8",
                   user?.botToken ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                 )}>
                    {user?.botToken ? "Connected" : "Disconnected"}
                 </Badge>
                 <Button asChild variant="outline" className="w-full rounded-xl h-12 font-bold border-slate-200">
                    <a href="https://t.me/botfather" target="_blank" rel="noreferrer" className="gap-2">
                       @BotFather <ExternalLink className="h-4 w-4" />
                    </a>
                 </Button>
              </CardContent>
           </Card>

           {/* Platform Preferences */}
           <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
             <CardHeader className="p-8 pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Preferences</CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-0 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-slate-700 font-bold">
                      <Bell className="h-4 w-4" /> <span className="text-sm">Notifications</span>
                   </div>
                   <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-slate-700 font-bold">
                      <Database className="h-4 w-4" /> <span className="text-sm">Auto-Compress</span>
                   </div>
                   <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-slate-700 font-bold">
                      <Shield className="h-4 w-4" /> <span className="text-sm">Enhanced Retries</span>
                   </div>
                   <Switch defaultChecked />
                </div>
                <div className="pt-4">
                   <Button onClick={logout} variant="secondary" className="w-full rounded-xl h-12 font-bold bg-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all border-none gap-2 shadow-none">
                      <LogOut className="h-4 w-4" /> Log Out
                   </Button>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function ExternalLink({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
  );
}
