"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  X,
  MoreVertical,
  ShieldCheck,
  AlertCircle,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Zap,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const dynamic = 'force-dynamic';

export default function GroupsPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingChats, setLoadingChats] = useState(false);
    const [search, setSearch] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [chatId, setChatId] = useState("");
    const [type, setType] = useState("group");
    const [submitting, setSubmitting] = useState(false);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/groups');
            const data = await res.json();
            setGroups(data);
        } catch (err) {
            toast.error("Error fetching groups");
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentChats = async () => {
        setLoadingChats(true);
        try {
            const res = await fetch('/api/groups/recent-chats');
            const data = await res.json();
            if (res.ok) {
                setRecentChats(data.chats);
                if (data.chats.length === 0) toast.info("No recent interactions found for this bot.");
            } else {
                throw new Error(data.message);
            }
        } catch (err: any) {
            toast.error(`Fetch failed: ${err.message}`);
        } finally {
            setLoadingChats(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const addGroup = async (t: string, cid: string, ty: string) => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: t, chatId: cid, type: ty })
            });
            if (res.ok) {
                toast.success(`Group "${t}" added!`);
                setTitle(""); setChatId(""); setType("group");
                setIsAddModalOpen(false);
                fetchGroups();
            }
        } catch (err) {
            toast.error("Add failed");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleGroup = async (id: number) => {
        try {
            await fetch(`/api/groups/${id}/toggle`, { method: 'PATCH' });
            fetchGroups();
        } catch (err) {
            toast.error("Toggle failed");
        }
    };

    const deleteGroup = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`/api/groups/${id}`, { method: 'DELETE' });
            toast.success("Group deleted");
            fetchGroups();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const testConnection = async (id: number) => {
        toast.promise(
            fetch(`/api/groups/${id}/test`, { method: 'POST' }).then(async r => {
                if (!r.ok) throw new Error((await r.json()).message);
                return r.json();
            }),
            {
                loading: 'Sending test message...',
                success: 'Connection successful!',
                error: (err) => `Test failed: ${err.message}`
            }
        );
        setTimeout(fetchGroups, 2000);
    };

    const filtered = groups.filter(g => g.title.toLowerCase().includes(search.toLowerCase()) || g.chatId.includes(search));

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Targeting Center</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage where your broadcasts will land</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-8 rounded-xl shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="h-5 w-5 mr-2" /> Add Target
                    </Button>
                </div>
            </div>

            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-xl">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search by title or Chat ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 h-12 bg-white/50 border-slate-200 rounded-xl focus:ring-blue-100"
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchGroups} className="h-12 w-12 rounded-xl border border-slate-200">
                        <RefreshCw className={cn("h-5 w-5 text-slate-400", loading && "animate-spin")} />
                    </Button>
                </CardContent>
            </Card>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-[2.5rem]" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-24 text-center">
                    <div className="bg-slate-100 h-24 w-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <Users className="h-12 w-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">No groups configured</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((g) => (
                        <Card key={g.id} className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden group hover-lift bg-white">
                            <CardHeader className="p-8 pb-0 flex flex-row items-start justify-between">
                                <div className={cn(
                                    "p-4 rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-110",
                                    g.type === 'channel' ? "bg-blue-100 text-blue-600 shadow-blue-100" : "bg-emerald-100 text-emerald-600 shadow-emerald-100"
                                )}>
                                    {g.type === 'channel' ? <ExternalLink className="h-8 w-8" /> : <Users className="h-8 w-8" />}
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <Switch checked={g.isActive} onCheckedChange={() => toggleGroup(g.id)} className="data-[state=checked]:bg-blue-600" />
                                    <Badge className={cn("rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border-0", g.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                                        {g.isActive ? "Active" : "Paused"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight truncate italic">{g.title}</h3>
                                    <p className="text-xs font-mono font-bold text-slate-400 mt-1">{g.chatId}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" size="sm" onClick={() => testConnection(g.id)} className="rounded-xl font-bold border-slate-200 hover:bg-blue-50 transition-all gap-2">
                                        <ShieldCheck className="h-4 w-4" /> Test
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => deleteGroup(g.id)} className="rounded-xl font-bold border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-all text-slate-400 gap-2">
                                        <Trash2 className="h-4 w-4" /> Remove
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl max-w-2xl">
                    <Tabs defaultValue="manual" className="w-full">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black italic">Connect New Target</DialogTitle>
                                <TabsList className="bg-white/10 mt-6 border border-white/20 p-1 h-12 rounded-xl">
                                    <TabsTrigger value="manual" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 font-bold px-6 rounded-lg transition-all">Manual Entry</TabsTrigger>
                                    <TabsTrigger value="auto" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 font-bold px-6 rounded-lg transition-all flex gap-2">
                                        <Zap className="h-4 w-4" /> Auto Detect
                                    </TabsTrigger>
                                </TabsList>
                            </DialogHeader>
                        </div>

                        <div className="p-8">
                            <TabsContent value="manual" className="space-y-6 mt-0">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 px-1">Display Title</label>
                                        <Input placeholder="Marketing Support" value={title} onChange={(e) => setTitle(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-0 font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 px-1">Numeric Chat ID</label>
                                        <Input placeholder="-100123456789" value={chatId} onChange={(e) => setChatId(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-0 font-mono font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 px-1">Type</label>
                                        <Select value={type} onValueChange={setType}>
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-100">
                                                <SelectItem value="group">Group</SelectItem>
                                                <SelectItem value="channel">Channel</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={() => addGroup(title, chatId, type)} disabled={submitting} className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl shadow-xl text-lg mt-4">
                                    {submitting ? <Loader2 className="animate-spin h-6 w-6" /> : "ADD TARGET"}
                                </Button>
                            </TabsContent>

                            <TabsContent value="auto" className="space-y-6 mt-0">
                                <div className="flex flex-col items-center justify-center py-6">
                                    <Button onClick={fetchRecentChats} disabled={loadingChats} className={cn("bg-blue-600 hover:bg-blue-700 text-white font-black px-8 rounded-xl h-12 gap-2 transition-all", loadingChats && "opacity-50")}>
                                        <RefreshCw className={cn("h-5 w-5", loadingChats && "animate-spin")} />
                                        Scan for Recent Chats
                                    </Button>
                                    <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest text-center max-w-sm">
                                        Bot must have seen a message in the group recently to detect it automatically.
                                    </p>
                                </div>

                                <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-2">
                                    {recentChats.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-300 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center font-black text-blue-600 shadow-sm">
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 italic truncate max-w-[200px]">{c.name}</p>
                                                    <p className="text-[10px] font-mono text-slate-400">{c.chatId}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" onClick={() => addGroup(c.name, c.chatId, c.type)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-tighter px-4 rounded-lg">
                                                Add Group
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}
