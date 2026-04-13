"use client";

export const dynamic = "force-dynamic";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  FileImage,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatFileSize } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";


interface FileWithStatus {
    file: File;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    progress: number;
    error?: string;
    id: string;
}

export default function UploadPage() {
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };

    const addFiles = (newFiles: File[]) => {
        const mapped = newFiles.map(f => ({
            file: f,
            status: 'pending' as const,
            progress: 0,
            id: Math.random().toString(36).substring(7)
        }));
        setFiles(prev => [...prev, ...mapped]);
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const uploadAll = async () => {
        const pending = files.filter(f => f.status === 'pending');
        if (pending.length === 0) return;

        setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' } : f));

        try {
            const formData = new FormData();
            pending.forEach(f => formData.append('files', f.file));

            const res = await fetch('/api/images/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            toast.success(`Successfully uploaded ${data.length} images!`);

            setFiles(prev => prev.map(f => {
                const found = pending.find(p => p.id === f.id);
                if (found) return { ...f, status: 'completed', progress: 100 };
                return f;
            }));

        } catch (err: any) {
            toast.error(err.message);
            setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'error', error: err.message } : f));
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Upload Media</h2>
                    <p className="text-slate-500 font-medium mt-1">Add new images to your marketing library</p>
                </div>
                {files.length > 0 && (
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setFiles([])} className="rounded-xl font-bold">
                            Clear List
                        </Button>
                        <Button
                            onClick={uploadAll}
                            disabled={!files.some(f => f.status === 'pending')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-8 rounded-xl shadow-lg shadow-blue-500/20 animate-pulse-glow"
                        >
                            Upload All Files
                        </Button>
                    </div>
                )}
            </div>

            {/* Dropzone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
                }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative overflow-hidden cursor-pointer border-4 border-dashed rounded-[2.5rem] p-12 transition-all duration-300",
                    isDragging
                        ? "border-blue-500 bg-blue-50 shadow-inner"
                        : "border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50 shadow-md"
                )}
            >
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className={cn(
                        "p-8 rounded-[2rem] transition-all duration-500",
                        isDragging ? "bg-blue-600 text-white scale-110 rotate-3 shadow-2xl" : "bg-blue-50 text-blue-600"
                    )}>
                        <Upload className="h-12 w-12" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                            {isDragging ? "Drop images now!" : "Drop images here or click to browse"}
                        </h3>
                        <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
                            JPEG, PNG, GIF and WEBP supported. Maximum file size is 10MB per image.
                        </p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        accept="image/*"
                        className="hidden"
                    />
                    {!isDragging && (
                        <div className="flex items-center gap-2 text-blue-600 font-black text-sm px-6 py-2 bg-blue-50 rounded-full border border-blue-100">
                            <Sparkles className="h-4 w-4" />
                            Drag and drop up to 50 files
                        </div>
                    )}
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                    {files.map((f) => (
                        <Card key={f.id} className="border-0 shadow-md overflow-hidden hover-lift group">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center relative overflow-hidden shrink-0 border border-slate-200">
                                    <FileImage className="h-8 w-8 text-slate-400" />
                                    {f.status === 'completed' && (
                                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-800 truncate leading-none mb-1">{f.file.name}</p>
                                    <p className="text-xs text-slate-500 font-bold">{formatFileSize(f.file.size)}</p>
                                    {f.status === 'uploading' && (
                                        <Progress value={f.progress} className="h-1.5 mt-2 bg-blue-100" />
                                    )}
                                    {f.status === 'error' && (
                                        <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {f.error}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {f.status === 'uploading' ? (
                                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFile(f.id)}
                                            className="h-9 w-9 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Success Actions */}
            {files.some(f => f.status === 'completed') && (
                <Card className="bg-emerald-600 border-0 shadow-2xl text-white overflow-hidden animate-fade-in-up">
                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center border border-white/20">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black tracking-tight italic">Upload Successful!</h4>
                                <p className="text-emerald-100 font-medium">Your media is now ready for broadcasting.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <Button asChild className="flex-1 md:flex-none bg-white text-emerald-600 hover:bg-emerald-50 font-black h-12 px-8 rounded-xl">
                                <Link href="/gallery">View Gallery</Link>
                            </Button>
                            <Button asChild variant="outline" className="flex-1 md:flex-none bg-emerald-700/30 border-white/30 text-white hover:bg-white/10 font-black h-12 px-8 rounded-xl">
                                <Link href="/send">Start Sending</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
