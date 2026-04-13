"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ImageIcon,
  Trash2,
  CheckSquare,
  Square,
  Filter,
  Maximize2,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  MoreVertical,
  Info,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const fetchImages = async (pageNum: number, isNewSearch = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        search,
        status: statusFilter,
        sort
      });
      const res = await fetch(`/api/images?\${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (isNewSearch) {
          setImages(data.images);
        } else {
          setImages(prev => [...prev, ...data.images]);
        }
        setTotal(data.pagination.total);
        setHasMore(data.images.length === 20);
      }
    } catch (error) {
      toast.error("Failed to fetch images");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchImages(1, true);
  }, [search, statusFilter, sort]);

  useEffect(() => {
    if (page > 1) {
      fetchImages(page);
    }
  }, [page]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map(img => img.id)));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete \${selectedIds.size} images?`)) return;
    try {
      const res = await fetch("/api/images/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        toast.success("Images deleted successfully");
        setImages(images.filter(img => !selectedIds.has(img.id)));
        setSelectedIds(new Set());
        setSelectMode(false);
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleUpdateCaption = async (id: string, caption: string) => {
    try {
      await fetch(`/api/images/\${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      });
      setImages(images.map(img => img.id === id ? { ...img, caption } : img));
    } catch (error) {
      toast.error("Failed to update caption");
    }
  };

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gallery</h2>
          <p className="text-muted-foreground">Manage and preview your uploaded images.</p>
        </div>
        <div className="flex gap-2">
          {selectMode ? (
            <>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedIds.size === images.length ? "Deselect All" : "Select All"}
              </Button>
              <Button variant="destructive" size="sm" onClick={bulkDelete} disabled={selectedIds.size === 0}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete (\${selectedIds.size})
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setSelectMode(true)}>
              Select Mode
            </Button>
          )}
          <Button asChild size="sm">
            <Link href="/upload">
               <Plus className="h-4 w-4 mr-2" /> Upload
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search filenames..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="largest">Largest</SelectItem>
              <SelectItem value="smallest">Smallest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground font-medium">
        Showing {images.length} of {total} images
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
              selectedIds.has(image.id) ? "border-blue-600 ring-2 ring-blue-600/20" : "border-transparent bg-slate-100"
            )}
            onClick={() => selectMode ? toggleSelect(image.id) : setLightboxIndex(index)}
          >
            <img
              src={image.thumbnailPath}
              alt={image.originalName}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />

            <div className={cn(
              "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
              selectMode && "hidden"
            )}>
              <div className="flex gap-2">
                 <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                   <Maximize2 className="h-4 w-4" />
                 </Button>
                 <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" asChild onClick={(e) => e.stopPropagation()}>
                   <Link href={`/send?imageId=\${image.id}`}>
                    <Send className="h-4 w-4" />
                   </Link>
                 </Button>
              </div>
            </div>

            {selectMode && (
              <div className="absolute top-2 left-2 z-10">
                {selectedIds.has(image.id) ? (
                  <CheckSquare className="h-5 w-5 text-blue-600 fill-white" />
                ) : (
                  <Square className="h-5 w-5 text-white/80" />
                )}
              </div>
            )}

            <div className="absolute top-2 right-2">
              <Badge
                variant={image.status === "sent" ? "success" : "secondary"}
                className="text-[9px] h-4 px-1 capitalize"
              >
                {image.status}
              </Badge>
            </div>
          </div>
        ))}

        {isLoading && Array(10).fill(0).map((_, i) => (
          <Skeleton key={`skeleton-\${i}`} className="aspect-square rounded-lg" />
        ))}
      </div>

      <div ref={lastElementRef} className="h-10 flex items-center justify-center">
        {isLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
        {!hasMore && images.length > 0 && <span className="text-sm text-muted-foreground">End of gallery</span>}
      </div>

      {!isLoading && images.length === 0 && (
        <div className="text-center py-20 bg-white border rounded-xl">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-slate-200" />
          <h3 className="text-lg font-bold">No images found</h3>
          <p className="text-muted-foreground mb-6">Upload some images to start your first campaign.</p>
          <Button asChild>
            <Link href="/upload">Upload Now</Link>
          </Button>
        </div>
      )}

      {lightboxIndex !== null && currentImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col text-white select-none">
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[200px] md:max-w-md">{currentImage.originalName}</span>
              <span className="text-[10px] text-white/50">{currentImage.width}x{currentImage.height} • {formatFileSize(currentImage.fileSize)} • {formatDate(currentImage.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" className="hover:bg-white/10" onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}>
                 <ZoomIn className="h-5 w-5" />
               </Button>
               <Button variant="ghost" size="icon" className="hover:bg-white/10" onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))}>
                 <ZoomOut className="h-5 w-5" />
               </Button>
               <Button variant="ghost" size="icon" className="hover:bg-white/10" onClick={() => setZoom(1)}>
                 <RotateCcw className="h-5 w-5" />
               </Button>
               <div className="w-px h-6 bg-white/20 mx-2" />
               <Button variant="ghost" size="icon" className="hover:bg-white/10" onClick={() => setLightboxIndex(null)}>
                 <X className="h-6 w-6" />
               </Button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-10 h-12 w-12 rounded-full bg-white/5 hover:bg-white/20"
              onClick={() => setLightboxIndex(prev => prev! > 0 ? prev! - 1 : images.length - 1)}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <div
              className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
              style={{ transform: `scale(\${zoom})` }}
              onDoubleClick={() => setZoom(prev => prev === 1 ? 2 : 1)}
            >
              <img
                src={currentImage.filePath}
                alt={currentImage.originalName}
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-10 h-12 w-12 rounded-full bg-white/5 hover:bg-white/20"
              onClick={() => setLightboxIndex(prev => prev! < images.length - 1 ? prev! + 1 : 0)}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>

          <div className="bg-black/80 backdrop-blur-md p-6 border-t border-white/10">
            <div className="max-w-3xl mx-auto space-y-4">
               <div className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2">
                   <Info className="h-4 w-4 text-blue-400" />
                   <span className="font-bold">Caption</span>
                   <span className="text-white/40 text-[10px]">Saved on blur</span>
                 </div>
                 <span className="text-white/60">{lightboxIndex + 1} / {images.length}</span>
               </div>
               <Input
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                placeholder="Write a caption for this image..."
                defaultValue={currentImage.caption || ""}
                onBlur={(e) => handleUpdateCaption(currentImage.id, e.target.value)}
               />

               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 {images.map((img, i) => (
                   <div
                    key={`strip-\${img.id}`}
                    className={cn(
                      "h-12 w-12 rounded overflow-hidden shrink-0 cursor-pointer border-2 transition-all",
                      i === lightboxIndex ? "border-blue-500 scale-110" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                    onClick={() => setLightboxIndex(i)}
                   >
                     <img src={img.thumbnailPath} className="h-full w-full object-cover" />
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
