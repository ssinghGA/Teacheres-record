'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/lib/hooks/useStudents';
import { useClasses } from '@/lib/hooks/useClasses';
import { usePayments } from '@/lib/hooks/usePayments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, DollarSign, CalendarClock, TrendingUp, ArrowUpRight, Loader2, Video, MoreVertical, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { ApiStudent } from '@/lib/hooks/useStudents';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { apiPost } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DashboardPage() {
    const { user } = useAuth();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const { data: studentsData, isLoading: loadingStudents } = useStudents({ limit: '10' });
    const { data: classesData, isLoading: loadingClasses } = useClasses({ limit: 10 });
    const { data: paymentsData, isLoading: loadingPayments } = usePayments();

    const [processingId, setProcessingId] = useState<string | null>(null);

    const isLoading = loadingStudents || loadingClasses || loadingPayments;

    const handleStartClass = async (classId: string, meetLink: string) => {
        try {
            setProcessingId(classId);
            await apiPost('/classes/start', { classId });
            const link = meetLink.startsWith('http') ? meetLink : `https://${meetLink}`;
            window.open(link, '_blank');
            toast.success('Class started successfully');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to start class');
        } finally {
            setProcessingId(null);
        }
    };

    const handleEndClass = async (classId: string) => {
        try {
            setProcessingId(classId);
            await apiPost('/classes/end', { classId });
            toast.success('Class ended successfully');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to end class');
        } finally {
            setProcessingId(null);
        }
    };

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

    const upcomingClasses = mySessions.filter((c) => c.status === 'scheduled' || c.status === 'ongoing');

    const stats = [
        {
            title: 'Total Students',
            value: myStudents.length,
            icon: Users,
            color: 'blue',
            trend: 'Active enrollment',
            borderColor: 'border-blue-500',
            iconColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            title: 'Classes This Month',
            value: classesThisMonth.length,
            icon: BookOpen,
            color: 'indigo',
            trend: `${mySessions.filter(c => c.status === 'completed').length} completed total`,
            borderColor: 'border-indigo-500',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
        },
        {
            title: 'Total Earnings',
            value: `₹${totalEarnings.toLocaleString('en-IN')}`,
            icon: DollarSign,
            color: 'emerald',
            trend: 'From completed classes',
            borderColor: 'border-emerald-500',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'Upcoming Classes',
            value: upcomingClasses.length,
            icon: CalendarClock,
            color: 'orange',
            trend: 'Scheduled ahead',
            borderColor: 'border-orange-500',
            iconColor: 'text-orange-600 dark:text-orange-400',
        },
    ];

    const recentSessions = [...mySessions]
        .filter((c) => c.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const getStudentName = (studentField: string | ApiStudent) => {
        if (!studentField) return 'Unknown';
        if (studentField && typeof studentField === 'object') return studentField.name;
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                        Welcome back, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        {format(now, 'EEEE, MMMM d, yyyy')} · Here&apos;s what&apos;s happening today
                    </p>
                </div>
                {user?.role === 'teacher' && user.googleMeetLink && (
                    <a
                        href={user.googleMeetLink.startsWith('http') ? user.googleMeetLink : `https://${user.googleMeetLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-xl px-6 h-10 inline-flex items-center justify-center font-medium text-sm transition-all"
                    >
                        <Video className="w-4 h-4" />
                        Join Your Meet
                    </a>
                )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={i}
                            className={` shadow-sm bg-card transition-all hover:shadow-md hover:-translate-y-0.5`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-foreground)' }}>
                                            {stat.title}
                                        </p>
                                        <p className="text-3xl font-bold mt-1 tracking-tight" style={{ color: 'var(--foreground)' }}>
                                            {stat.value}
                                        </p>
                                        <div className="text-xs mt-3 flex items-center gap-1 font-medium" style={{ color: 'var(--muted-foreground)' }}>
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                            {stat.trend}
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-2xl bg-muted/30 dark:bg-muted/10`}>
                                        <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent sessions */}
                <Card className="lg:col-span-2 shadow-sm bg-card border">
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
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-4 h-4 text-primary" />
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
                <Card className="shadow-sm bg-card border">
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
                                        className="flex items-start gap-4 p-4 rounded-xl border border-border group relative transition-all hover:bg-accent/30"
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                                            <p className="text-base font-bold text-primary">{new Date(c.date).getDate()}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'var(--muted-foreground)' }}>
                                                {format(new Date(c.date), 'MMM')}
                                            </p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{c.topic}</p>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {user?.googleMeetLink && c.status !== 'ongoing' && (
                                                        <button
                                                            disabled={processingId === c._id}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleStartClass(c._id, user.googleMeetLink as string);
                                                            }}
                                                            className="p-1 px-2 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-md hover:bg-blue-200 flex items-center gap-1 disabled:opacity-50"
                                                            title="Start Class"
                                                        >
                                                            {processingId === c._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
                                                            Start Class
                                                        </button>
                                                    )}
                                                    {c.status === 'ongoing' && (
                                                        <button
                                                            disabled={processingId === c._id}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleEndClass(c._id);
                                                            }}
                                                            className="p-1 px-2 text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 rounded-md hover:bg-red-200 flex items-center gap-1 disabled:opacity-50"
                                                            title="End Class"
                                                        >
                                                            {processingId === c._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                                            End Class
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                                                {getStudentName(c.studentId as unknown as ApiStudent)} · {c.time}
                                            </p>
                                            <Badge className={`mt-1 text-xs border-0 ${c.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {c.status}
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
            <Card className="shadow-sm bg-card border">
                <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border">
                    <CardTitle className="text-base font-semibold">My Students</CardTitle>
                    <Link href="/students" className="text-sm text-blue-600 hover:underline">View all</Link>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table className="w-full text-sm">
                            <TableHeader>
                                <TableRow className="bg-muted/80 hover:bg-muted/80 border-b border-border">
                                    <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">Student</TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">Subject / Class</TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</TableHead>
                                    <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    myStudents.slice(0, 5).map((student) => (
                                        <TableRow key={student._id} className="border-b border-border/40 hover:bg-accent/50 transition-colors">
                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                                                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-semibold text-sm">{student.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium">{student.subject}</span>
                                                    <span className="text-[10px] text-muted-foreground">{student.class}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <Badge className={`text-[10px] uppercase tracking-wider font-bold border-0 ${student.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                    student.status === 'inactive' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    }`}>
                                                    {student.status?.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="h-7 w-7 p-0 flex items-center justify-center hover:bg-muted rounded-md transition-colors outline-none text-black mx-auto mr-0">
                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-32">
                                                        <Link href={`/students/${student._id}`}>
                                                            <DropdownMenuItem className="cursor-pointer text-xs">
                                                                View Details
                                                            </DropdownMenuItem>
                                                        </Link>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
