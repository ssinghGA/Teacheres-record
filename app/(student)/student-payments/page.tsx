'use client';

import { usePayments } from '@/lib/hooks/usePayments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentPaymentsPage() {
    const { data: paymentsData, isLoading } = usePayments();
    
    const myPayments = paymentsData?.payments ?? [];
    
    // Calculate total dues or paid
    const pendingPayments = myPayments.filter(p => p.status === 'pending' || p.status === 'overdue');
    const totalDue = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const paidPayments = myPayments.filter(p => p.status === 'paid');
    const totalPaid = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const sortedPayments = [...myPayments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Billing & Payments</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    Track your class fees and settlement status.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-0 shadow-sm bg-orange-50 dark:bg-orange-900/20">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Amount Due</p>
                                <p className="text-3xl font-bold mt-1 text-orange-950 dark:text-orange-100">
                                    ₹{totalDue.toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs mt-2 text-orange-700 dark:text-orange-300">
                                    {pendingPayments.length} pending invoice{pendingPayments.length !== 1 && 's'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-orange-200 dark:bg-orange-900/40">
                                <DollarSign className="w-6 h-6 text-orange-700 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-emerald-50 dark:bg-emerald-900/20">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Total Paid</p>
                                <p className="text-3xl font-bold mt-1 text-emerald-950 dark:text-emerald-100">
                                    ₹{totalPaid.toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs mt-2 text-emerald-700 dark:text-emerald-300">
                                    {paidPayments.length} settled invoice{paidPayments.length !== 1 && 's'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-200 dark:bg-emerald-900/40">
                                <CreditCard className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-0" style={{ background: 'var(--card)' }}>
                <CardHeader className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                    <CardTitle className="text-lg">Payment Ledger</CardTitle>
                    <CardDescription>A complete history of your account billing.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 border-b" style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}>
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date Due/Paid</th>
                                    <th className="px-6 py-4 font-semibold">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {sortedPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                                            No billing history found.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedPayments.map((p) => (
                                        <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-emerald-600 opacity-70" />
                                                    <span className="font-medium">{format(new Date(p.paymentDate), 'MMM d, yyyy')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-base" style={{ color: 'var(--foreground)' }}>
                                                ₹{p.amount.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        p.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                                        p.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                                    }
                                                >
                                                    {p.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
