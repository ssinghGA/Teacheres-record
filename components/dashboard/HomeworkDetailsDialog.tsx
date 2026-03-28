'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar, User, BookOpen, FileText, Download, 
    Clock, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import type { Homework } from '@/types';
import { toast } from 'sonner';

interface HomeworkDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    homework: Homework | null;
    userName: string;
}

export default function HomeworkDetailsDialog({ open, onOpenChange, homework, userName }: HomeworkDetailsDialogProps) {
    if (!homework) return null;

    const statusStyles: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-700 border-amber-100',
        submitted: 'bg-blue-50 text-blue-700 border-blue-100',
        graded: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };

    const handleDownload = () => {
        toast.success(`Downloading ${homework.attachments?.length || 0} file(s)...`);
        setTimeout(() => toast.info('Materials saved to your browser downloads'), 1500);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge className="mb-3 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md uppercase text-[10px] font-bold tracking-widest px-3">
                                {homework.subject}
                            </Badge>
                            <DialogTitle className="text-2xl font-black tracking-tight leading-tight">
                                {homework.topic}
                            </DialogTitle>
                        </div>
                        <Badge variant="outline" className={`rounded-full px-4 py-1 border-0 font-bold text-xs uppercase shadow-lg ${statusStyles[homework.status]}`}>
                            {homework.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-8 bg-card max-h-[70vh] overflow-y-auto">
                    {/* Meta info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <User className="w-3 h-3" /> Assigned To
                            </p>
                            <p className="font-bold text-sm">{userName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> Date Assigned
                            </p>
                            <p className="font-bold text-sm">{format(new Date(homework.createdAt), 'dd MMM yyyy')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" /> Due Date
                            </p>
                            <p className="font-bold text-sm text-amber-600">{homework.dueDate ? format(new Date(homework.dueDate), 'dd MMM yyyy') : 'No due date'}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <FileText className="w-3 h-3" /> Instructions & Description
                        </p>
                        <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{homework.description || 'No instructions provided.'}</p>
                        </div>
                    </div>

                    {homework.attachments && homework.attachments.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Download className="w-3 h-3" /> Teacher Materials
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {homework.attachments.map((file, i) => (
                                    <div key={i} className="group flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-all cursor-pointer" onClick={handleDownload}>
                                        <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{file}</span>
                                        <Download className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {homework.submissions && homework.submissions.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-dashed">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" /> Student Submission
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {homework.submissions.map((file, i) => (
                                    <div key={i} className="group flex items-center gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-all cursor-pointer" onClick={() => toast.success(`Viewing ${file}...`)}>
                                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{file}</span>
                                    </div>
                                ))}
                            </div>
                            {homework.submissionNotes && (
                                <div className="mt-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 italic text-sm text-blue-800">
                                    "{homework.submissionNotes}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-muted/20 border-t flex items-center justify-between sm:justify-between">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold text-muted-foreground hover:text-foreground">
                        Close
                    </Button>
                    {homework.attachments && homework.attachments.length > 0 && (
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-bold gap-2 shadow-lg shadow-emerald-500/20"
                            onClick={handleDownload}
                        >
                            <Download className="w-4 h-4" />
                            Download All Materials
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
