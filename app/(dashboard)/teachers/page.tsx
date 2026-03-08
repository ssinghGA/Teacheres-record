'use client';

import { useState } from 'react';
import { useTeachers, type ApiTeacher } from '@/lib/hooks/useTeachers';
import { useStudents } from '@/lib/hooks/useStudents';
import { useClasses } from '@/lib/hooks/useClasses';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TeachersPage() {
    const [search, setSearch] = useState('');

    const { data: teachers, isLoading, isError, error } = useTeachers();
    const { data: allStudents } = useStudents();
    const { data: allClasses } = useClasses();

    const filtered = (teachers ?? []).filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (t.subjects ?? []).some(s => s.toLowerCase().includes(search.toLowerCase()))
    );

    const getTeacherStudentCount = (tid: string) =>
        (allStudents?.students ?? []).filter(s =>
            typeof s.teacherId === 'string' ? s.teacherId === tid : (s.teacherId as { _id: string })._id === tid
        ).length;

    const getTeacherClassCount = (tid: string) =>
        (allClasses?.classes ?? []).filter(c =>
            typeof c.teacherId === 'string' ? c.teacherId === tid : (c.teacherId as { _id: string })._id === tid
        ).length;

    const getTeacherEarnings = (tid: string) =>
        (allClasses?.classes ?? [])
            .filter(c => (typeof c.teacherId === 'string' ? c.teacherId === tid : (c.teacherId as { _id: string })._id === tid) && c.status === 'completed')
            .reduce((s, c) => s + c.amount, 0);

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (isError) return <div className="flex items-center justify-center py-20 gap-2 text-red-500"><AlertCircle className="w-5 h-5" /><span className="text-sm">{(error as Error).message}</span></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Teachers</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} teacher{filtered.length !== 1 ? 's' : ''}</p>
            </div>

            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                        <Input placeholder="Search teachers by name, email, or subject..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(t => {
                    const studentCount = getTeacherStudentCount(t._id);
                    const classCount = getTeacherClassCount(t._id);
                    const earnings = getTeacherEarnings(t._id);
                    return (
                        <Link key={t._id} href={`/teachers/${t._id}`}>
                            <Card className="shadow-sm border hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group"
                                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
                                            {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold group-hover:text-blue-600 transition-colors truncate" style={{ color: 'var(--foreground)' }}>{t.name}</p>
                                            <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{t.email}</p>
                                            {t.city && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t.city}</p>}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {(t.subjects ?? []).slice(0, 3).map(s => (
                                            <Badge key={s} className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 border-0">{s}</Badge>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                                        {[{ label: 'Students', value: studentCount }, { label: 'Classes', value: classCount }, { label: 'Earnings', value: `₹${(earnings / 1000).toFixed(1)}k` }].map(stat => (
                                            <div key={stat.label} className="text-center">
                                                <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
                                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <GraduationCap className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No teachers found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
