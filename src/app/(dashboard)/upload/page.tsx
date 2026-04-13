"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  ImageIcon,
  FileImage,
  Trash2,
  CheckCircle2,
  Loader2,
  Plus,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatFileSize } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface FileWithStatus {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending" as const,
    }));
    setFiles((prev) => [...newFiles, ...prev]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setFiles(prev => prev.map(f => f.status === "pending" ? { ...f, status: "uploading" } : f));

    const formData = new FormData();
    pendingFiles.forEach(f => formData.append("files", f.file));

    try {
      const res = await fetch("/api/auth/session"); // Just to make sure session is alive
      if (!res.ok) throw new Error("Auth session lost");

      const uploadRes = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.message || "Upload failed");

      setFiles(prev => prev.map(f => {
        if (f.status === "uploading") return { ...f, status: "completed", progress: 100 };
        return f;
      }));

      setUploadedImages(prev => [...data.uploaded, ...prev]);
      toast.success(`Successfully uploaded ${data.uploaded.length} images!`);
    } catch (err: any) {
      toast.error(err.message);
      setFiles(prev => prev.map(f => f.status === "uploading" ? { ...f, status: "failed" } : f));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Upload Media</h2>
          <p className="text-slate-500 font-medium mt-1">Add new images to your sending library</p>
        </div>

        <AnimatePresence>
          {files.some(f => f.status === "pending") && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button
                onClick={uploadAll}
                className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl font-bold shadow-lg shadow-indigo-500/20"
              >
                Upload {files.filter(f => f.status === "pending").length} Files
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className={cn(
          "relative border-4 border-dashed rounded-[2.5rem] transition-all duration-300 group",
          isDragging
            ? "border-indigo-500 bg-indigo-50/50 ring-8 ring-indigo-500/10"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="py-24 flex flex-col items-center justify-center text-center px-6">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className={cn(
            "h-24 w-24 rounded-3xl mb-8 flex items-center justify-center transition-all duration-300",
            isDragging ? "bg-indigo-500 text-white scale-110 shadow-xl shadow-indigo-200" : "bg-indigo-50 text-indigo-600 group-hover:scale-105"
          )}>
            <Upload className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
            {isDragging ? "Drop them here!" : "Drag & drop images here"}
          </h3>
          <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
            Support for JPG, PNG, GIF and WEBP. Maximum file size 10MB each.
          </p>
          <Button variant="outline" className="mt-8 rounded-xl px-6 font-bold border-slate-200 hover:bg-white hover:border-indigo-600 hover:text-indigo-600">
            Browse Files
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Pending Queue */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Upload Queue ({files.length})</h4>
             {files.length > 0 && (
               <button
                onClick={() => setFiles([])}
                className="text-xs font-bold text-rose-500 hover:underline"
               >
                 Clear Queue
               </button>
             )}
          </div>

          <div className="space-y-3">
             <AnimatePresence>
               {files.map((f) => (
                 <motion.div
                   key={f.id}
                   layout
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                 >
                   <Card className="border-none shadow-sm rounded-2xl overflow-hidden group">
                     <CardContent className="p-4 flex items-center gap-4">
                       <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                         <FileImage className="h-6 w-6" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold text-slate-700 truncate">{f.file.name}</p>
                         <p className="text-xs text-slate-400 font-medium">{formatFileSize(f.file.size)}</p>
                         {f.status === "uploading" && (
                           <Progress value={f.progress} className="h-1 mt-2" />
                         )}
                       </div>
                       <div>
                         {f.status === "completed" ? (
                           <div className="bg-emerald-50 text-emerald-500 p-2 rounded-lg">
                             <CheckCircle2 className="h-5 w-5" />
                           </div>
                         ) : f.status === "uploading" ? (
                           <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                         ) : (
                           <button
                            onClick={() => removeFile(f.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                           >
                             <X className="h-5 w-5" />
                           </button>
                         )}
                       </div>
                     </CardContent>
                   </Card>
                 </motion.div>
               ))}
               {files.length === 0 && (
                 <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300 italic">
                    <p className="text-sm">Queue is empty</p>
                 </div>
               )}
             </AnimatePresence>
          </div>
        </div>

        {/* Recently Uploaded */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Recently Added</h4>
             <Link href="/gallery" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
               Go to Gallery <ArrowRight className="h-3 w-3" />
             </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
             {uploadedImages.slice(0, 6).map((img, i) => (
               <motion.div
                 key={img.id}
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.05 }}
                 className="aspect-square rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm relative group"
               >
                 <img
                    src={img.thumbnailPath || img.filePath}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={img.filename}
                 />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="icon" variant="secondary" className="h-9 w-9 rounded-xl" asChild>
                       <Link href={`/gallery?id=${img.id}`}>
                         <ImageIcon className="h-4 w-4" />
                       </Link>
                    </Button>
                 </div>
               </motion.div>
             ))}
             {uploadedImages.length === 0 && (
               <div className="col-span-full py-12 bg-slate-50/50 border-2 border-dotted border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300 italic text-center px-6">
                 <p className="text-sm">Uploaded images in this session will appear here</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
