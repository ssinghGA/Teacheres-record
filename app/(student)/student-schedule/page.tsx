'use client';

import { useState } from 'react';
import { useClasses } from '@/lib/hooks/useClasses';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, BookOpen, Search, User, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>My Schedule</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        View all your upcoming and past classes
                    </p>
                </div>
                {allClasses.length > 0 && typeof allClasses[0].teacherId === 'object' && allClasses[0].teacherId?.googleMeetLink && (
                    <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-500/20 rounded-xl px-6 h-10 transition-all"
                        onClick={() => {
                            const link = (allClasses[0].teacherId as any).googleMeetLink;
                            window.open(link.startsWith('http') ? link : `https://${link}`, '_blank');
                        }}
                    >
                        <Video className="w-4 h-4" />
                        Join Your Class
                    </Button>
                )}
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
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Join Class</th>
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
                                                                <div className="flex flex-col">
                                                                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.teacherId.email}</p>
                                                                    {typeof c.teacherId === 'object' && c.teacherId !== null && c.teacherId.googleMeetLink ? (
                                                                        <a 
                                                                            href={c.teacherId.googleMeetLink.startsWith('http') ? c.teacherId.googleMeetLink : `https://${c.teacherId.googleMeetLink}`} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer" 
                                                                            className="text-[10px] text-emerald-600 hover:text-emerald-500 font-medium flex items-center gap-1 mt-1 group"
                                                                        >
                                                                            <Video className="w-3 h-3" /> 
                                                                            <span>Join Meet</span>
                                                                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-[10px] text-amber-600 italic mt-1 font-medium">Link not set</span>
                                                                    )}
                                                                </div>
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

                                                {/* Join Class */}
                                                <td className="px-6 py-4 text-right">
                                                    {typeof c.teacherId === 'object' && c.teacherId !== null && c.teacherId.googleMeetLink ? (
                                                        <Button 
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 gap-1.5"
                                                            onClick={() => {
                                                                const link = (c.teacherId as any).googleMeetLink;
                                                                window.open(link.startsWith('http') ? link : `https://${link}`, '_blank');
                                                            }}
                                                        >
                                                            <Video className="w-3.5 h-3.5" /> Join Meet
                                                        </Button>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground italic">Link not set</span>
                                                    )}
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
