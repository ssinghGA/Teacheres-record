'use client';

import { useState } from 'react';
import { useClasses } from '@/lib/hooks/useClasses';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, BookOpen, Search, User } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

export default function StudentSchedulePage() {
    const { data, isLoading } = useClasses();
    const [searchQuery, setSearchQuery] = useState('');

    const allClasses = data?.classes ?? [];

    const filteredClasses = allClasses
        .filter(c => c.topic.toLowerCase().includes(searchQuery.toLowerCase()) || c.subject.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>My Schedule</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    View all your upcoming and past classes
                </p>
            </div>

            <Card className="shadow-sm border-0" style={{ background: 'var(--card)' }}>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                    <div>
                        <CardTitle className="text-lg">Class History</CardTitle>
                        <CardDescription>A complete log of your enrolled sessions.</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                        <Input
                            placeholder="Search topics or subjects..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 border-b" style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}>
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date & Time</th>
                                    <th className="px-6 py-4 font-semibold">Teacher</th>
                                    <th className="px-6 py-4 font-semibold">Subject</th>
                                    <th className="px-6 py-4 font-semibold">Topic</th>
                                    <th className="px-6 py-4 font-semibold">Duration</th>
                                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {filteredClasses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                                            No classes found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClasses.map((c) => {
                                        const teacherName = typeof c.teacherId === 'object' && c.teacherId !== null
                                            ? c.teacherId.name
                                            : 'Teacher';

                                        return (
                                            <tr key={c._id} className="hover:bg-muted/30 transition-colors">
                                                {/* Date & Time */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                                        <span className="font-medium">{format(new Date(c.date), 'MMM d, yyyy')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{c.time}</span>
                                                    </div>
                                                </td>

                                                {/* Teacher */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-700 dark:text-blue-300 font-bold text-xs">
                                                            {teacherName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{teacherName}</p>
                                                            {typeof c.teacherId === 'object' && c.teacherId !== null && (
                                                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.teacherId.email}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Subject */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-emerald-600 opacity-70" />
                                                        <span className="font-medium">{c.subject}</span>
                                                    </div>
                                                </td>

                                                {/* Topic */}
                                                <td className="px-6 py-4 truncate max-w-[180px]" style={{ color: 'var(--foreground)' }}>
                                                    {c.topic}
                                                </td>

                                                {/* Duration */}
                                                <td className="px-6 py-4" style={{ color: 'var(--muted-foreground)' }}>
                                                    {c.duration} mins
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 text-right">
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            c.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                                c.status === 'scheduled' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                        }
                                                    >
                                                        {c.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
