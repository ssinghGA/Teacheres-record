'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReports, useCreateReport, useUpdateReport, useDeleteReport, type ApiReport } from '@/lib/hooks/useReports';
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
import { Plus, TrendingUp, Loader2, AlertCircle, FileText, Pencil, Trash2 } from 'lucide-react';
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
    const [editingReport, setEditingReport] = useState<ApiReport | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const { data: reportsData, isLoading: reportsLoading, isError: reportsError, error: reportsErr } = useReports();
    const { data: studentsData } = useStudents();
    const createReport = useCreateReport();
    const deleteReport = useDeleteReport();

    const reports = reportsData?.reports ?? [];
    const students = studentsData?.students ?? [];

    const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<ReportForm>({
        resolver: zodResolver(reportSchema),
        defaultValues: { date: new Date().toISOString().split('T')[0] },
    });

    const watchedStudentId = watch('studentId');
    const selectedStudent = students.find(s => s._id === watchedStudentId);

    // Auto-fill subject from selected student
    const handleStudentChange = (id: string, onChange: (v: string) => void) => {
        onChange(id);
        const student = students.find(s => s._id === id);
        if (student?.subject) setValue('subject', student.subject);
    };

    const editMutation = useUpdateReport(editingReport?._id ?? '');

    const openAdd = () => {
        setEditingReport(null);
        reset({ date: new Date().toISOString().split('T')[0] });
        setDialogOpen(true);
    };

    const openEdit = (r: ApiReport) => {
        setEditingReport(r);
        const studentId = typeof r.studentId === 'object' ? r.studentId._id : r.studentId;
        reset({
            studentId,
            subject: r.subject,
            date: r.date.split('T')[0],
            topicCovered: r.topicCovered,
            homeworkGiven: r.homeworkGiven,
            understandingLevel: String(r.understandingLevel),
            remarks: r.remarks,
        });
        setDialogOpen(true);
    };

    const onSubmit = async (data: ReportForm) => {
        const payload = {
            studentId: data.studentId,
            subject: data.subject,
            date: data.date,
            topicCovered: data.topicCovered,
            homeworkGiven: data.homeworkGiven,
            understandingLevel: parseInt(data.understandingLevel),
            remarks: data.remarks,
        };
        if (editingReport) {
            await editMutation.mutateAsync(payload);
        } else {
            await createReport.mutateAsync(payload);
        }
        setDialogOpen(false);
        setEditingReport(null);
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
                <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
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
                                        <div className="flex items-center gap-1">
                                            <Link href={`/report/${studentId}`}>
                                                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                    <FileText className="w-3.5 h-3.5" /> PDF Report
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(r)}>
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setDeleteConfirm(r._id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
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

            {/* Delete confirm */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Delete Report?</DialogTitle></DialogHeader>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={async () => {
                            if (deleteConfirm) { await deleteReport.mutateAsync(deleteConfirm); setDeleteConfirm(null); }
                        }}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingReport(null); }}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingReport ? 'Edit Progress Report' : 'Create Progress Report'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Student selector — auto-fills subject */}
                            <div className="col-span-2 space-y-1"><Label>Student *</Label>
                                <Controller name="studentId" control={control} render={({ field }) => {
                                    const sel = students.find(s => s._id === field.value);
                                    return (
                                        <Select value={field.value} onValueChange={v => handleStudentChange(v ?? '', field.onChange)}>
                                            <SelectTrigger>
                                                {sel ? (
                                                    <span className="truncate">{sel.name} — {sel.subject} ({sel.class})</span>
                                                ) : (
                                                    <span className="text-muted-foreground">Select student</span>
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.filter(s => s.status === 'active').map(s => (
                                                    <SelectItem key={s._id} value={s._id}>
                                                        {s.name} — {s.subject} ({s.class})
                                                    </SelectItem>
                                                ))}
                                                {/* Show current student even if inactive (for editing existing reports) */}
                                                {editingReport && students.find(s => s._id === field.value && s.status !== 'active') && (
                                                    <SelectItem key={field.value} value={field.value}>
                                                        {students.find(s => s._id === field.value)?.name} (Inactive)
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    );
                                }} />
                                {errors.studentId && <p className="text-xs text-red-500">{errors.studentId.message}</p>}
                            </div>

                            {/* Auto-filled display boxes */}
                            {selectedStudent && (
                                <>
                                    <div className="col-span-2 flex gap-2">
                                        <div className="flex-1 rounded-lg p-2.5 border" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                                            <p className="text-xs text-muted-foreground">Class</p>
                                            <p className="text-sm font-semibold">{selectedStudent.class}</p>
                                        </div>
                                        <div className="flex-1 rounded-lg p-2.5 border" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                                            <p className="text-xs text-muted-foreground">Subject (auto-filled)</p>
                                            <p className="text-sm font-semibold">{selectedStudent.subject}</p>
                                        </div>
                                    </div>
                                </>
                            )}

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
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={createReport.isPending || editMutation.isPending}>
                                {(createReport.isPending || editMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editingReport ? 'Update Report' : 'Create Report'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
