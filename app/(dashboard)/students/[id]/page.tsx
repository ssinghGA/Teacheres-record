'use client';

import { useParams } from 'next/navigation';
import { MOCK_STUDENTS, MOCK_CLASSES, MOCK_REPORTS, MOCK_PAYMENTS } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, School, Calendar, User, BookOpen, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function StudentProfilePage() {
    const { id } = useParams();
    const student = MOCK_STUDENTS.find((s) => s.id === id);

    if (!student) return (
        <div className="text-center py-20">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Student not found</p>
            <Link href="/students"><Button variant="outline" className="mt-4">Back to Students</Button></Link>
        </div>
    );

    const classes = MOCK_CLASSES.filter((c) => c.studentId === id);
    const reports = MOCK_REPORTS.filter((r) => r.studentId === id);
    const payments = MOCK_PAYMENTS.filter((p) => p.studentId === id);
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        };
        return map[status] ?? '';
    };

    const StarRating = ({ value }: { value: number }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={`text-sm ${s <= value ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/students">
                    <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{student.name}</h1>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Student Profile</p>
                </div>
            </div>

            {/* Profile card */}
            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 self-center">
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-blue-500" /> <span style={{ color: 'var(--muted-foreground)' }}>Class:</span> <span className="font-medium" style={{ color: 'var(--foreground)' }}>{student.class}</span></div>
                                <div className="flex items-center gap-2 text-sm"><School className="w-4 h-4 text-blue-500" /> <span style={{ color: 'var(--muted-foreground)' }}>School:</span> <span className="font-medium" style={{ color: 'var(--foreground)' }}>{student.school}</span></div>
                                <div className="flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4 text-blue-500" /> <span style={{ color: 'var(--muted-foreground)' }}>Subject:</span> <span className="font-medium" style={{ color: 'var(--foreground)' }}>{student.subject}</span></div>
                                <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-blue-500" /> <span style={{ color: 'var(--muted-foreground)' }}>Joined:</span> <span className="font-medium" style={{ color: 'var(--foreground)' }}>{format(new Date(student.startDate), 'dd MMM yyyy')}</span></div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-blue-500" /> <span style={{ color: 'var(--muted-foreground)' }}>Parent:</span> <span className="font-medium" style={{ color: 'var(--foreground)' }}>{student.parentName}</span></div>
                                <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-blue-500" /> <span className="font-medium" style={{ color: 'var(--foreground)' }}>{student.parentPhone}</span></div>
                                <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-blue-500" /> <span className="font-medium truncate" style={{ color: 'var(--foreground)' }}>{student.email}</span></div>
                                <div><Badge className={`text-xs border-0 ${statusBadge(student.status)}`}>{student.status}</Badge></div>
                            </div>
                        </div>
                    </div>

                    {/* Summary stats */}
                    <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                        {[
                            { label: 'Total Classes', value: classes.length, icon: BookOpen, color: 'text-blue-600' },
                            { label: 'Progress Reports', value: reports.length, icon: TrendingUp, color: 'text-indigo-600' },
                            { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-600' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
                                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                                <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="classes">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="classes">Class History ({classes.length})</TabsTrigger>
                    <TabsTrigger value="reports">Progress Reports ({reports.length})</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="classes" className="mt-4">
                    <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                                            {['Date', 'Topic', 'Subject', 'Duration', 'Amount', 'Status'].map((h) => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classes.map((c, i) => (
                                            <tr key={c.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10" style={{ borderBottom: i < classes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                                <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{format(new Date(c.date), 'dd MMM yyyy')}</td>
                                                <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{c.topic}</td>
                                                <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{c.subject}</td>
                                                <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{c.duration} min</td>
                                                <td className="px-4 py-3 font-semibold text-emerald-600">₹{c.ratePerClass}</td>
                                                <td className="px-4 py-3">
                                                    <Badge className={`text-xs border-0 ${c.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{c.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {classes.length === 0 && (
                                            <tr><td colSpan={6} className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>No classes recorded yet</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reports" className="mt-4">
                    <div className="space-y-3">
                        {reports.map((r) => (
                            <Card key={r.id} className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{r.topicCovered}</p>
                                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.subject} · {format(new Date(r.date), 'dd MMM yyyy')}</p>
                                        </div>
                                        <StarRating value={r.understandingLevel} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Homework</p>
                                            <p style={{ color: 'var(--foreground)' }}>{r.homeworkGiven}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Remarks</p>
                                            <p style={{ color: 'var(--foreground)' }}>{r.remarks}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {reports.length === 0 && <p className="text-center py-10 text-sm" style={{ color: 'var(--muted-foreground)' }}>No progress reports yet</p>}
                    </div>
                </TabsContent>

                <TabsContent value="payments" className="mt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                            <CardContent className="p-4">
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Total Paid</p>
                                <p className="text-2xl font-bold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                            <CardContent className="p-4">
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Pending Amount</p>
                                <p className="text-2xl font-bold text-orange-500">₹{totalPending.toLocaleString('en-IN')}</p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                                            {['Date', 'Amount', 'Status'].map((h) => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((p, i) => (
                                            <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                                <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{format(new Date(p.date), 'dd MMM yyyy')}</td>
                                                <td className="px-4 py-3 font-semibold text-emerald-600">₹{p.amount}</td>
                                                <td className="px-4 py-3">
                                                    <Badge className={`text-xs border-0 ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{p.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
