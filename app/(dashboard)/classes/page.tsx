'use client';

import { useTeachers } from '@/lib/hooks/useTeachers';
import { useClasses } from '@/lib/hooks/useClasses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { ApiClass } from '@/lib/hooks/useClasses';

export default function AdminClassesPage() {
    const { data: allClasses, isLoading, isError, error } = useClasses();
    const { data: teachers } = useTeachers();

    const classes = allClasses?.classes ?? [];
    const totalAmount = classes.reduce((s, c) => s + c.amount, 0);

    const getTeacherName = (c: ApiClass) =>
        typeof c.teacherId === 'object' ? c.teacherId.name : (teachers ?? []).find(t => t._id === c.teacherId)?.name ?? 'N/A';

    const getStudentName = (c: ApiClass) =>
        typeof c.studentId === 'object' ? c.studentId.name : 'N/A';

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            upcoming: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            cancelled: 'bg-red-100 text-red-700',
        };
        return map[status] ?? '';
    };

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (isError) return <div className="flex items-center justify-center py-20 gap-2 text-red-500"><AlertCircle className="w-5 h-5" /><span className="text-sm">{(error as Error).message}</span></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>All Classes</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {classes.length} sessions across all teachers · Total: ₹{totalAmount.toLocaleString('en-IN')}
                </p>
            </div>
            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" /> Class Sessions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                                    {['Teacher', 'Student', 'Subject', 'Topic', 'Date', 'Duration', 'Amount', 'Status'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map((c, i) => (
                                    <tr key={c._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                                        style={{ borderBottom: i < classes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{getTeacherName(c)}</td>
                                        <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{getStudentName(c)}</td>
                                        <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{c.subject}</td>
                                        <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{c.topic}</td>
                                        <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{format(new Date(c.date), 'dd MMM yyyy')}</td>
                                        <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{c.duration}m</td>
                                        <td className="px-4 py-3 font-semibold text-emerald-600">₹{c.amount}</td>
                                        <td className="px-4 py-3"><Badge className={`text-xs border-0 ${statusBadge(c.status)}`}>{c.status}</Badge></td>
                                    </tr>
                                ))}
                                {classes.length === 0 && (
                                    <tr><td colSpan={8} className="py-12 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>No classes found</td></tr>
                                )}
                            </tbody>
                            {classes.length > 0 && (
                                <tfoot>
                                    <tr style={{ background: 'var(--muted)', borderTop: '2px solid var(--border)' }}>
                                        <td colSpan={6} className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                                            Total ({classes.length} sessions)
                                        </td>
                                        <td className="px-4 py-3 font-bold text-emerald-600">₹{totalAmount.toLocaleString('en-IN')}</td>
                                        <td />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
