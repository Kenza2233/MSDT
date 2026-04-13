"use client";
import { useEffect, useState } from "react";
import { History, Search, Download, RefreshCw, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/history?page=\${page}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
        setTotalPages(data.pagination.pages);
      }
      const sRes = await fetch("/api/history/stats");
      if (sRes.ok) setStats(await sRes.json());
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [page]);

  const retrySingle = async (id: string) => {
    const res = await fetch(`/api/history/retry/\${id}`, { method: "POST" });
    if (res.ok) { toast.success("Retry started"); fetchHistory(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Send History</h2>
        <Button variant="outline" size="sm" onClick={() => {
          fetch("/api/history/export").then(res => res.blob()).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "history.csv"; a.click();
          });
        }}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-green-50 border-none"><CardContent className="p-4 text-center"><p className="text-xs font-bold text-green-600 uppercase">Sent</p><p className="text-2xl font-bold">{stats?.totalSent || 0}</p></CardContent></Card>
        <Card className="bg-blue-50 border-none"><CardContent className="p-4 text-center"><p className="text-xs font-bold text-blue-600 uppercase">Today</p><p className="text-2xl font-bold">{stats?.sentToday || 0}</p></CardContent></Card>
        <Card className="bg-red-50 border-none"><CardContent className="p-4 text-center"><p className="text-xs font-bold text-red-600 uppercase">Failed</p><p className="text-2xl font-bold">{stats?.failedRecent || 0}</p></CardContent></Card>
        <Card className="bg-purple-50 border-none"><CardContent className="p-4 text-center"><p className="text-xs font-bold text-purple-600 uppercase">Rate</p><p className="text-2xl font-bold">{stats?.successRate || 100}%</p></CardContent></Card>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b font-medium text-muted-foreground">
            <tr><th className="p-4">Date</th><th className="p-4">Image</th><th className="p-4">Group</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? Array(3).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="p-4"><Skeleton className="h-10 w-full" /></td></tr>) :
              records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-4 text-xs">{formatDate(r.createdAt)}</td>
                  <td className="p-4 truncate max-w-[150px]">{r.image.originalName}</td>
                  <td className="p-4">{r.group.name}</td>
                  <td className="p-4"><Badge variant={r.status === "sent" ? "success" : r.status === "failed" ? "destructive" : "secondary"}>{r.status}</Badge></td>
                  <td className="p-4 text-right">{r.status === "failed" && <Button size="sm" variant="ghost" onClick={() => retrySingle(r.id)}>Retry</Button>}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {totalPages > 1 && <div className="p-4 flex justify-between bg-slate-50 border-t"><Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button><span>{page} / {totalPages}</span><Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button></div>}
      </Card>
    </div>
  );
}
