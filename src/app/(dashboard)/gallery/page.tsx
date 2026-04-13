"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Trash2,
  LayoutGrid,
  CheckCircle2,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Layers,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";


export default function GalleryPage() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isEditingCaption, setIsEditingCaption] = useState(false);
    const [captionText, setCaptionText] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const observer = useRef<IntersectionObserver | null>(null);

    const updateCaption = async () => {
        if (lightboxIndex === null) return;
        const img = images[lightboxIndex];
        try {
            const res = await fetch(`/api/images/${img.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caption: captionText })
            });
            if (res.ok) {
                toast.success("Caption updated");
                const updatedImages = [...images];
                updatedImages[lightboxIndex] = { ...img, caption: captionText };
                setImages(updatedImages);
                setIsEditingCaption(false);
            }
        } catch (err) {
            toast.error("Failed to update caption");
        }
    };

    const fetchImages = useCallback(async (pageNum: number, isNew: boolean = false) => {
        if (pageNum > 1) setLoadingMore(true);
        else setLoading(true);

        try {
            const query = new URLSearchParams({
                search,
                sort,
                status,
                page: pageNum.toString(),
                take: "24"
            });
            const res = await fetch(`/api/images?${query}`);
            const data = await res.json();

            if (isNew) {
                setImages(data.images);
            } else {
                setImages(prev => [...prev, ...data.images]);
            }

            setHasMore(data.images.length === 24);
        } catch (err) {
            toast.error("Error fetching images");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [search, sort, status]);

    useEffect(() => {
        setPage(1);
        fetchImages(1, true);
    }, [search, sort, status]);

    const lastElementRef = useCallback((node: any) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => {
                    const next = prev + 1;
                    fetchImages(next);
                    return next;
                });
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, fetchImages]);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const deleteImage = async (id: number) => {
        if (!confirm("Are you sure you want to delete this image?")) return;
        try {
            const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Image deleted");
                setImages(prev => prev.filter(img => img.id !== id));
            }
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const bulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} images?`)) return;
        try {
            const res = await fetch('/api/images/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })
            });
            if (res.ok) {
                toast.success("Images deleted");
                setImages(prev => prev.filter(img => !selectedIds.includes(img.id)));
                setSelectedIds([]);
            }
        } catch (err) {
            toast.error("Bulk delete failed");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Media Gallery</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage and preview all your marketing assets</p>
                </div>
                <div className="flex gap-3">
                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            onClick={bulkDelete}
                            className="bg-rose-600 hover:bg-rose-700 font-bold rounded-xl shadow-lg shadow-rose-500/20"
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete ({selectedIds.length})
                        </Button>
                    )}
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-8 rounded-xl shadow-lg shadow-blue-500/20">
                        <Link href="/upload">Upload More</Link>
                    </Button>
                </div>
            </div>

            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-xl">
                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search by filename..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 h-12 bg-white/50 border-slate-200 rounded-xl focus:ring-blue-100"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-12 w-[140px] bg-white border-slate-200 rounded-xl">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all">All Files</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sort} onValueChange={setSort}>
                            <SelectTrigger className="h-12 w-[160px] bg-white border-slate-200 rounded-xl">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="largest">Largest Size</SelectItem>
                                <SelectItem value="name">Name A-Z</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {loading && images.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />)}
                </div>
            ) : images.length === 0 ? (
                <div className="py-24 text-center">
                    <div className="bg-slate-100 h-24 w-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <LayoutGrid className="h-12 w-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">No media found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {images.map((img, i) => (
                        <div
                            key={img.id}
                            ref={i === images.length - 1 ? lastElementRef : null}
                            className={cn(
                                "relative aspect-square rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 shadow-sm hover:shadow-2xl border-2",
                                selectedIds.includes(img.id) ? "border-blue-500 ring-4 ring-blue-500/20" : "border-transparent"
                            )}
                            onClick={() => toggleSelect(img.id)}
                        >
                            <img src={img.thumbnailPath || img.filePath} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <Button
                                            variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-md text-white border-0"
                                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                                        >
                                            <Maximize2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-md text-white border-0 hover:bg-rose-500"
                                            onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            {img.status === 'sent' && (
                                <div className="absolute top-2 left-2 bg-emerald-500 text-white p-1 rounded-lg shadow-lg">
                                    <CheckCircle2 className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {loadingMore && (
                <div className="py-8 flex justify-center">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
            )}

            {/* Lightbox with Thumbnail Strip */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/98 backdrop-blur-xl animate-scale-in">
                    <Button variant="ghost" size="icon" className="absolute top-6 right-6 text-white h-12 w-12 rounded-2xl" onClick={() => setLightboxIndex(null)}>
                        <X className="h-8 w-8" />
                    </Button>

                    <div className="flex-1 w-full flex items-center justify-center relative px-20">
                        <Button
                            variant="ghost" size="icon" className="absolute left-6 text-white h-16 w-16"
                            disabled={lightboxIndex === 0} onClick={() => setLightboxIndex(lightboxIndex - 1)}
                        >
                            <ChevronLeft className="h-12 w-12" />
                        </Button>
                        <img src={images[lightboxIndex].filePath} className="max-h-[75vh] max-w-full object-contain shadow-2xl rounded-2xl border border-white/10" />
                        <Button
                            variant="ghost" size="icon" className="absolute right-6 text-white h-16 w-16"
                            disabled={lightboxIndex === images.length - 1} onClick={() => setLightboxIndex(lightboxIndex + 1)}
                        >
                            <ChevronRight className="h-12 w-12" />
                        </Button>
                    </div>

                    <div className="w-full bg-slate-900/50 p-6 flex flex-col items-center gap-4">
                        {/* Caption Area */}
                        <div className="w-full max-w-2xl px-4 text-center">
                            {isEditingCaption ? (
                                <div className="flex gap-2">
                                    <Input
                                        value={captionText}
                                        onChange={(e) => setCaptionText(e.target.value)}
                                        className="bg-white/10 text-white border-white/20 h-10"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && updateCaption()}
                                    />
                                    <Button onClick={updateCaption} className="bg-blue-600 h-10 px-4">Save</Button>
                                    <Button variant="ghost" onClick={() => setIsEditingCaption(false)} className="text-white">Cancel</Button>
                                </div>
                            ) : (
                                <div
                                    className="text-blue-100 font-medium italic cursor-pointer hover:text-white transition-colors"
                                    onClick={() => {
                                        setCaptionText(images[lightboxIndex].caption || "");
                                        setIsEditingCaption(true);
                                    }}
                                >
                                    {images[lightboxIndex].caption || "Add a caption..."}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Strip */}
                        <div className="flex gap-2 overflow-x-auto max-w-full p-2 scrollbar-thin">
                            {images.map((img, idx) => (
                                <div
                                    key={img.id}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={cn(
                                        "h-16 w-16 rounded-xl overflow-hidden shrink-0 cursor-pointer transition-all border-2",
                                        idx === lightboxIndex ? "border-blue-500 scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
                                    )}
                                >
                                    <img src={img.thumbnailPath || img.filePath} className="h-full w-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <div className="text-white text-xs font-black uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                            {images[lightboxIndex].fileName} ({lightboxIndex + 1} / {images.length})
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
