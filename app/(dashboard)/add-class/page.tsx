'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/lib/hooks/useStudents';
import { useCreateClass } from '@/lib/hooks/useClasses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';

const classSchema = z.object({
    studentId: z.string().min(1, 'Select a student'),
    subject: z.string().min(2, 'Subject required'),
    topic: z.string().min(2, 'Topic required'),
    date: z.string().min(1, 'Date required'),
    time: z.string().min(1, 'Time required'),
    duration: z.string().min(1, 'Duration required'),
    amount: z.string().min(1, 'Amount required'),
    notes: z.string().optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled']),
});
type ClassForm = z.infer<typeof classSchema>;

export default function AddClassPage() {
    const { user } = useAuth();
    const [success, setSuccess] = useState(false);

    const { data: studentsData } = useStudents();
    const createClass = useCreateClass();
    const students = studentsData?.students ?? [];

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ClassForm>({
        resolver: zodResolver(classSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
            duration: '60',
            status: 'scheduled',
        },
    });

    const onSubmit = async (data: ClassForm) => {
        await createClass.mutateAsync({
            studentId: data.studentId,
            subject: data.subject,
            topic: data.topic,
            date: data.date,
            time: data.time,
            duration: parseInt(data.duration),
            amount: parseFloat(data.amount),
            notes: data.notes,
            status: data.status as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
        });
        setSuccess(true);
        reset();
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto text-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Class Recorded!</h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>The class has been saved to your history.</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setSuccess(false)}>
                    Add Another Class
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Add Class</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Record a teaching session</p>
            </div>

            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" /> Session Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1">
                                <Label>Student *</Label>
                                <Controller name="studentId" control={control} render={({ field }) => (
                                    <Select value={field.value} onValueChange={v => field.onChange(v ?? '')}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>
                                            {students.map(s => <SelectItem key={s._id} value={s._id}>{s.name} — {s.subject}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )} />
                                {errors.studentId && <p className="text-xs text-red-500">{errors.studentId.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Subject *</Label>
                                <Input placeholder="e.g. Mathematics" {...register('subject')} />
                                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Topic *</Label>
                                <Input placeholder="Today's topic" {...register('topic')} />
                                {errors.topic && <p className="text-xs text-red-500">{errors.topic.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Date *</Label>
                                <Input type="date" {...register('date')} />
                                {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Time *</Label>
                                <Input type="time" {...register('time')} />
                                {errors.time && <p className="text-xs text-red-500">{errors.time.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Duration (minutes) *</Label>
                                <Controller name="duration" control={control} render={({ field }) => (
                                    <Select value={field.value} onValueChange={v => field.onChange(v ?? '60')}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {['30', '45', '60', '75', '90', '120'].map(d => (
                                                <SelectItem key={d} value={d}>{d} min</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                            <div className="space-y-1"><Label>Amount (₹) *</Label>
                                <Input type="number" placeholder="e.g. 500" {...register('amount')} />
                                {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Status *</Label>
                                <Controller name="status" control={control} render={({ field }) => (
                                    <Select value={field.value} onValueChange={v => field.onChange(v ?? 'upcoming')}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="rescheduled">Rescheduled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                            <div className="col-span-2 space-y-1"><Label>Notes</Label>
                                <Textarea placeholder="Additional notes..." rows={3} {...register('notes')} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white gap-2" disabled={createClass.isPending}>
                                {createClass.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Class
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
