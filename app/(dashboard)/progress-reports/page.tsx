'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReports, useCreateReport, type ApiReport } from '@/lib/hooks/useReports';
import { useStudents } from '@/lib/hooks/useStudents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, TrendingUp, Loader2, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const reportSchema = z.object({
    studentId: z.string().min(1, 'Select a student'),
    subject: z.string().min(1, 'Subject required'),
    date: z.string().min(1, 'Date required'),
    topicCovered: z.string().min(2, 'Topic required'),
    homeworkGiven: z.string().min(2, 'Homework required'),
    understandingLevel: z.string().min(1, 'Select level'),
    remarks: z.string().min(2, 'Remarks required'),
});
type ReportForm = z.infer<typeof reportSchema>;

export default function ProgressReportsPage() {
    const { user } = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: reportsData, isLoading: reportsLoading, isError: reportsError, error: reportsErr } = useReports();
    const { data: studentsData } = useStudents();
    const createReport = useCreateReport();

    const reports = reportsData?.reports ?? [];
    const students = studentsData?.students ?? [];

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ReportForm>({
        resolver: zodResolver(reportSchema),
        defaultValues: { date: new Date().toISOString().split('T')[0] },
    });

    const onSubmit = async (data: ReportForm) => {
        await createReport.mutateAsync({
            studentId: data.studentId,
            subject: data.subject,
            date: data.date,
            topicCovered: data.topicCovered,
            homeworkGiven: data.homeworkGiven,
            understandingLevel: parseInt(data.understandingLevel),
            remarks: data.remarks,
        });
        setDialogOpen(false);
        reset();
    };

    const StarRating = ({ value }: { value: number }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`text-base ${s <= value ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>★</span>
            ))}
        </div>
    );

    const getStudentName = (r: ApiReport) =>
        typeof r.studentId === 'object' ? r.studentId.name : 'N/A';

    if (reportsLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (reportsError) return <div className="flex items-center justify-center py-20 gap-2 text-red-500"><AlertCircle className="w-5 h-5" /><span className="text-sm">{(reportsErr as Error).message}</span></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Progress Reports</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{reports.length} reports</p>
                </div>
                <Button onClick={() => { reset({ date: new Date().toISOString().split('T')[0] }); setDialogOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> New Report
                </Button>
            </div>

            <div className="space-y-4">
                {reports.map(r => {
                    const studentId = typeof r.studentId === 'object' ? r.studentId._id : r.studentId;
                    return (
                        <Card key={r._id} className="shadow-sm border hover:shadow-md transition-all" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                            <CardContent className="p-5">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{r.topicCovered}</p>
                                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {getStudentName(r)} · {r.subject} · {format(new Date(r.date), 'dd MMM yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <StarRating value={r.understandingLevel} />
                                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Understanding: {r.understandingLevel}/5</span>
                                        <Link href={`/report/${studentId}`}>
                                            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                <FileText className="w-3.5 h-3.5" /> PDF Report
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="rounded-lg p-3" style={{ background: 'var(--muted)' }}>
                                        <p className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Homework Given</p>
                                        <p className="text-sm" style={{ color: 'var(--foreground)' }}>{r.homeworkGiven}</p>
                                    </div>
                                    <div className="rounded-lg p-3" style={{ background: 'var(--muted)' }}>
                                        <p className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Remarks</p>
                                        <p className="text-sm" style={{ color: 'var(--foreground)' }}>{r.remarks}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {reports.length === 0 && (
                    <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
                        <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No progress reports yet</p>
                    </div>
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Create Progress Report</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1"><Label>Student *</Label>
                                <Controller name="studentId" control={control} render={({ field }) => (
                                    <Select value={field.value} onValueChange={v => field.onChange(v ?? '')}>
                                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                        <SelectContent>
                                            {students.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )} />
                                {errors.studentId && <p className="text-xs text-red-500">{errors.studentId.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Subject *</Label>
                                <Input placeholder="e.g. Mathematics" {...register('subject')} />
                                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Date *</Label>
                                <Input type="date" {...register('date')} />
                            </div>
                            <div className="col-span-2 space-y-1"><Label>Topic Covered *</Label>
                                <Input placeholder="What was covered?" {...register('topicCovered')} />
                                {errors.topicCovered && <p className="text-xs text-red-500">{errors.topicCovered.message}</p>}
                            </div>
                            <div className="col-span-2 space-y-1"><Label>Homework Given *</Label>
                                <Input placeholder="Assignment details" {...register('homeworkGiven')} />
                                {errors.homeworkGiven && <p className="text-xs text-red-500">{errors.homeworkGiven.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Understanding Level (1–5) *</Label>
                                <Controller name="understandingLevel" control={control} render={({ field }) => (
                                    <Select value={field.value} onValueChange={v => field.onChange(v ?? '')}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 – Needs improvement</SelectItem>
                                            <SelectItem value="2">2 – Below average</SelectItem>
                                            <SelectItem value="3">3 – Average</SelectItem>
                                            <SelectItem value="4">4 – Good</SelectItem>
                                            <SelectItem value="5">5 – Excellent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                                {errors.understandingLevel && <p className="text-xs text-red-500">{errors.understandingLevel.message}</p>}
                            </div>
                            <div className="col-span-2 space-y-1"><Label>Remarks *</Label>
                                <Textarea placeholder="Teacher's remarks..." rows={3} {...register('remarks')} />
                                {errors.remarks && <p className="text-xs text-red-500">{errors.remarks.message}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={createReport.isPending}>
                                {createReport.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Report
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
