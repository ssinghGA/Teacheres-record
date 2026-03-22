'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePayments, type ApiPayment } from '@/lib/hooks/usePayments';
import { useClasses } from '@/lib/hooks/useClasses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function EarningsPage() {
    const { data: paymentsData, isLoading, isError, error } = usePayments();
    const { data: classesData } = useClasses();

    const payments = paymentsData?.payments ?? [];
    const classes = classesData?.classes ?? [];

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const totalEarned = classes.filter(c => c.status === 'completed').reduce((s, c) => s + (c.amount || 0), 0);
    const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    const monthlyEarned = classes
        .filter(c => {
            const d = new Date(c.date);
            return c.status === 'completed' && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        })
        .reduce((s, c) => s + (c.amount || 0), 0);

    const stats = [
        { label: 'Total Earned', value: `₹${totalEarned.toLocaleString('en-IN')}`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'This Month', value: `₹${monthlyEarned.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Pending', value: `₹${totalPending.toLocaleString('en-IN')}`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { label: 'Total Sessions', value: classes.length, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    ];

    const getStudentName = (p: ApiPayment) =>
        p.studentId && typeof p.studentId === 'object' ? p.studentId.name : 'N/A';

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            overdue: 'bg-red-100 text-red-700',
        };
        return map[status] ?? '';
    };

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (isError) return <div className="flex items-center justify-center py-20 gap-2 text-red-500"><AlertCircle className="w-5 h-5" /><span className="text-sm">{(error as Error).message}</span></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Earnings</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Track your income and payment history</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <Card key={s.label} className={`border-0 shadow-sm ${s.bg}`}>
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white/60 dark:bg-black/20">
                                    <s.icon className={`w-5 h-5 ${s.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                                    <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{s.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader className="pb-2"><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                                    {['Date', 'Student', 'Amount', 'Status'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p, i) => (
                                    <tr key={p._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                                        style={{ borderBottom: i < payments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{format(new Date(p.paymentDate), 'dd MMM yyyy')}</td>
                                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{getStudentName(p)}</td>
                                        <td className="px-4 py-3 font-semibold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3"><Badge className={`text-xs border-0 ${statusBadge(p.status)}`}>{p.status}</Badge></td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>No payments recorded yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
