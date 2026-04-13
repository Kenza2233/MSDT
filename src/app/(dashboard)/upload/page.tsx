"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Upload, X, FileImage, CheckCircle2, AlertCircle, Loader2, ImageIcon, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn, formatFileSize } from "@/lib/utils";
export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<any[]>([]);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).map(f => ({ id: Math.random().toString(36), file: f, progress: 0, status: "pending" }));
    setUploadingFiles(prev => [...newFiles, ...prev]);
    const formData = new FormData();
    newFiles.forEach(f => formData.append("files", f.file));
    fetch("/api/images/upload", { method: "POST", body: formData }).then(res => res.json()).then(data => {
      setRecentUploads(prev => [...(data.uploaded || []), ...prev]);
      toast.success("Upload complete");
    });
  }, []);
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div><h2 className="text-3xl font-bold tracking-tight">Bulk Upload</h2><p className="text-muted-foreground">Upload images to your gallery.</p></div>
      <Card className={cn("border-2 border-dashed py-12 text-center cursor-pointer", isDragging && "border-primary bg-primary/5")} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()}>
        <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={e => e.target.files && handleFiles(e.target.files)} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-bold">Drag & drop or click to upload</h3>
      </Card>
      {recentUploads.length > 0 && <div className="grid grid-cols-3 gap-4">{recentUploads.map(img => <Card key={img.id} className="overflow-hidden"><img src={img.thumbnailPath} className="aspect-square object-cover w-full" /><div className="p-2 text-xs truncate">{img.originalName}</div></Card>)}</div>}
    </div>
  );
}
