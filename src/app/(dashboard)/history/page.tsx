"use client";

import { useEffect, useState } from "react";
import {
  History as HistoryIcon,
  Search,
  Download,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Send,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const dynamic = 'force-dynamic';

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recRes, statRes] = await Promise.all([
        fetch(`/api/history?page=${page}&status=${statusFilter}`),
        fetch("/api/history/stats")
      ]);
      if (recRes.ok) {
        const data = await recRes.json();
        setRecords(data.records);
        setTotalPages(data.pagination.pages);
      }
      if (statRes.ok) {
        setStats(await statRes.json());
      }
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  const statCards = [
    { title: "Total Sent", value: stats?.totalSent || 0, icon: Send, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Sent Today", value: stats?.sentToday || 0, icon: Clock, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Failed (24h)", value: stats?.failedRecent || 0, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100" },
    { title: "Success Rate", value: `${stats?.successRate || 100}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Send History</h2>
          <p className="text-slate-500 font-medium mt-1">Track and audit your campaign distributions</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" onClick={() => window.open('/api/history/export', '_blank')} className="rounded-xl font-bold gap-2 h-12 px-6 border-slate-200">
              <Download className="h-4 w-4" /> Export CSV
           </Button>
           <Button onClick={fetchData} variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                  <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
             <div className="relative w-full lg:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  placeholder="Filter by group or image name..."
                  className="pl-11 h-12 rounded-xl border-slate-200 bg-white shadow-sm focus:shadow-md transition-all"
                />
             </div>
             <div className="flex items-center gap-3 w-full lg:w-auto">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[180px] h-12 rounded-xl border-slate-200 bg-white font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                       <Filter className="h-3.5 w-3.5 text-slate-400" />
                       <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                     <th className="px-8 py-5">Date & Time</th>
                     <th className="px-8 py-5">Media</th>
                     <th className="px-8 py-5">Target Group</th>
                     <th className="px-8 py-5">Status</th>
                     <th className="px-8 py-5 text-right">Msg ID</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading && records.length === 0 ? (
                    [1,2,3,4,5].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-8 py-6 h-20 bg-slate-50/20" />
                      </tr>
                    ))
                  ) : records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-700">{formatDate(record.createdAt)}</p>
                          <p className="text-[10px] text-slate-400 font-medium">at {new Date(record.createdAt).toLocaleTimeString()}</p>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                <img src={record.image.thumbnailPath || record.image.filePath} className="h-full w-full object-cover" />
                             </div>
                             <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{record.image.filename}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{formatFileSize(record.image.fileSize)}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-800">{record.group.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{record.group.chatId}</p>
                       </td>
                       <td className="px-8 py-5">
                          <Badge className={cn(
                            "rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-none",
                            record.status === "sent" ? "bg-emerald-100 text-emerald-700" :
                            record.status === "failed" ? "bg-rose-100 text-rose-700" :
                            "bg-slate-100 text-slate-500"
                          )}>
                             {record.status === "sent" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : record.status === "failed" ? <XCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                             {record.status}
                          </Badge>
                       </td>
                       <td className="px-8 py-5 text-right">
                          <span className="text-xs font-mono text-slate-400">{record.telegramMsgId || "—"}</span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {records.length > 0 && (
           <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                 <Button
                    variant="outline"
                    size="icon"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-xl border-slate-200"
                 >
                    <ChevronLeft className="h-4 w-4" />
                 </Button>
                 <Button
                    variant="outline"
                    size="icon"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-xl border-slate-200"
                 >
                    <ChevronRight className="h-4 w-4" />
                 </Button>
              </div>
           </div>
         )}

         {!loading && records.length === 0 && (
           <div className="py-20 text-center flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                 <HistoryIcon className="h-10 w-10 text-slate-200" />
              </div>
              <h4 className="text-xl font-black text-slate-800 tracking-tight">No records found</h4>
              <p className="text-slate-500 font-medium max-w-sm mt-1">Try adjusting your filters or start a new campaign.</p>
           </div>
         )}
      </Card>
    </div>
  );
}
