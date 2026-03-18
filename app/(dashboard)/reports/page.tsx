'use client';

import { useReports, type ApiReport } from '@/lib/hooks/useReports';
import { useTeachers } from '@/lib/hooks/useTeachers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminReportsPage() {
    const { data: reportsData, isLoading, isError, error } = useReports();
    const { data: teachers } = useTeachers();

    const reports = reportsData?.reports ?? [];

    const getTeacherName = (r: ApiReport) => {
        if (!r.teacherId) return 'N/A';
        return typeof r.teacherId === 'object' ? r.teacherId.name : (teachers ?? []).find(t => t._id === r.teacherId)?.name ?? 'N/A';
    };

    const getStudentName = (r: ApiReport) => {
        if (!r.studentId || typeof r.studentId !== 'object') return 'N/A';
        return r.studentId.name || 'N/A';
    };

    // Filter out reports where student is null/deleted if requested
    const visibleReports = reports.filter(r => r.studentId !== null);

    const StarRating = ({ value }: { value: number }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`text-sm ${s <= value ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>★</span>
            ))}
        </div>
    );

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (isError) return <div className="flex items-center justify-center py-20 gap-2 text-red-500"><AlertCircle className="w-5 h-5" /><span className="text-sm">{(error as Error).message}</span></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>All Reports</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{reports.length} progress reports across all teachers</p>
            </div>

            <div className="space-y-4">
                {visibleReports.map(r => (
                    <Card key={r._id} className="shadow-sm border border-border hover:shadow-md transition-all bg-card">
                        <CardContent className="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{r.topicCovered}</p>
                                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                            <span className="text-blue-600 font-medium">{getTeacherName(r)}</span>
                                            {' → '}{getStudentName(r)} · {r.subject} · {format(new Date(r.date), 'dd MMM yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                    <StarRating value={r.understandingLevel} />
                                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.understandingLevel}/5</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-lg p-3 bg-muted/30">
                                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>Homework</p>
                                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>{r.homeworkGiven}</p>
                                </div>
                                <div className="rounded-lg p-3" style={{ background: 'var(--muted)' }}>
                                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>Remarks</p>
                                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>{r.remarks}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {visibleReports.length === 0 && (
                    <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-xl">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20 text-indigo-600" />
                        <p className="font-semibold text-lg text-foreground">No reports found</p>
                        <p className="text-sm text-muted-foreground mt-1">There are no progress reports recorded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
