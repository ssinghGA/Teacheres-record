'use client';

import { useParams } from 'next/navigation';
import { MOCK_USERS, MOCK_STUDENTS, MOCK_CLASSES, MOCK_PAYMENTS, MOCK_REPORTS } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Mail, Phone, BookOpen, GraduationCap, Users, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function TeacherDetailsPage() {
    const { id } = useParams();
    const teacher = MOCK_USERS.find((u) => u.id === id);

    if (!teacher) return (
        <div className="text-center py-20">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Teacher not found</p>
            <Link href="/teachers"><Button variant="outline" className="mt-4">Back to Teachers</Button></Link>
        </div>
    );

    const students = MOCK_STUDENTS.filter((s) => s.teacherId === id);
    const classes = MOCK_CLASSES.filter((c) => c.teacherId === id);
    const payments = MOCK_PAYMENTS.filter((p) => p.teacherId === id);
    const reports = MOCK_REPORTS.filter((r) => r.teacherId === id);
    const totalEarned = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const completedClasses = classes.filter(c => c.status === 'completed');

    const stats = [
        { label: 'Students', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Classes Done', value: completedClasses.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Reports', value: reports.length, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Total Earned', value: `₹${totalEarned.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    ];

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            active: 'bg-green-100 text-green-700', completed: 'bg-green-100 text-green-700',
            inactive: 'bg-red-100 text-red-700', upcoming: 'bg-orange-100 text-orange-700',
            pending: 'bg-yellow-100 text-yellow-700',
        };
        return map[status] ?? '';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/teachers">
                    <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{teacher.name}</h1>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Teacher Profile</p>
                </div>
            </div>

            {/* Profile card */}
            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 self-center">
                            {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    <span style={{ color: 'var(--foreground)' }}>{teacher.email}</span>
                                </div>
                                {teacher.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-blue-500" />
                                        <span style={{ color: 'var(--foreground)' }}>{teacher.phone}</span>
                                    </div>
                                )}
                                {teacher.city && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        <span style={{ color: 'var(--foreground)' }}>{teacher.city}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                {teacher.qualification && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <GraduationCap className="w-4 h-4 text-blue-500" />
                                        <span style={{ color: 'var(--foreground)' }}>{teacher.qualification}</span>
                                    </div>
                                )}
                                {teacher.experience && (
                                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Experience: <span className="font-medium" style={{ color: 'var(--foreground)' }}>{teacher.experience}</span></p>
                                )}
                                <div className="flex flex-wrap gap-1">
                                    {teacher.subjects?.map((s) => (
                                        <Badge key={s} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0">{s}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {teacher.bio && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{teacher.bio}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <Card key={s.label} className={`border-0 shadow-sm ${s.bg}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                                <div>
                                    <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{s.value}</p>
                                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="students">
                <TabsList>
                    <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
                    <TabsTrigger value="classes">Classes ({classes.length})</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {students.map((student) => (
                            <Card key={student.id} className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{student.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{student.class} · {student.subject} · {student.school}</p>
                                    </div>
                                    <Badge className={`text-xs border-0 ${statusBadge(student.status)}`}>{student.status}</Badge>
                                </CardContent>
                            </Card>
                        ))}
                        {students.length === 0 && <p className="col-span-2 text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>No students assigned</p>}
                    </div>
                </TabsContent>

                <TabsContent value="classes" className="mt-4">
                    <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                                            {['Student', 'Topic', 'Date', 'Duration', 'Amount', 'Status'].map((h) => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classes.map((c, i) => {
                                            const student = MOCK_STUDENTS.find(s => s.id === c.studentId);
                                            return (
                                                <tr key={c.id} style={{ borderBottom: i < classes.length - 1 ? '1px solid var(--border)' : 'none' }}
                                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                                                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{student?.name}</td>
                                                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{c.topic}</td>
                                                    <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{format(new Date(c.date), 'dd MMM yyyy')}</td>
                                                    <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{c.duration} min</td>
                                                    <td className="px-4 py-3 font-semibold text-emerald-600">₹{c.ratePerClass}</td>
                                                    <td className="px-4 py-3"><Badge className={`text-xs border-0 ${statusBadge(c.status)}`}>{c.status}</Badge></td>
                                                </tr>
                                            );
                                        })}
                                        {classes.length === 0 && (
                                            <tr><td colSpan={6} className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>No classes recorded</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'Average class rate', value: completedClasses.length > 0 ? `₹${Math.round(classes.reduce((s, c) => s + c.ratePerClass, 0) / (classes.length || 1))}` : 'N/A' },
                            { label: 'Avg. class duration', value: completedClasses.length > 0 ? `${Math.round(classes.reduce((s, c) => s + c.duration, 0) / (classes.length || 1))} min` : 'N/A' },
                            { label: 'Active students', value: students.filter(s => s.status === 'active').length },
                            { label: 'Completion rate', value: classes.length > 0 ? `${Math.round((completedClasses.length / classes.length) * 100)}%` : 'N/A' },
                        ].map((m) => (
                            <Card key={m.label} className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                                <CardContent className="p-4">
                                    <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{m.label}</p>
                                    <p className="text-2xl font-bold mt-1 text-blue-600">{m.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
