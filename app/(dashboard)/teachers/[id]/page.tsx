'use client';

import { useParams } from 'next/navigation';
import { useTeacher } from '@/lib/hooks/useTeachers';
import { useStudents } from '@/lib/hooks/useStudents';
import { useClasses } from '@/lib/hooks/useClasses';
import { usePayments } from '@/lib/hooks/usePayments';
import { useReports } from '@/lib/hooks/useReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Mail, Phone, BookOpen, GraduationCap, Users, DollarSign, TrendingUp, Video, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function TeacherDetailsPage() {
    const { id } = useParams();
    const teacherId = typeof id === 'string' ? id : '';

    const { data: teacher, isLoading: loadingTeacher, isError: teacherError } = useTeacher(teacherId);
    const { data: studentsData, isLoading: loadingStudents } = useStudents();
    const { data: classesData, isLoading: loadingClasses } = useClasses();
    const { data: paymentsData, isLoading: loadingPayments } = usePayments();
    const { data: reportsData, isLoading: loadingReports } = useReports();

    if (loadingTeacher) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    if (teacherError || !teacher) return (
        <div className="text-center py-20 text-red-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Teacher not found or error loading data</p>
            <Link href="/teachers"><Button variant="outline" className="mt-4">Back to Teachers</Button></Link>
        </div>
    );

    const students = (studentsData?.students ?? []).filter((s) => 
        typeof s.teacherId === 'string' ? s.teacherId === teacherId : (s.teacherId as any)?._id === teacherId
    );
    const classes = (classesData?.classes ?? []).filter((c) => 
        typeof c.teacherId === 'string' ? c.teacherId === teacherId : (c.teacherId as any)?._id === teacherId
    );
    const payments = (paymentsData?.payments ?? []).filter((p) => 
        typeof p.teacherId === 'string' ? p.teacherId === teacherId : (p.teacherId as any)?._id === teacherId
    );
    const reports = (reportsData?.reports ?? []).filter((r) => 
        typeof r.teacherId === 'string' ? r.teacherId === teacherId : (r.teacherId as any)?._id === teacherId
    );

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
            active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            upcoming: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            scheduled: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        };
        return map[status] ?? '';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/teachers">
                        <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{teacher.name}</h1>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Teacher Profile</p>
                    </div>
                </div>
                {teacher.googleMeetLink && (
                    <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-500/20 rounded-xl px-6 h-10 transition-all"
                        onClick={() => window.open(teacher.googleMeetLink?.startsWith('http') ? teacher.googleMeetLink : `https://${teacher.googleMeetLink}`, '_blank')}
                    >
                        <Video className="w-4 h-4" />
                        Join Class / Meet
                    </Button>
                )}
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
                                {teacher.experience !== undefined && (
                                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Experience: <span className="font-medium" style={{ color: 'var(--foreground)' }}>{teacher.experience} years</span></p>
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
                    {teacher.googleMeetLink && (
                        <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex items-center gap-2 text-sm">
                                <Video className="w-4 h-4 text-emerald-600" />
                                <span className="font-medium" style={{ color: 'var(--foreground)' }}>Static Google Meet Link:</span>
                                <span className="text-emerald-700 dark:text-emerald-400 break-all">{teacher.googleMeetLink}</span>
                            </div>
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
                            <Card key={student._id} className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
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
                                            const studentName = typeof c.studentId === 'object' ? c.studentId.name : 'Unknown';
                                            return (
                                                <tr key={c._id} style={{ borderBottom: i < classes.length - 1 ? '1px solid var(--border)' : 'none' }}
                                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                                                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{studentName}</td>
                                                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{c.topic}</td>
                                                    <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{format(new Date(c.date), 'dd MMM yyyy')}</td>
                                                    <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{c.duration} min</td>
                                                    <td className="px-4 py-3 font-semibold text-emerald-600">₹{c.amount}</td>
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
                            { label: 'Average class rate', value: completedClasses.length > 0 ? `₹${Math.round(classes.reduce((s, c) => s + c.amount, 0) / (classes.length || 1))}` : 'N/A' },
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
