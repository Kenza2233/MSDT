"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Send,
  Trash2,
  Save,
  AlertTriangle,
  RefreshCw,
  Database,
  Monitor,
  CheckCircle2,
  Smartphone,
  ShieldAlert,
  Clock,
  Layers,
  Settings2,
  History as HistoryIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
    const [botToken, setBotToken] = useState("");
    const [telegramId, setTelegramId] = useState("");
    const [botInfo, setBotInfo] = useState<any>(null);
    const [loadingBot, setLoadingBot] = useState(false);

    // Default Send Settings
    const [defaultDelay, setDefaultDelay] = useState(1000);
    const [defaultAlbumMode, setDefaultAlbumMode] = useState(true);

    const fetchBotInfo = async () => {
        setLoadingBot(true);
        try {
            const res = await fetch('/api/settings/bot-info');
            const data = await res.json();
            setBotInfo(data);
        } catch (err) {
            console.error("Bot info error", err);
        } finally {
            setLoadingBot(false);
        }
    };

    useEffect(() => {
        fetchBotInfo();
        const savedDelay = localStorage.getItem('bs_default_delay');
        const savedAlbum = localStorage.getItem('bs_default_album');
        if (savedDelay) setDefaultDelay(parseInt(savedDelay));
        if (savedAlbum) setDefaultAlbumMode(savedAlbum === 'true');
    }, []);

    const saveToken = async () => {
        try {
            const res = await fetch('/api/settings/bot-token', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botToken })
            });
            if (res.ok) {
                toast.success("Token saved!");
                fetchBotInfo();
                setBotToken("");
            }
        } catch (err) {
            toast.error("Save failed");
        }
    };

    const saveId = async () => {
        try {
            const res = await fetch('/api/settings/telegram-id', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId })
            });
            if (res.ok) {
                toast.success("Telegram ID saved!");
                setTelegramId("");
            }
        } catch (err) {
            toast.error("Save failed");
        }
    };

    const saveDefaults = () => {
        localStorage.setItem('bs_default_delay', defaultDelay.toString());
        localStorage.setItem('bs_default_album', defaultAlbumMode.toString());
        toast.success("Default settings updated!");
    };

    const clearImages = async () => {
        if (!confirm("Delete ALL uploaded images?")) return;
        try {
            await fetch('/api/settings/images', { method: 'DELETE' });
            toast.success("All images cleared");
        } catch (err) {
            toast.error("Action failed");
        }
    };

    const clearHistory = async () => {
        if (!confirm("Delete ALL campaign history?")) return;
        try {
            await fetch('/api/settings/history', { method: 'DELETE' });
            toast.success("All history cleared");
        } catch (err) {
            toast.error("Action failed");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Control Center</h2>
                    <p className="text-slate-500 font-medium mt-1">Global platform orchestration and management</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-10">
                    <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white group transition-all duration-500 hover:shadow-2xl">
                        <CardHeader className="p-10 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl font-black flex items-center gap-3 italic">
                                    <Bot className="h-7 w-7 text-blue-600 group-hover:rotate-12 transition-transform" /> Integration
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={fetchBotInfo} className="rounded-xl">
                                    <RefreshCw className={cn("h-5 w-5 text-slate-300", loadingBot && "animate-spin")} />
                                </Button>
                            </div>
                            <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Connect your Telegram Bot via API Token</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-4 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Bot API Token</label>
                                <div className="flex gap-2">
                                    <Input type="password" placeholder="e.g. 123456789:ABCDefG..." value={botToken} onChange={(e) => setBotToken(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-0 focus:ring-blue-100 font-mono text-sm" />
                                    <Button onClick={saveToken} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 shadow-xl">UPDATE</Button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Global Admin ID</label>
                                <div className="flex gap-2">
                                    <Input placeholder="Your numeric Telegram ID" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-0 focus:ring-blue-100 font-mono font-bold" />
                                    <Button onClick={saveId} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 shadow-xl">SAVE</Button>
                                </div>
                            </div>
                            <div className={cn(
                                "p-8 rounded-[2.5rem] flex items-center justify-between transition-all duration-500",
                                botInfo?.connected ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50 border border-slate-200"
                            )}>
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "h-16 w-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 rotate-3",
                                        botInfo?.connected ? "bg-emerald-500 text-white" : "bg-slate-300 text-white"
                                    )}>
                                        <Bot className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800 italic">{botInfo?.connected ? `@${botInfo.username}` : "Not Connected"}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{botInfo?.connected ? botInfo.firstName : "Check your credentials"}</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    botInfo?.connected ? "bg-emerald-200 text-emerald-800" : "bg-rose-100 text-rose-700"
                                )}>
                                    {botInfo?.connected ? "ACTIVE" : "OFFLINE"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-2xl font-black flex items-center gap-3 italic">
                                <Settings2 className="h-7 w-7 text-violet-600" /> Transmission Defaults
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 pt-4 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black uppercase text-slate-400">Default Interval</span>
                                        <span className="text-xs font-black text-blue-600">{defaultDelay}ms</span>
                                    </div>
                                    <Slider min={500} max={5000} step={100} value={[defaultDelay]} onValueChange={([v]) => setDefaultDelay(v)} />
                                </div>
                                <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-800 uppercase italic">Album Mode</p>
                                        <p className="text-[10px] font-bold text-slate-400">Default for all campaigns</p>
                                    </div>
                                    <Switch checked={defaultAlbumMode} onCheckedChange={setDefaultAlbumMode} />
                                </div>
                            </div>
                            <Button onClick={saveDefaults} className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-xl shadow-violet-500/20 text-xs tracking-widest">SAVE DEFAULTS</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-8">
                    <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="p-10">
                            <div className="h-14 w-14 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/10 mb-6 rotate-6 shadow-2xl">
                                <Monitor className="h-8 w-8 text-blue-400" />
                            </div>
                            <CardTitle className="text-2xl font-black italic tracking-tight">Platform Insight</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 space-y-6">
                            <div className="space-y-4">
                                {[
                                    { l: "Engine Status", v: "Running", i: CheckCircle2, c: "text-emerald-400" },
                                    { l: "Database Sync", v: "Connected", i: Database, c: "text-blue-400" },
                                    { l: "Transmission Node", v: "Global v1", i: Layers, c: "text-violet-400" }
                                ].map((x, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <x.i className="h-5 w-5 text-slate-500" />
                                            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">{x.l}</span>
                                        </div>
                                        <span className={cn("text-xs font-black italic", x.c)}>{x.v}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-rose-100 shadow-xl rounded-[2.5rem] overflow-hidden bg-rose-50/20">
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-xl font-black flex items-center gap-3 text-rose-600 italic">
                                <ShieldAlert className="h-6 w-6" /> High-Risk Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 pt-4 space-y-4">
                            <Button variant="outline" onClick={clearImages} className="w-full h-16 rounded-2xl font-black border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white transition-all group flex justify-start px-8">
                                <Trash2 className="h-5 w-5 mr-4 group-hover:rotate-12 transition-transform" /> FLUSH ALL MEDIA
                            </Button>
                            <Button variant="outline" onClick={clearHistory} className="w-full h-16 rounded-2xl font-black border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white transition-all group flex justify-start px-8">
                                <HistoryIcon className="h-5 w-5 mr-4 group-hover:scale-110 transition-transform" /> PURGE AUDIT LOGS
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
