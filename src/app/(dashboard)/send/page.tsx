"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  Send,
  ImageIcon,
  Users,
  Search,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Loader2,
  AlertCircle,
  Play,
  History as HistoryIcon,
  Trash2,
  LayoutGrid,
  Check,
  Ban,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatFileSize } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";


export default function SendPage() {
    const [images, setImages] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedImages, setSelectedImages] = useState<number[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
    const [caption, setCaption] = useState("");
    const [sendAsAlbum, setSendAsAlbum] = useState(true);
    const [albumSize, setAlbumSize] = useState(10);
    const [delay, setDelay] = useState(1000);

    // Status State
    const [sending, setSending] = useState(false);
    const [activeJob, setActiveJob] = useState<any>(null);
    const [showOverlay, setShowOverlay] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [imgRes, grpRes] = await Promise.all([
                    fetch('/api/images?take=100'),
                    fetch('/api/groups')
                ]);
                const imgData = await imgRes.json();
                const grpData = await grpRes.json();
                setImages(imgData.images);
                setGroups(grpData.filter((g: any) => g.isActive));
            } catch (err) {
                toast.error("Error loading data");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        let interval: any;
        if (sending && activeJob?.id) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/send/status/${activeJob.id}`);
                    const data = await res.json();
                    setActiveJob(data);

                    // Mock logs for UI based on completedSends increment
                    if (data.records) {
                        const newLogs = data.records.slice(0, 10).map((r: any) => ({
                            msg: `Broadcast to "${r.group.title}": ${r.status.toUpperCase()}`,
                            status: r.status,
                            time: new Date(r.updatedAt).toLocaleTimeString()
                        }));
                        setLogs(newLogs);
                    }

                    if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
                        setSending(false);
                        toast.success(`Job ${data.status}`);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [sending, activeJob?.id]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [logs]);

    const handleStart = async () => {
        if (!selectedImages.length || !selectedGroups.length) return toast.error("Select images and groups");

        setSending(true);
        setShowOverlay(true);
        setLogs([]);
        try {
            const res = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageIds: selectedImages,
                    groupIds: selectedGroups,
                    sendAsAlbum,
                    albumSize,
                    delayMs: delay,
                    caption
                })
            });
            const data = await res.json();
            if (res.ok) {
                setActiveJob(data);
                toast.success("Sending job started!");
            } else {
                throw new Error(data.message);
            }
        } catch (err: any) {
            toast.error(err.message);
            setSending(false);
            setShowOverlay(false);
        }
    };

    const cancelJob = async () => {
        if (!activeJob?.id) return;
        try {
            await fetch(`/api/send/cancel/${activeJob.id}`, { method: 'POST' });
            toast.info("Cancellation requested");
        } catch (err) {
            toast.error("Cancel failed");
        }
    };

    const [imgSearch, setImgSearch] = useState("");
    const [grpSearch, setGrpSearch] = useState("");
    const filteredImages = useMemo(() => images.filter(i => i.fileName.toLowerCase().includes(imgSearch.toLowerCase())), [images, imgSearch]);
    const filteredGroups = useMemo(() => groups.filter(g => g.title.toLowerCase().includes(grpSearch.toLowerCase()) || g.chatId.includes(grpSearch)), [groups, grpSearch]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-40 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Campaign Creator</h2>
                    <p className="text-slate-500 font-medium mt-1">Configure and blast your content across Telegram</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-6 px-6 py-3 bg-white shadow-md rounded-[1.5rem] border border-slate-100">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase text-slate-400">Targeting</p>
                            <p className="text-lg font-black text-blue-600 leading-none">{selectedGroups.length} Groups</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase text-slate-400">Broadcasting</p>
                            <p className="text-lg font-black text-violet-600 leading-none">{selectedImages.length} Images</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-6">
                    <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl h-[700px] flex flex-col">
                        <CardHeader className="bg-white border-b border-slate-100 p-8">
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3 italic">
                                    <ImageIcon className="h-6 w-6 text-blue-600" /> Choose Media
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedImages(selectedImages.length === images.length ? [] : images.map(i => i.id))} className="font-black text-xs text-blue-600 uppercase tracking-widest hover:bg-blue-50">
                                    {selectedImages.length === images.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Filter by filename..." value={imgSearch} onChange={(e) => setImgSearch(e.target.value)} className="pl-11 h-12 bg-slate-50 border-0 rounded-2xl focus:ring-blue-100" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0">
                            <ScrollArea className="h-full p-8">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {filteredImages.map(img => {
                                        const active = selectedImages.includes(img.id);
                                        return (
                                            <div key={img.id} onClick={() => setSelectedImages(prev => active ? prev.filter(i => i !== img.id) : [...prev, img.id])} className={cn("relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group shadow-md", active ? "ring-4 ring-blue-600 scale-95 shadow-xl" : "hover:scale-105")}>
                                                <img src={img.thumbnailPath || img.filePath} className="h-full w-full object-cover" />
                                                <div className={cn("absolute inset-0 bg-blue-600/20 flex items-center justify-center opacity-0 transition-opacity duration-300", active && "opacity-100")}>
                                                    <div className="bg-blue-600 text-white p-2 rounded-full shadow-2xl"><CheckCircle2 className="h-6 w-6" /></div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                    <p className="text-[8px] font-black text-white truncate">{img.fileName}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-5 space-y-8">
                    <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl h-[700px] flex flex-col">
                        <CardHeader className="bg-white border-b border-slate-100 p-8">
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3 italic">
                                    <Users className="h-6 w-6 text-violet-600" /> Target Groups
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedGroups(selectedGroups.length === groups.length ? [] : groups.map(g => g.id))} className="font-black text-xs text-violet-600 uppercase tracking-widest hover:bg-violet-50">
                                    {selectedGroups.length === groups.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Search by title or ID..." value={grpSearch} onChange={(e) => setGrpSearch(e.target.value)} className="pl-11 h-12 bg-slate-50 border-0 rounded-2xl focus:ring-violet-100" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0">
                            <ScrollArea className="h-full p-6">
                                <div className="space-y-2">
                                    {filteredGroups.map(grp => {
                                        const active = selectedGroups.includes(grp.id);
                                        return (
                                            <div key={grp.id} onClick={() => setSelectedGroups(prev => active ? prev.filter(i => i !== grp.id) : [...prev, grp.id])} className={cn("p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-300 border-2", active ? "bg-violet-50 border-violet-500 shadow-md translate-x-1" : "bg-white border-transparent hover:bg-slate-50")}>
                                                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center font-black text-white shadow-lg", active ? "bg-violet-600 rotate-3" : "bg-slate-200 text-slate-400")}>
                                                    {grp.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-slate-800 tracking-tight truncate italic">{grp.title}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 font-mono">{grp.chatId}</p>
                                                </div>
                                                <Badge className={cn("rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest", grp.type === 'channel' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700")}>
                                                    {grp.type}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 z-40">
                <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[3rem] overflow-hidden bg-slate-900/90 backdrop-blur-2xl text-white">
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                            <div className="md:col-span-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Campaign Caption</h4>
                                    <span className="text-[10px] text-slate-500">{caption.length} / 1024</span>
                                </div>
                                <Textarea
                                    placeholder="Enter caption for this broadcast..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="h-20 bg-white/5 border-0 rounded-2xl focus:ring-blue-500 font-medium text-xs scrollbar-thin"
                                />
                            </div>
                            <div className="md:col-span-4 space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Delay: <span className="text-blue-400">{delay}ms</span></span>
                                        <Slider min={500} max={5000} step={100} value={[delay]} onValueChange={([v]) => setDelay(v)} />
                                    </div>
                                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Album</span>
                                        <Switch checked={sendAsAlbum} onCheckedChange={setSendAsAlbum} />
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-4 flex flex-col gap-3">
                                <Button onClick={handleStart} disabled={sending || !selectedImages.length || !selectedGroups.length} className="h-16 rounded-[2rem] bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-black text-lg shadow-2xl shadow-blue-600/30 animate-pulse-glow">
                                    <Play className="h-6 w-6 mr-3" /> LAUNCH CAMPAIGN
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* FULL SCREEN PROGRESS OVERLAY */}
            <AnimatePresence>
                {showOverlay && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6">
                        <div className="w-full max-w-4xl space-y-12">
                            <div className="text-center space-y-4">
                                <div className="inline-flex p-5 rounded-[2.5rem] bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.4)] mb-4 animate-float">
                                    <Send className="h-12 w-12 text-white" />
                                </div>
                                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">Broadcasting Now</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">Campaign ID: #{activeJob?.id || 'Initializing'}</p>
                            </div>

                            <Card className="bg-white/5 border-white/10 rounded-[3rem] p-10 space-y-8 overflow-hidden relative">
                                <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-violet-600" style={{ width: `${activeJob ? (activeJob.completedSends / activeJob.totalSends) * 100 : 0}%` }} />

                                <div className="grid grid-cols-3 gap-10">
                                    <div className="text-center space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase">Successful</p>
                                        <p className="text-5xl font-black text-emerald-500">{activeJob?.completedSends || 0}</p>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase">Failed</p>
                                        <p className="text-5xl font-black text-rose-500">{activeJob?.failedSends || 0}</p>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase">Remaining</p>
                                        <p className="text-5xl font-black text-blue-500">{(activeJob?.totalSends || 0) - ((activeJob?.completedSends || 0) + (activeJob?.failedSends || 0))}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black text-white italic">Overall Progress</span>
                                        <span className="text-2xl font-black text-blue-400">{activeJob ? Math.round((activeJob.completedSends / activeJob.totalSends) * 100) : 0}%</span>
                                    </div>
                                    <Progress value={activeJob ? (activeJob.completedSends / activeJob.totalSends) * 100 : 0} className="h-4 bg-white/5 rounded-full" />
                                </div>

                                <div className="bg-black/40 rounded-[2rem] border border-white/5 p-6 space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" /> Live Transmission Log
                                        </h4>
                                        {sending && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                                    </div>
                                    <ScrollArea className="h-48" ref={scrollRef}>
                                        <div className="space-y-2">
                                            {logs.length === 0 && <p className="text-slate-600 italic text-center py-10 font-bold">Waiting for connection...</p>}
                                            {logs.map((log, i) => (
                                                <div key={i} className="flex items-center justify-between text-[11px] font-bold py-2 border-b border-white/5 last:border-0 group">
                                                    <span className={cn("flex items-center gap-3", log.status === 'sent' ? 'text-emerald-400' : 'text-rose-400')}>
                                                        {log.status === 'sent' ? <Check className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                                                        {log.msg}
                                                    </span>
                                                    <span className="text-slate-600 group-hover:text-slate-400 transition-colors font-mono">{log.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </Card>

                            <div className="flex justify-center gap-6">
                                {sending ? (
                                    <Button variant="outline" onClick={cancelJob} className="h-16 px-12 rounded-2xl border-white/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black uppercase tracking-widest">
                                        <Ban className="mr-3 h-5 w-5" /> Terminate Job
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild className="h-16 px-12 rounded-2xl bg-white text-slate-950 hover:bg-blue-50 font-black uppercase tracking-widest">
                                            <Link href="/history"><HistoryIcon className="mr-3 h-5 w-5" /> View History</Link>
                                        </Button>
                                        <Button onClick={() => setShowOverlay(false)} variant="ghost" className="h-16 px-12 rounded-2xl text-slate-400 hover:text-white font-black uppercase tracking-widest border border-white/5">
                                            Close Monitor
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
