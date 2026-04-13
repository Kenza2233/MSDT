"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Filter,
  Trash2,
  LayoutGrid,
  CheckSquare,
  Square,
  Image as ImageIcon,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Calendar,
  Layers,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        sort,
        limit: "100"
      });
      const res = await fetch(`/api/images?${params}`);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
      }
    } catch (err) {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === images.length) setSelectedIds([]);
    else setSelectedIds(images.map(img => img.id));
  };

  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} images?`)) return;

    try {
      const res = await fetch("/api/images/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        toast.success("Images deleted successfully");
        setImages(prev => prev.filter(img => !selectedIds.includes(img.id)));
        setSelectedIds([]);
        setIsSelectMode(false);
      }
    } catch (err) {
      toast.error("Failed to delete images");
    }
  };

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Media Gallery</h2>
          <p className="text-slate-500 font-medium mt-1">Manage and preview all your uploaded assets</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant={isSelectMode ? "secondary" : "outline"}
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedIds([]);
            }}
            className="rounded-xl font-bold gap-2 h-12 px-6"
          >
            {isSelectMode ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
            {isSelectMode ? "Cancel Select" : "Select Mode"}
          </Button>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl font-bold shadow-lg shadow-indigo-500/20 gap-2">
            <Link href="/upload"><ImageIcon className="h-4 w-4" /> Upload More</Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Search by filename or caption..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm focus:shadow-md"
              />
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
               <div className="flex items-center gap-2 text-slate-400 bg-slate-100/50 p-1 rounded-xl">
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-[160px] h-10 border-none bg-transparent shadow-none font-bold text-slate-600">
                      <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5" />
                        <SelectValue placeholder="Sort By" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="largest">Largest Size</SelectItem>
                      <SelectItem value="name">Filename A-Z</SelectItem>
                    </SelectContent>
                  </Select>
               </div>

               {isSelectMode && (
                 <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                 >
                    <Button variant="outline" size="sm" onClick={selectAll} className="rounded-lg font-bold border-slate-200">
                      {selectedIds.length === images.length ? "Deselect All" : "Select All"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteBulk}
                      disabled={selectedIds.length === 0}
                      className="rounded-lg font-bold bg-rose-500 hover:bg-rose-600"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" /> Delete ({selectedIds.length})
                    </Button>
                 </motion.div>
               )}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && images.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1,2,3,4,5,6,7,8,9,10].map(i => (
            <div key={i} className="aspect-square rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence>
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className={cn(
                  "relative aspect-square rounded-[2rem] overflow-hidden group cursor-pointer transition-all duration-500",
                  isSelectMode && selectedIds.includes(img.id) ? "ring-8 ring-indigo-500/20 scale-95" : "hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                )}
                onClick={() => isSelectMode ? toggleSelect(img.id) : setLightboxIndex(i)}
              >
                <img
                  src={img.thumbnailPath || img.filePath}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={img.filename}
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-white truncate max-w-[100px] bg-black/20 backdrop-blur-md px-2 py-1 rounded-md uppercase tracking-widest">
                        {img.filename.split('.').pop()}
                      </p>
                      <div className="flex gap-1">
                        <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-md text-white flex items-center justify-center">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </div>
                      </div>
                   </div>
                </div>

                {isSelectMode && (
                  <div className="absolute top-4 right-4">
                    {selectedIds.includes(img.id) ? (
                      <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg ring-4 ring-white">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-white/50 backdrop-blur-md border-2 border-white flex items-center justify-center shadow-lg">
                        <Square className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                )}

                {img.status === "sent" && (
                   <div className="absolute top-4 left-4">
                      <Badge className="bg-emerald-500/80 backdrop-blur-md border-none text-[8px] font-black uppercase tracking-tighter">Sent</Badge>
                   </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center px-6 bg-white/50 border-4 border-dashed border-slate-200 rounded-[3rem]">
          <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <ImageIcon className="h-12 w-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Your gallery is empty</h3>
          <p className="text-slate-500 font-medium max-w-sm mb-8">Start by uploading some images to your library to build your first campaign.</p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl font-bold">
            <Link href="/upload">Upload Your First Image</Link>
          </Button>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center gap-4">
                 <button
                  onClick={() => setLightboxIndex(null)}
                  className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all"
                 >
                   <X className="h-6 w-6" />
                 </button>
                 <div className="hidden sm:block">
                   <h4 className="text-white font-bold truncate max-w-[200px]">{currentImage.filename}</h4>
                   <p className="text-slate-400 text-xs font-medium">{formatFileSize(currentImage.fileSize)} • {currentImage.width}x{currentImage.height}</p>
                 </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="text-white rounded-xl hover:bg-white/10 gap-2">
                   <Download className="h-4 w-4" /> <span className="hidden sm:inline">Download</span>
                </Button>
                <Button variant="ghost" className="text-white rounded-xl hover:bg-white/10 gap-2" asChild>
                   <Link href="/send">
                      <Send className="h-4 w-4" /> <span className="hidden sm:inline">Use in Campaign</span>
                   </Link>
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <button
              onClick={() => setLightboxIndex(prev => prev! > 0 ? prev! - 1 : images.length - 1)}
              className="absolute left-6 h-16 w-16 rounded-3xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center backdrop-blur-sm transition-all z-10"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={() => setLightboxIndex(prev => prev! < images.length - 1 ? prev! + 1 : 0)}
              className="absolute right-6 h-16 w-16 rounded-3xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center backdrop-blur-sm transition-all z-10"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            {/* Main Image */}
            <motion.div
              key={currentImage.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="max-w-[85vw] max-h-[70vh] relative"
            >
              <img
                src={currentImage.filePath}
                className="max-w-full max-h-[70vh] rounded-3xl shadow-2xl"
                alt={currentImage.filename}
              />
            </motion.div>

            {/* Bottom Info Panel */}
            <div className="absolute bottom-12 max-w-2xl w-full px-6">
              <Card className="bg-white/10 backdrop-blur-2xl border-white/10 text-white rounded-[2rem] shadow-2xl overflow-hidden">
                 <CardContent className="p-8">
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Uploaded</p>
                        <p className="text-sm font-bold">{formatDate(currentImage.createdAt)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Layers className="h-3 w-3" /> Format</p>
                        <p className="text-sm font-bold uppercase">{currentImage.mimeType.split('/')[1]}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Info className="h-3 w-3" /> Status</p>
                        <Badge className={cn(
                          "rounded-lg px-2 py-0 text-[10px] font-black uppercase tracking-widest border-none",
                          currentImage.status === "sent" ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                        )}>{currentImage.status}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Trash2 className="h-3 w-3" /> Actions</p>
                        <button className="text-rose-400 hover:text-rose-300 text-sm font-bold transition-colors">Delete File</button>
                      </div>
                   </div>
                   <div className="mt-8 pt-8 border-t border-white/10">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Caption</p>
                     <p className="text-slate-200 font-medium leading-relaxed italic">
                        {currentImage.caption || "No caption provided for this media."}
                     </p>
                   </div>
                 </CardContent>
              </Card>
              <div className="mt-6 flex justify-center gap-2">
                 {images.slice(Math.max(0, lightboxIndex - 3), Math.min(images.length, lightboxIndex + 4)).map((img, idx) => (
                   <button
                    key={img.id}
                    onClick={() => setLightboxIndex(images.findIndex(i => i.id === img.id))}
                    className={cn(
                      "h-12 w-12 rounded-xl overflow-hidden border-2 transition-all",
                      img.id === currentImage.id ? "border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20" : "border-transparent opacity-40 hover:opacity-100"
                    )}
                   >
                     <img src={img.thumbnailPath || img.filePath} className="h-full w-full object-cover" />
                   </button>
                 ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
