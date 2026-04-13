"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Send,
  ImageIcon,
  Users,
  Search,
  CheckCircle2,
  X,
  Clock,
  Layers,
  Info,
  ChevronRight,
  Loader2,
  AlertCircle,
  Play,
  History as HistoryIcon,
  Trash2
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

export default function SendPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Search state
  const [groupSearch, setGroupSearch] = useState("");
  const [imageSearch, setImageSearch] = useState("");

  // Job Options
  const [caption, setCaption] = useState("");
  const [delay, setDelay] = useState(3);
  const [sendAsAlbum, setSendAsAlbum] = useState(true);

  // Sending State
  const [isSending, setIsSending] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gRes, iRes] = await Promise.all([
          fetch("/api/groups"),
          fetch("/api/images")
        ]);
        if (gRes.ok) {
          const gData = await gRes.json();
          setGroups(gData.groups);
        }
        if (iRes.ok) {
          const iData = await iRes.json();
          setImages(iData.images);
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Polling for progress
  useEffect(() => {
    let interval: any;
    if (isSending && activeJobId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/send/status/${activeJobId}`);
          if (res.ok) {
            const data = await res.json();
            setJobProgress(data.job);
            if (data.job.status === "completed" || data.job.status === "failed") {
              setIsSending(false);
              toast.success("Sending job completed!");
            }
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSending, activeJobId]);

  const filteredGroups = useMemo(() =>
    groups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()) || g.chatId.includes(groupSearch)),
  [groups, groupSearch]);

  const filteredImages = useMemo(() =>
    images.filter(i => i.filename.toLowerCase().includes(imageSearch.toLowerCase()) || (i.caption && i.caption.toLowerCase().includes(imageSearch.toLowerCase()))),
  [images, imageSearch]);

  const handleStartSending = async () => {
    if (selectedGroups.length === 0 || selectedImages.length === 0) {
      return toast.error("Select at least one group and one image");
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupIds: selectedGroups,
          imageIds: selectedImages,
          caption,
          delayMs: delay * 1000,
          sendAsAlbum
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveJobId(data.jobId);
        toast.success("Campaign started successfully!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to start campaign");
        setIsSending(false);
      }
    } catch (err) {
      toast.error("An error occurred");
      setIsSending(false);
    }
  };

  const toggleGroup = (id: string) => {
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleImage = (id: string) => {
    setSelectedImages(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalProjected = selectedGroups.length * selectedImages.length;
  const estimatedSeconds = selectedGroups.length * (selectedImages.length > 1 && sendAsAlbum ? Math.ceil(selectedImages.length / 10) : selectedImages.length) * (delay || 1);

  return (
    <div className="max-w-[1600px] mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create Campaign</h2>
          <p className="text-slate-500 font-medium mt-1">Configure and blast your media to groups</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" asChild className="rounded-xl font-bold gap-2">
              <Link href="/history"><HistoryIcon className="h-4 w-4" /> View History</Link>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Selection Panels */}
        <div className="xl:col-span-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Group Selection */}
            <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl h-[600px] flex flex-col">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" /> Target Groups
                  </CardTitle>
                  <Badge className="bg-indigo-100 text-indigo-600 border-none rounded-lg px-2 py-0.5 text-[10px] font-black uppercase">
                    {selectedGroups.length} Selected
                  </Badge>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    placeholder="Search groups..."
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    className="pl-11 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:shadow-md transition-all"
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setSelectedGroups(groups.map(g => g.id))}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
                  >Select All</button>
                   <button
                    onClick={() => setSelectedGroups([])}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:underline"
                  >Clear</button>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-hidden">
                <ScrollArea className="h-full px-4">
                  <div className="space-y-2 pb-4">
                    {filteredGroups.map(group => (
                      <div
                        key={group.id}
                        onClick={() => toggleGroup(group.id)}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group",
                          selectedGroups.includes(group.id)
                            ? "bg-indigo-50 border-indigo-500 shadow-sm"
                            : "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50/50"
                        )}
                      >
                         <div className={cn(
                           "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors",
                           selectedGroups.includes(group.id) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                         )}>
                            {group.name.charAt(0)}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className={cn("text-sm font-bold truncate", selectedGroups.includes(group.id) ? "text-indigo-900" : "text-slate-700")}>{group.name}</p>
                           <p className="text-[10px] font-mono text-slate-400">{group.chatId}</p>
                         </div>
                         {selectedGroups.includes(group.id) && (
                           <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                         )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Image Selection */}
            <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl h-[600px] flex flex-col">
              <CardHeader className="p-8 pb-4">
                 <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-indigo-600" /> Select Media
                  </CardTitle>
                  <Badge className="bg-indigo-100 text-indigo-600 border-none rounded-lg px-2 py-0.5 text-[10px] font-black uppercase">
                    {selectedImages.length} Selected
                  </Badge>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    placeholder="Filter images..."
                    value={imageSearch}
                    onChange={(e) => setImageSearch(e.target.value)}
                    className="pl-11 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:shadow-md transition-all"
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setSelectedImages(images.map(i => i.id))}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
                  >Select All</button>
                   <button
                    onClick={() => setSelectedImages([])}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:underline"
                  >Clear</button>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-hidden">
                <ScrollArea className="h-full px-4">
                   <div className="grid grid-cols-2 gap-3 pb-4">
                      {filteredImages.map(img => (
                        <div
                          key={img.id}
                          onClick={() => toggleImage(img.id)}
                          className={cn(
                            "aspect-square rounded-[1.5rem] overflow-hidden relative cursor-pointer group transition-all duration-300",
                            selectedImages.includes(img.id) ? "ring-4 ring-indigo-500 scale-95 shadow-lg" : "hover:scale-105"
                          )}
                        >
                          <img src={img.thumbnailPath || img.filePath} className="h-full w-full object-cover" />
                          <div className={cn(
                            "absolute inset-0 bg-indigo-900/40 flex items-center justify-center opacity-0 transition-opacity",
                            selectedImages.includes(img.id) && "opacity-100"
                          )}>
                             <CheckCircle2 className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ))}
                   </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Configuration */}
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl">
             <CardHeader className="p-8">
               <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                  <Send className="h-5 w-5 text-indigo-600" /> Campaign Settings
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-0 space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <label className="text-xs font-black uppercase tracking-widest text-slate-400">Custom Caption (Optional)</label>
                     <span className={cn("text-xs font-bold", caption.length > 1024 ? "text-rose-500" : "text-slate-400")}>
                       {caption.length}/1024
                     </span>
                   </div>
                   <Textarea
                      placeholder="Enter the caption to be sent with the images..."
                      className="rounded-2xl border-slate-200 h-32 bg-white/50 focus:bg-white transition-all p-4 font-medium"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                   />
                   <p className="text-[10px] text-slate-400 font-medium italic">
                     If left blank, each image's individual caption will be used.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                           <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Delay Interval</p>
                           <p className="text-xs text-slate-400 font-medium">Wait between messages to avoid rate limits.</p>
                         </div>
                         <Badge className="bg-indigo-600 text-white border-none rounded-lg px-3 py-1 font-black">{delay}s</Badge>
                      </div>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[delay]}
                        onValueChange={([val]) => setDelay(val)}
                        className="py-4"
                      />
                   </div>

                   <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                           <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Send as Album</p>
                           <p className="text-xs text-slate-400 font-medium">Batch images into media groups (max 10).</p>
                         </div>
                         <Switch
                            checked={sendAsAlbum}
                            onCheckedChange={setSendAsAlbum}
                         />
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="xl:col-span-4 space-y-8">
           <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-slate-900 text-white sticky top-8">
              <CardHeader className="p-10 pb-0">
                 <h3 className="text-2xl font-black tracking-tight">Campaign Summary</h3>
                 <p className="text-slate-400 font-medium mt-1">Review your blast before launching</p>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Messages</span>
                       <span className="text-2xl font-black">{totalProjected}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Target Groups</span>
                       <span className="text-xl font-black text-indigo-400">{selectedGroups.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Media Files</span>
                       <span className="text-xl font-black text-violet-400">{selectedImages.length}</span>
                    </div>
                    <div className="h-px bg-slate-800 w-full" />
                    <div className="flex items-center justify-between">
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5"><Clock className="h-3 w-3" /> Est. Time</span>
                       <span className="text-lg font-black">{Math.floor(estimatedSeconds / 60)}m {estimatedSeconds % 60}s</span>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4">
                   <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                      <div className="mt-1 h-5 w-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                         <Info className="h-3 w-3" />
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                        Please ensure the bot has administrator rights in the selected groups before starting the campaign.
                      </p>
                   </div>

                   <Button
                    onClick={handleStartSending}
                    disabled={selectedGroups.length === 0 || selectedImages.length === 0 || isSending}
                    className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-lg font-black shadow-2xl shadow-indigo-600/20 gap-3 group transition-all"
                   >
                     {isSending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Play className="h-6 w-6 group-hover:translate-x-1 transition-transform" />}
                     {isSending ? "Processing..." : "LAUNCH CAMPAIGN"}
                   </Button>
                 </div>
              </CardContent>
           </Card>

           {isSending && activeJobId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border-4 border-indigo-100">
                   <CardHeader className="p-8 pb-4">
                      <div className="flex items-center justify-between">
                         <CardTitle className="text-lg font-black text-slate-900">Active Progress</CardTitle>
                         <Badge className="bg-indigo-600 text-white animate-pulse">Running</Badge>
                      </div>
                   </CardHeader>
                   <CardContent className="p-8 pt-4 space-y-6">
                      <div className="space-y-2">
                         <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                           <span>Sending Status</span>
                           <span className="text-indigo-600">{jobProgress?.completedSends || 0} / {jobProgress?.totalSends || totalProjected}</span>
                         </div>
                         <Progress value={((jobProgress?.completedSends || 0) / (jobProgress?.totalSends || totalProjected || 1)) * 100} className="h-3 rounded-full" />
                      </div>

                      <div className="flex gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                         <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                            <Loader2 className="h-5 w-5 animate-spin" />
                         </div>
                         <div className="min-w-0">
                            <p className="text-xs font-bold text-indigo-900 truncate">
                               Current Job: #{activeJobId.substring(0,8)}
                            </p>
                            <p className="text-[10px] text-indigo-500 font-medium italic">
                               Distributing media to {selectedGroups.length} groups...
                            </p>
                         </div>
                      </div>

                      <div className="pt-2">
                         <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 font-bold gap-2">
                           <X className="h-4 w-4" /> Cancel Campaign
                         </Button>
                      </div>
                   </CardContent>
                </Card>
              </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}
