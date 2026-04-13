"use client";
import { useState, useEffect } from "react";
import { User, Bot, Trash2, Save, Lock, AlertTriangle, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
export default function SettingsPage() {
  const { user } = useAuth();
  const [botConnected, setBotConnected] = useState(false);
  const [botToken, setBotToken] = useState("");
  useEffect(() => { fetch("/api/settings/bot-info").then(res => res.json()).then(data => setBotConnected(data.connected)); }, []);
  const updateBotToken = async () => {
    const res = await fetch("/api/auth/bot-token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ botToken }) });
    if (res.ok) { toast.success("Token updated"); setBotConnected(true); setBotToken(""); }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <h2 className="text-3xl font-bold">Settings</h2>
      <Card>
        <CardHeader><CardTitle>Bot Connection</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center"><Label>Status</Label><Badge variant={botConnected ? "success" : "destructive"}>{botConnected ? "Connected" : "Disconnected"}</Badge></div>
          <div className="flex gap-2"><Input value={botToken} onChange={e => setBotToken(e.target.value)} placeholder="New bot token..." /><Button onClick={updateBotToken}>Update</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Danger Zone</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button variant="destructive" onClick={() => fetch("/api/settings/images", { method: "DELETE" }).then(() => toast.success("Deleted"))}>Delete All Images</Button>
          <Button variant="destructive" className="ml-4" onClick={() => fetch("/api/settings/history", { method: "DELETE" }).then(() => toast.success("Cleared"))}>Clear History</Button>
        </CardContent>
      </Card>
    </div>
  );
}
