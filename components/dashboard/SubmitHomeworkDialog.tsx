'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, X, Loader2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { useUpdateHomework } from '@/lib/hooks/useHomeworks';
import { toast } from 'sonner';
import type { Homework } from '@/types';

interface SubmitHomeworkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    homework: Homework | null;
}

export default function SubmitHomeworkDialog({ open, onOpenChange, homework }: SubmitHomeworkDialogProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const updateHomework = useUpdateHomework();

    if (!homework) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles([...files, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            toast.error('Please attach at least one file (PDF/Image)');
            return;
        }

        setUploading(true);
        try {
            // Simulate file upload (would be real file upload in a real app)
            // For now, we store filenames in 'submissions'
            const submissionFiles = files.map(f => f.name);
            
            await updateHomework.mutateAsync({ 
                id: homework._id, 
                status: 'submitted',
                // We add 'submissions' to the update body
                ...({ submissions: submissionFiles } as any)
            });
            
            toast.success('Homework submitted successfully!');
            onOpenChange(false);
            setFiles([]);
        } catch (error) {
            toast.error('Failed to submit homework');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <Badge className="mb-2 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md uppercase text-[10px] font-bold tracking-widest px-3">
                        Assignment Submission
                    </Badge>
                    <DialogTitle className="text-2xl font-black">Submit Your Work</DialogTitle>
                    <DialogDescription className="text-blue-100 font-medium opacity-90">
                        Upload your completed files for "{homework.topic}"
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Attach Documents (PDF/Image)</label>
                        
                        <div 
                            className="border-2 border-dashed border-border rounded-2xl p-8 transition-all hover:border-blue-400 hover:bg-blue-50/30 group cursor-pointer flex flex-col items-center justify-center text-center relative"
                        >
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                multiple
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            />
                            <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center mb-3 transition-colors">
                                <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-sm font-bold text-foreground">Click or Drag Files here</p>
                            <p className="text-xs text-muted-foreground mt-1">PDF, DOC, JPG or PNG (Max 10MB)</p>
                        </div>

                        {files.length > 0 && (
                            <div className="space-y-2 mt-4">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold truncate max-w-[200px]">{file.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => removeFile(i)}
                                            className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg group-hover:opacity-100 opacity-0 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-6 bg-muted/20 border-t flex items-center justify-between gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => onOpenChange(false)} 
                        className="rounded-xl font-bold text-muted-foreground hover:text-foreground flex-1"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={uploading || files.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-bold gap-2 shadow-lg shadow-blue-500/20 flex-1 h-11"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Submit Work
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
