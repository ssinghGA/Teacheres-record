'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStudents } from '@/lib/hooks/useStudents';
import { useCreateHomework } from '@/lib/hooks/useHomeworks';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const homeworkSchema = z.object({
    studentId: z.string().min(1, 'Select a student'),
    subject: z.string().min(1, 'Subject required'),
    topic: z.string().min(1, 'Topic required'),
    description: z.string().min(5, 'Description too short'),
    dueDate: z.string().optional(),
});

type HomeworkForm = z.infer<typeof homeworkSchema>;

interface AddHomeworkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: {
        classId?: string;
        studentId?: string;
        subject?: string;
        topic?: string;
    };
    teacherId: string;
}

export default function AddHomeworkDialog({ open, onOpenChange, initialData, teacherId }: AddHomeworkDialogProps) {
    const { data: studentsData } = useStudents({ teacherId });
    const createHomework = useCreateHomework();
    const students = studentsData?.students ?? [];

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<HomeworkForm>({
        resolver: zodResolver(homeworkSchema),
        values: {
            studentId: initialData?.studentId || '',
            subject: initialData?.subject || '',
            topic: initialData?.topic || '',
            description: '',
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        },
    });

    const [attachments, setAttachments] = useState<File[]>([]);

    const onSubmit = async (data: HomeworkForm) => {
        // In a real app, you would upload files to S3/Cloudinary first
        // For now we'll simulate it by sending filenames or placeholders
        const payload = {
            ...data,
            teacherId,
            classId: initialData?.classId,
            attachments: attachments.map(f => f.name), // Simulated
        };
        
        await createHomework.mutateAsync(payload);
        reset();
        setAttachments([]);
        onOpenChange(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-6 bg-emerald-600 text-white">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Assign Homework
                    </DialogTitle>
                    <p className="text-emerald-100 text-xs mt-1">Provide clear instructions and learning materials.</p>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 bg-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Student</Label>
                            <Controller name="studentId" control={control} render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={!!initialData?.studentId}>
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue placeholder="Chose student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map(s => <SelectItem key={s._id} value={s._id}>{s.name} ({s.class})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )} />
                            {errors.studentId && <p className="text-xs text-rose-500">{errors.studentId.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</Label>
                            <Input type="date" className="h-11 rounded-xl" {...register('dueDate')} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</Label>
                            <Input className="h-11 rounded-xl" placeholder="e.g. Physics" {...register('subject')} disabled={!!initialData?.subject} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Topic</Label>
                            <Input className="h-11 rounded-xl" placeholder="e.g. Thermodynamics" {...register('topic')} disabled={!!initialData?.topic} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Homework Instructions</Label>
                        <Textarea 
                            className="min-h-[120px] rounded-xl resize-none" 
                            placeholder="Detail out the tasks, exercises or reading assignments..."
                            {...register('description')} 
                        />
                        {errors.description && <p className="text-xs text-rose-500">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attachments (Documents/images)</Label>
                        <div className="flex flex-wrap gap-3">
                            {attachments.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                                    <span className="text-xs font-medium text-emerald-700 truncate max-w-[150px]">{file.name}</span>
                                    <button type="button" onClick={() => removeAttachment(i)} className="text-emerald-500 hover:text-emerald-700">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            <label className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl cursor-pointer transition-colors border border-dashed border-muted-foreground/30">
                                <Upload className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs font-semibold text-muted-foreground">Upload Files</span>
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t gap-3">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl px-6 font-semibold">
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-bold gap-2 shadow-lg shadow-emerald-600/20"
                            disabled={createHomework.isPending}
                        >
                            {createHomework.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                            Send Homework
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
