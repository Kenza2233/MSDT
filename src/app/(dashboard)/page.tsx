"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ImageIcon,
  Users,
  Send,
  TrendingUp,
  Plus,
  ArrowRight,
  ExternalLink,
  History,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/activity/recent")
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (activityRes.ok) {
          const data = await activityRes.json();
          setRecentJobs(data.recentJobs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    { title: "Total Images", value: stats?.totalImages || 0, icon: ImageIcon, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Active Groups", value: stats?.activeGroups || 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Sent Today", value: stats?.sentToday || 0, icon: Send, color: "text-violet-600", bg: "bg-violet-100" },
    { title: "Total Sends", value: stats?.totalSends || 0, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || "User"}!
          </h2>
          <p className="text-slate-500 font-medium">
            {format(new Date(), "EEEE, MMMM do yyyy")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="rounded-xl shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700">
            <Link href="/send" className="gap-2">
              <Send className="h-4 w-4" /> Start Sending
            </Link>
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
            <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-white/50 backdrop-blur-sm px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600" /> Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg">
              <Link href="/history" className="gap-1 text-xs font-bold uppercase tracking-wider">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-400 italic">Loading activity...</div>
            ) : recentJobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-6 py-3">Job ID</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Progress</th>
                      <th className="px-6 py-3 text-right">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-700">#JOB-{job.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={cn(
                              "rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase border-none",
                              job.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                              job.status === "processing" ? "bg-indigo-100 text-indigo-700 animate-pulse" :
                              job.status === "failed" ? "bg-rose-100 text-rose-700" :
                              "bg-slate-100 text-slate-600"
                            )}
                          >
                            {job.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${(job.completedSends / (job.totalSends || 1)) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{job.completedSends}/{job.totalSends}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs text-slate-400 font-medium">
                            {format(new Date(job.createdAt), "MMM d, HH:mm")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <History className="h-8 w-8 text-slate-300" />
                </div>
                <h4 className="text-slate-800 font-bold mb-1">No activity yet</h4>
                <p className="text-sm text-slate-500 max-w-xs">Start your first campaign to see the history and logs here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
            <CardContent className="p-6">
              <h4 className="text-lg font-bold mb-2">Need help?</h4>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                Connect your bot and start adding groups to begin bulk sending images effortlessly.
              </p>
              <Button variant="secondary" size="sm" asChild className="bg-white/10 hover:bg-white/20 border-none text-white rounded-xl shadow-none backdrop-blur-sm w-full transition-all group">
                <Link href="/setup" className="gap-2">
                  Setup Guide <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-slate-50">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button variant="ghost" asChild className="w-full justify-start gap-3 h-12 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-semibold">
                <Link href="/upload">
                  <Plus className="h-4 w-4" /> Upload Images
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start gap-3 h-12 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-semibold">
                <Link href="/groups">
                  <Users className="h-4 w-4" /> Manage Groups
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start gap-3 h-12 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-semibold">
                <Link href="/settings">
                  <Settings className="h-4 w-4" /> Account Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
