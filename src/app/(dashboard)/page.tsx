"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ImageIcon,
  Users,
  Send,
  BarChart3,
  Plus,
  History,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          setActivity(data.activity);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Images",
      value: stats?.totalImages ?? 0,
      icon: ImageIcon,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Active Groups",
      value: stats?.totalGroups ?? 0,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Sent Today",
      value: stats?.sentToday ?? 0,
      icon: Send,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Success Rate",
      value: `${stats?.successRate ?? 100}%`,
      icon: BarChart3,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your Telegram campaigns today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bg} p-2 rounded-md`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-blue-500 transition-colors cursor-pointer group">
          <Link href="/upload">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-full text-white group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Upload Images</h3>
                <p className="text-sm text-muted-foreground">Add new media to gallery</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-green-500 transition-colors cursor-pointer group">
          <Link href="/send">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-600 p-3 rounded-full text-white group-hover:scale-110 transition-transform">
                <Send className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Start Sending</h3>
                <p className="text-sm text-muted-foreground">Bulk send to your groups</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-purple-500 transition-colors cursor-pointer group">
          <Link href="/gallery">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-purple-600 p-3 rounded-full text-white group-hover:scale-110 transition-transform">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">View Gallery</h3>
                <p className="text-sm text-muted-foreground">Manage your uploaded media</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Link>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/history" className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : activity.length > 0 ? (
            <div className="divide-y">
              {activity.map((record) => (
                <div key={record.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-10 w-10 bg-slate-100 rounded overflow-hidden flex-shrink-0 relative">
                    {record.image.thumbnailPath ? (
                      <img
                        src={record.image.thumbnailPath}
                        alt={record.image.originalName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 m-auto text-slate-400 absolute inset-0" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {record.image.originalName} <span className="text-muted-foreground mx-1">→</span> {record.group.name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(record.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={record.status === "sent" ? "success" : record.status === "failed" ? "destructive" : "secondary"}
                    className="capitalize"
                  >
                    {record.status === "sent" ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : record.status === "failed" ? (
                      <XCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No recent activity</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Once you start sending images, your activity will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
