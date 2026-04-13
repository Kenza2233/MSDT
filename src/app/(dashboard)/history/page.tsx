"use client";

import { useEffect, useState, useMemo } from "react";
import {
  History,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RotateCcw,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  Users,
  Filter,
  RefreshCw,
  Ban
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export const dynamic = 'force-dynamic';

export default function HistoryPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalSent: 0, sentToday: 0, successRate: 100 });

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const [jobsRes, statsRes] = await Promise.all([
                fetch('/api/history'),
                fetch('/api/history/stats')
            ]);
            const jobsData = await jobsRes.json();
            const statsData = await statsRes.json();
            setJobs(jobsData.jobs);
            setStats(statsData);
        } catch (err) {
            toast.error("Error loading history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const viewDetails = async (id: number) => {
        try {
            const res = await fetch(`/api/history/${id}`);
            const data = await res.json();
            setSelectedJob(data);
            setIsDetailModalOpen(true);
        } catch (err) {
            toast.error("Error loading details");
        }
    };

    const retryFailed = async (id: number) => {
        try {
            const res = await fetch(`/api/send/retry-failed/${id}`, { method: 'POST' });
            if (res.ok) {
                toast.success("Retry started!");
                fetchHistory();
            }
        } catch (err) {
            toast.error("Retry failed");
        }
    };

    const exportCSV = () => {
        window.open('/api/history/export', '_blank');
        toast.success("Exporting history...");
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter(j => {
            const matchesSearch = j.id.toString().includes(search);
            const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [jobs, search, statusFilter]);

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Audit & History</h2>
                    <p className="text-slate-500 font-medium mt-1">Review your campaign logs and transmission results</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={exportCSV} className="rounded-xl font-black border-slate-200 hover:bg-slate-100 h-12 px-6">
                        <Download className="h-4 w-4 mr-2" /> EXPORT ALL
                    </Button>
                    <Button variant="ghost" size="icon" onClick={fetchHistory} className="h-12 w-12 rounded-xl border border-slate-200">
                        <RefreshCw className={cn("h-5 w-5 text-slate-400", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: "Total Broadcasts", value: stats.totalSent, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
                    { label: "Active Today", value: stats.sentToday, icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
                    { label: "Global Success", value: `${stats.successRate}%`, icon: BarChart3, color: "text-violet-600", bg: "bg-violet-100" }
                ].map((s, i) => (
                    <Card key={i} className="border-0 shadow-md hover-lift">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={cn("p-4 rounded-2xl shadow-lg", s.bg, s.color)}>
                                <s.icon className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{s.label}</p>
                                <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{s.value}</h4>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Advanced Filters */}
            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-xl">
                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input placeholder="Search by Job ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-12 bg-white/50 border-slate-200 rounded-xl" />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-12 w-[180px] bg-white border-slate-200 rounded-xl font-bold">
                                <SelectValue placeholder="Status Filter" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all">All Campaigns</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-xl overflow-hidden rounded-[2.5rem] bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <th className="px-8 py-5 text-left">Launch Time</th>
                                <th className="px-8 py-5 text-left">Transmission</th>
                                <th className="px-8 py-5 text-left">Live Status</th>
                                <th className="px-8 py-5 text-left">Details</th>
                                <th className="px-8 py-5 text-right">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-medium">
                            {loading && filteredJobs.length === 0 ? (
                                [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-24 bg-slate-50/50" /></tr>)
                            ) : filteredJobs.length === 0 ? (
                                <tr><td colSpan={5} className="py-32 text-center text-slate-300 font-bold italic">No records matching your criteria.</td></tr>
                            ) : filteredJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-slate-800 tracking-tight italic">{formatDate(job.createdAt)}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono">#{job.id}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="w-52 space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase">
                                                <span className={cn(job.status === 'completed' ? 'text-emerald-600' : 'text-blue-600')}>
                                                    {Math.round((job.completedSends / job.totalSends) * 100)}% Reached
                                                </span>
                                                <span className="text-slate-400">{job.completedSends}/{job.totalSends}</span>
                                            </div>
                                            <Progress value={(job.completedSends / job.totalSends) * 100} className="h-2 bg-slate-100" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge className={cn(
                                            "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-0 shadow-sm",
                                            job.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                            job.status === 'processing' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                            job.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                                            job.status === 'cancelled' ? 'bg-slate-100 text-slate-600' :
                                            'bg-amber-100 text-amber-700'
                                        )}>
                                            {job.status}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 text-slate-500 font-black text-[10px] uppercase">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                                                <Layers className="h-3 w-3 text-blue-400" /> {job.sendAsAlbum ? "Album" : "Single"}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                                                <Users className="h-3 w-3 text-violet-400" /> {job.totalSends} Hits
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="outline" size="sm" onClick={() => viewDetails(job.id)} className="h-10 rounded-xl font-black text-[10px] uppercase tracking-tighter border-slate-200 hover:bg-blue-50 hover:text-blue-600">
                                                <Eye className="h-4 w-4 mr-2" /> LOGS
                                            </Button>
                                            {job.failedSends > 0 && (
                                                <Button variant="outline" size="sm" onClick={() => retryFailed(job.id)} className="h-10 rounded-xl font-black text-[10px] uppercase tracking-tighter border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                                                    <RotateCcw className="h-4 w-4 mr-2" /> RETRY
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-4xl rounded-[3rem] p-0 overflow-hidden border-0 shadow-2xl bg-white">
                    <div className="bg-slate-900 p-10 text-white relative">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black italic tracking-tighter">Campaign Log Explorer</DialogTitle>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Real-time status tracking for individual transmissions</p>
                        </DialogHeader>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                            {[
                                { l: "Broadcast Hits", v: selectedJob?.totalSends, c: "text-white" },
                                { l: "Success", v: selectedJob?.completedSends, c: "text-emerald-400" },
                                { l: "Faulty", v: selectedJob?.failedSends, c: "text-rose-400" },
                                { l: "Interval", v: `${selectedJob?.delayMs}ms`, c: "text-blue-400" }
                            ].map((x, i) => (
                                <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-2">{x.l}</p>
                                    <p className={cn("text-2xl font-black tracking-tight", x.c)}>{x.v}</p>
                                </div>
                            ))}
                        </div>
                        <Sparkles className="absolute top-10 right-10 h-12 w-12 text-blue-500/20" />
                    </div>

                    <div className="p-10 max-h-[450px] overflow-y-auto scrollbar-thin space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">Transmission Records</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {selectedJob?.records.map((rec: any, i: number) => (
                                <div key={i} className="flex items-center gap-5 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group">
                                    <div className="h-12 w-12 rounded-2xl overflow-hidden shrink-0 shadow-md group-hover:rotate-3 transition-transform">
                                        <img src={rec.image.thumbnailPath || rec.image.filePath} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-sm font-black text-slate-800 truncate italic">{rec.group.title}</h5>
                                        <p className="text-[10px] font-bold text-slate-400 font-mono mt-1">{rec.group.chatId}</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <Badge className={cn(
                                            "rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-tighter border-0 shadow-sm",
                                            rec.status === 'sent' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                        )}>
                                            {rec.status}
                                        </Badge>
                                        {rec.errorMessage && <p className="text-[9px] text-rose-500 font-bold truncate max-w-[200px] italic">{rec.errorMessage}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-10 pt-0 flex justify-end">
                        <Button onClick={() => setIsDetailModalOpen(false)} className="rounded-2xl font-black bg-slate-900 text-white px-10 h-14 shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs">
                            Exit Explorer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
