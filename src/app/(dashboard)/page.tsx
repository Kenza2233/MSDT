"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Users,
  Send,
  CheckCircle2,
  Upload,
  ArrowRight,
  Sparkles,
  TrendingUp,
  History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatDate, timeAgo } from "@/lib/utils";


export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalImages: 0,
    totalGroups: 0,
    sentToday: 0,
    successRate: 100,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/activity/recent")
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (activityRes.ok) setRecentActivity(await activityRes.json());
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    { title: "Total Images", value: stats.totalImages, icon: ImageIcon, color: "text-blue-600", bg: "bg-blue-100", gradient: "from-blue-600 to-indigo-600" },
    { title: "Active Groups", value: stats.totalGroups, icon: Users, color: "text-emerald-600", bg: "bg-emerald-100", gradient: "from-emerald-600 to-teal-600" },
    { title: "Sent Today", value: stats.sentToday, icon: Send, color: "text-violet-600", bg: "bg-violet-100", gradient: "from-violet-600 to-purple-600" },
    { title: "Success Rate", value: `${stats.successRate}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-100", gradient: "from-amber-600 to-orange-600" },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-8 lg:p-12 text-white shadow-2xl animate-scale-in">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-bold animate-float">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Empower your Telegram marketing
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Welcome to <span className="italic">BulkSender!</span>
          </h1>
          <p className="text-blue-100 text-lg font-medium leading-relaxed max-w-xl">
            Effortlessly broadcast high-quality images to all your Telegram groups and channels with precision and speed.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 font-bold h-12 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95">
              <Link href="/send" className="gap-2">Start Campaign <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 font-bold h-12 px-8 rounded-xl backdrop-blur-sm">
              <Link href="/upload" className="gap-2">Upload Media</Link>
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 animate-float">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 rotate-6 shadow-2xl">
                <Send className="h-24 w-24 text-white opacity-40" />
            </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="group hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-4 rounded-2xl transition-all duration-300 group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.title}</p>
                  <h3 className="text-3xl font-black text-slate-800 mt-1">{loading ? "..." : stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 overflow-hidden animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-600" /> Recent Activity
              </CardTitle>
              <p className="text-sm text-slate-500 font-medium">Your latest message broadcasts</p>
            </div>
            <Button variant="ghost" asChild className="text-indigo-600 font-bold hover:bg-indigo-50">
              <Link href="/history">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
                <div className="p-8 text-center text-slate-400 font-bold">Loading activity...</div>
            ) : recentActivity.length === 0 ? (
                <div className="p-16 flex flex-col items-center text-center">
                    <div className="bg-slate-100 p-6 rounded-full mb-4">
                        <History className="h-10 w-10 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-700">No activity yet</h4>
                    <p className="text-slate-500">Your sending history will appear here once you start a campaign.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-50 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                <th className="px-6 py-4 text-left">Media</th>
                                <th className="px-6 py-4 text-left">Target Group</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentActivity.map((rec, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200">
                                                <img src={rec.image.thumbnailPath || rec.image.filePath} className="h-full w-full object-cover" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{rec.image.fileName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-600">{rec.group.title}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                            rec.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                        )}>
                                            <div className={cn("h-1.5 w-1.5 rounded-full", rec.status === 'sent' ? 'bg-emerald-500' : 'bg-rose-500')} />
                                            {rec.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-xs font-bold text-slate-400">{timeAgo(rec.createdAt)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Quick Shortcuts</h3>
            <div className="grid grid-cols-1 gap-4">
                {[
                    { label: "Upload Images", icon: Upload, href: "/upload", color: "from-blue-500 to-indigo-600" },
                    { label: "Start Sending", icon: Send, href: "/send", color: "from-violet-500 to-purple-600" },
                    { label: "View Gallery", icon: ImageIcon, href: "/gallery", color: "from-emerald-500 to-teal-600" }
                ].map((action, i) => (
                    <Button key={i} asChild variant="ghost" className="p-0 h-auto w-full animate-fade-in-up hover:bg-transparent" style={{ animationDelay: `${500 + i * 100}ms` }}>
                        <Link href={action.href}>
                            <Card className="w-full border-0 shadow-md hover-lift overflow-hidden">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className={cn("p-3 rounded-xl text-white shadow-lg", "bg-gradient-to-br", action.color)}>
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-black text-slate-800 tracking-tight">{action.label}</h4>
                                        <p className="text-xs text-slate-500 font-medium">One-click access</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-300" />
                                </CardContent>
                            </Card>
                        </Link>
                    </Button>
                ))}
            </div>

            <Card className="bg-slate-900 border-0 shadow-2xl text-white overflow-hidden animate-fade-in-up" style={{ animationDelay: "800ms" }}>
                <CardContent className="p-8 space-y-4">
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 mb-2">
                        <Sparkles className="h-6 w-6 text-amber-400" />
                    </div>
                    <h4 className="text-lg font-black tracking-tight">Need Help?</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                        Go to Settings to configure your Telegram Bot Token and ID. Make sure your bot is an Admin in the target groups.
                    </p>
                    <Button asChild className="w-full bg-white text-slate-900 hover:bg-blue-50 font-black h-12 rounded-xl">
                        <Link href="/settings">Configure Bot</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
