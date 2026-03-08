'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/lib/hooks/useStudents';
import { useClasses } from '@/lib/hooks/useClasses';
import { usePayments } from '@/lib/hooks/usePayments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, DollarSign, CalendarClock, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import type { ApiStudent } from '@/lib/hooks/useStudents';

export default function DashboardPage() {
    const { user } = useAuth();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const { data: studentsData, isLoading: loadingStudents } = useStudents();
    const { data: classesData, isLoading: loadingClasses } = useClasses();
    const { data: paymentsData, isLoading: loadingPayments } = usePayments();

    const isLoading = loadingStudents || loadingClasses || loadingPayments;

    const myStudents = studentsData?.students ?? [];
    const mySessions = classesData?.classes ?? [];
    const myPayments = paymentsData?.payments ?? [];

    const classesThisMonth = mySessions.filter((c) => {
        const d = new Date(c.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalEarnings = mySessions
        .filter((c) => c.status === 'completed')
        .reduce((sum, c) => sum + (c.amount || 0), 0);

    const upcomingClasses = mySessions.filter((c) => c.status === 'scheduled');

    const stats = [
        {
            title: 'Total Students',
            value: myStudents.length,
            icon: Users,
            color: 'blue',
            trend: 'Active enrollment',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            iconBg: 'bg-blue-100 dark:bg-blue-900/40',
            iconColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            title: 'Classes This Month',
            value: classesThisMonth.length,
            icon: BookOpen,
            color: 'indigo',
            trend: `${mySessions.filter(c => c.status === 'completed').length} completed total`,
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
        },
        {
            title: 'Total Earnings',
            value: `₹${totalEarnings.toLocaleString('en-IN')}`,
            icon: DollarSign,
            color: 'emerald',
            trend: 'From completed classes',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'Upcoming Classes',
            value: upcomingClasses.length,
            icon: CalendarClock,
            color: 'orange',
            trend: 'Scheduled ahead',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            iconBg: 'bg-orange-100 dark:bg-orange-900/40',
            iconColor: 'text-orange-600 dark:text-orange-400',
        },
    ];

    const recentSessions = [...mySessions]
        .filter((c) => c.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const getStudentName = (studentField: string | ApiStudent) => {
        if (!studentField) return 'Unknown';
        if (typeof studentField === 'object') return studentField.name;
        // fallback search if just ID
        return myStudents.find((s) => s._id === studentField)?.name ?? 'Unknown';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    Welcome back, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    {format(now, 'EEEE, MMMM d, yyyy')} · Here&apos;s what&apos;s happening today
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={i}
                            className={`border-0 shadow-sm ${stat.bg} transition-all hover:shadow-md hover:-translate-y-0.5`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                                            {stat.title}
                                        </p>
                                        <p className="text-3xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>
                                            {stat.value}
                                        </p>
                                        <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                                            <TrendingUp className="w-3 h-3" />
                                            {stat.trend}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                                        <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent sessions */}
                <Card className="lg:col-span-2 shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Recent Classes</CardTitle>
                            <Link href="/class-history" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                View all <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentSessions.length === 0 ? (
                                <p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>No completed classes yet</p>
                            ) : (
                                recentSessions.map((session) => (
                                    <div
                                        key={session._id}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                                                {session.topic}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {getStudentName(session.studentId as unknown as ApiStudent)} · {session.subject}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-emerald-600">₹{session.amount}</p>
                                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {format(new Date(session.date), 'dd MMM')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming classes */}
                <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Upcoming Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {upcomingClasses.length === 0 ? (
                                <p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>No scheduled classes</p>
                            ) : (
                                upcomingClasses.map((c) => (
                                    <div
                                        key={c._id}
                                        className="flex items-start gap-3 p-3 rounded-xl border"
                                        style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
                                    >
                                        <div className="flex-shrink-0 text-center">
                                            <p className="text-lg font-bold text-blue-600">{new Date(c.date).getDate()}</p>
                                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {format(new Date(c.date), 'MMM')}
                                            </p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{c.topic}</p>
                                            <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                                                {getStudentName(c.studentId as unknown as ApiStudent)} · {c.time}
                                            </p>
                                            <Badge className="mt-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-0">
                                                {c.duration} min
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active students overview */}
            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader className="pb-3 flex flex-row items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
                    <CardTitle className="text-base font-semibold">My Students</CardTitle>
                    <Link href="/students" className="text-sm text-blue-600 hover:underline">View all</Link>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {myStudents.length === 0 ? (
                            <p className="text-sm col-span-full py-2" style={{ color: 'var(--muted-foreground)' }}>No students enrolled yet.</p>
                        ) : (
                            myStudents.slice(0, 4).map((student) => (
                                <div
                                    key={student._id}
                                    className="flex items-center gap-3 p-3 rounded-xl border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{student.name}</p>
                                        <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{student.subject} · {student.class}</p>
                                    </div>
                                    <Badge className={`text-xs border-0 flex-shrink-0 ${student.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                        student.status === 'inactive' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        }`}>
                                        {student.status?.replace('_', ' ')}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
