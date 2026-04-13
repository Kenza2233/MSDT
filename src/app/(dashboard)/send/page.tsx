"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Send, Users, ImageIcon, Search, Check, X, Loader2, AlertCircle, CheckCircle2, Clock, Layers, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SendPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [caption, setCaption] = useState("");
  const [delay, setDelay] = useState([3]);
  const [sendAsAlbum, setSendAsAlbum] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [g, i] = await Promise.all([fetch("/api/groups"), fetch("/api/images?limit=100")]);
        if (g.ok) setGroups((await g.json()).groups);
        if (i.ok) setImages((await i.json()).images);
      } finally { setIsLoadingData(false); }
    }
    fetchData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSending && currentJobId) {
      interval = setInterval(async () => {
        const res = await fetch(`/api/send/status/\${currentJobId}`);
        if (res.ok) {
          const data = await res.json();
          setJobStatus(data.job);
          if (data.job.status === "completed" || data.job.status === "cancelled") setIsSending(false);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSending, currentJobId]);

  const handleStartSend = async () => {
    setIsSending(true);
    const res = await fetch("/api/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageIds: Array.from(selectedImageIds), groupIds: Array.from(selectedGroupIds), caption, delayMs: delay[0] * 1000, sendAsAlbum }) });
    if (res.ok) setCurrentJobId((await res.json()).jobId);
    else setIsSending(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6 h-[500px]">
        <Card className="flex-1 flex flex-col">
          <CardHeader><CardTitle>Groups</CardTitle></CardHeader>
          <ScrollArea className="flex-1">
            {groups.map(g => (
              <div key={g.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer" onClick={() => {
                const next = new Set(selectedGroupIds);
                if (next.has(g.id)) next.delete(g.id); else next.add(g.id);
                setSelectedGroupIds(next);
              }}>
                <Checkbox checked={selectedGroupIds.has(g.id)} />
                <span>{g.name}</span>
              </div>
            ))}
          </ScrollArea>
        </Card>
        <Card className="flex-[1.5] flex flex-col">
          <CardHeader><CardTitle>Images</CardTitle></CardHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-4 gap-3">
              {images.map(img => (
                <div key={img.id} className={cn("aspect-square relative rounded border-2", selectedImageIds.has(img.id) ? "border-blue-600" : "border-transparent")} onClick={() => {
                  const next = new Set(selectedImageIds);
                  if (next.has(img.id)) next.delete(img.id); else next.add(img.id);
                  setSelectedImageIds(next);
                }}>
                  <img src={img.thumbnailPath} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
      <Card className="p-4 flex gap-4 items-center">
        <Textarea placeholder="Caption..." value={caption} onChange={e => setCaption(e.target.value)} className="flex-1" />
        <div className="w-48"><Label>Delay: {delay[0]}s</Label><Slider value={delay} onValueChange={setDelay} min={1} max={10} step={1} /></div>
        <Button size="lg" disabled={selectedGroupIds.size === 0 || selectedImageIds.size === 0 || isSending} onClick={handleStartSend}>Send Now</Button>
      </Card>

      {isSending && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Sending...</h3>
            <Progress value={(jobStatus?.completedSends || 0) / (jobStatus?.totalSends || 1) * 100} className="mb-4" />
            <div className="text-center">{jobStatus?.completedSends || 0} / {jobStatus?.totalSends || 0}</div>
            <Button variant="destructive" className="w-full mt-6" onClick={() => setIsSending(false)}>Close Overlay</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
