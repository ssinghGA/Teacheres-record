'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHomeworks, useDeleteHomework, useUpdateHomework } from '@/lib/hooks/useHomeworks';
import { useStudents } from '@/lib/hooks/useStudents';
import { useTeachers } from '@/lib/hooks/useTeachers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    ClipboardList, Plus, Search, Calendar, User, BookOpen, 
    FileText, Loader2, Trash2, MoreVertical, Download, 
    CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AddHomeworkDialog from '@/components/dashboard/AddHomeworkDialog';
import HomeworkDetailsDialog from '@/components/dashboard/HomeworkDetailsDialog';
import SubmitHomeworkDialog from '@/components/dashboard/SubmitHomeworkDialog';
import { Pagination } from '@/components/dashboard/Pagination';
import type { Homework } from '@/types';

export default function HomeworkPage() {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [homeworkDialog, setHomeworkDialog] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [submitOpen, setSubmitOpen] = useState(false);
    const [selectedHw, setSelectedHw] = useState<Homework | null>(null);

    const queryParams: Record<string, string> = {
        page: String(page),
        limit: '10',
    };

    if (user?.role === 'teacher') {
        queryParams.teacherId = user._id;
    } else if (user?.role === 'student') {
        queryParams.studentId = user._id;
    }

    const { data: studentsData } = useStudents(user?.role === 'teacher' ? { teacherId: user._id } : {});
    // Only fetch all teachers if user is NOT a student (prevents 403)
    const { data: teachersData } = useTeachers({}, { enabled: user?.role !== 'student' });
    const { data, isLoading } = useHomeworks(queryParams);
    const deleteHomework = useDeleteHomework();
    const updateHomework = useUpdateHomework();

    const students = studentsData?.students ?? [];
    const teachers: any[] = (teachersData as any)?.teachers ?? [];

    const homeworks = data?.homeworks ?? [];
    const pagination = data?.pagination;

    const statusStyles: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-700 border-amber-100',
        submitted: 'bg-blue-50 text-blue-700 border-blue-100',
        graded: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                        <ClipboardList className="w-6 h-6 text-emerald-600" />
                        Homework Assignments
                    </h1>
                    <p className="text-sm mt-1 text-muted-foreground">
                        {user?.role === 'teacher' 
                            ? 'Manage and track tasks assigned to your students' 
                            : 'Review and complete your upcoming assignments'}
                    </p>
                </div>
                {user?.role === 'teacher' && (
                    <Button 
                        onClick={() => setHomeworkDialog(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 h-11 font-bold gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        New Assignment
                    </Button>
                )}
            </div>

            <Card className="shadow-sm border bg-card">
                <CardHeader className="pb-0 border-b">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by topic or subject..." 
                                className="pl-10 h-10 rounded-xl bg-muted/30 border-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 text-left border-b">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic & Subject</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{user?.role === 'student' ? 'Teacher' : 'Student'}</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Date</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    {user?.role === 'teacher' && (
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Submission</th>
                                    )}
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {homeworks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <ClipboardList className="w-8 h-8 opacity-20" />
                                                <p>No homework assignments found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    homeworks.map((hw: Homework) => {
                                        const otherParty = user?.role === 'teacher' ? hw.studentId : hw.teacherId;
                                        let otherName = 'Unknown';
                                        
                                        // Case 1: Backend populated the object
                                        if (otherParty && typeof otherParty === 'object' && 'name' in otherParty) {
                                            otherName = otherParty.name;
                                        } 
                                        // Case 2: ID string, look up in local arrays (fallback)
                                        else if (typeof otherParty === 'string') {
                                            if (user?.role === 'teacher') {
                                                otherName = students.find((s: any) => s._id === otherParty)?.name || 'Unknown Student';
                                            } else {
                                                otherName = teachers.find((t: any) => t._id === otherParty)?.name || 'Your Teacher';
                                            }
                                        }
                                        
                                        return (
                                            <tr key={hw._id} className="hover:bg-accent/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-foreground group-hover:text-emerald-600 transition-colors">{hw.topic}</p>
                                                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                                                            <BookOpen className="w-3 h-3" /> {hw.subject}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                            {otherName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold">{otherName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {format(new Date(hw.createdAt), 'dd MMM yyyy')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 font-bold ${new Date(hw.dueDate || '') < new Date() ? 'text-rose-500' : 'text-amber-600'}`}>
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {hw.dueDate ? format(new Date(hw.dueDate), 'dd MMM yyyy') : 'No date'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={`rounded-full px-3 py-0.5 border-0 font-bold text-[10px] uppercase tracking-wider shadow-sm ${statusStyles[hw.status]}`}>
                                                        {hw.status}
                                                    </Badge>
                                                </td>
                                                {user?.role === 'teacher' && (
                                                    <td className="px-6 py-4">
                                                        {(hw as any).submissions && (hw as any).submissions.length > 0 ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> {(hw as any).submissions.length} File(s)
                                                                </span>
                                                                <Button 
                                                                    variant="link" 
                                                                    className="h-auto p-0 text-[10px] font-bold text-blue-600 justify-start hover:text-blue-700"
                                                                    onClick={() => toast.info('Previewing submission files...')}
                                                                >
                                                                    View Submission
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground opacity-50">Not Submitted</span>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {hw.attachments && hw.attachments.length > 0 && (
                                                            <Button 
                                                                onClick={() => {
                                                                    toast.success(`Downloading ${hw.attachments?.length} attachment(s)...`);
                                                                    setTimeout(() => toast.info('Materials downloaded to your device'), 1500);
                                                                }}
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50" 
                                                                title="Download Materials"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted font-bold transition-all">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl border-none">
                                                                <DropdownMenuItem 
                                                                    onClick={() => {
                                                                        setSelectedHw(hw);
                                                                        setDetailsOpen(true);
                                                                    }}
                                                                    className="rounded-lg gap-2 text-sm font-medium h-10"
                                                                >
                                                                    <FileText className="w-4 h-4" /> View Details
                                                                </DropdownMenuItem>
                                                                {user?.role === 'student' && hw.status === 'pending' && (
                                                                    <DropdownMenuItem 
                                                                        onClick={() => {
                                                                            setSelectedHw(hw);
                                                                            setSubmitOpen(true);
                                                                        }}
                                                                        className="rounded-lg gap-2 text-sm font-medium h-10 text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" /> Submit Homework
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {user?.role === 'teacher' && hw.status !== 'graded' && (
                                                                    <>
                                                                        <DropdownMenuItem 
                                                                            onClick={() => updateHomework.mutate({ id: hw._id, status: 'graded' })}
                                                                            className="rounded-lg gap-2 text-sm font-medium h-10 text-emerald-600"
                                                                        >
                                                                            <CheckCircle2 className="w-4 h-4" /> Mark Graded
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem 
                                                                            onClick={() => deleteHomework.mutate(hw._id)}
                                                                            className="rounded-lg gap-2 text-sm font-medium h-10 text-rose-500 focus:text-rose-600 focus:bg-rose-50"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" /> Delete Assignment
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {pagination && (
                    <div className="p-4 border-t">
                        <Pagination 
                            currentPage={pagination.page} 
                            totalPages={pagination.totalPages} 
                            onPageChange={setPage} 
                        />
                    </div>
                )}
            </Card>

            <AddHomeworkDialog 
                open={homeworkDialog} 
                onOpenChange={setHomeworkDialog} 
                teacherId={user?._id || ''} 
            />

            <SubmitHomeworkDialog 
                open={submitOpen} 
                onOpenChange={setSubmitOpen} 
                homework={selectedHw} 
            />

            <HomeworkDetailsDialog 
                open={detailsOpen} 
                onOpenChange={setDetailsOpen} 
                homework={selectedHw} 
                userName={selectedHw ? (
                    typeof (user?.role === 'teacher' ? selectedHw.studentId : selectedHw.teacherId) === 'object' 
                    ? (user?.role === 'teacher' ? (selectedHw.studentId as any).name : (selectedHw.teacherId as any).name)
                    : (user?.role === 'teacher' 
                        ? (students.find((s: any) => s._id === selectedHw.studentId)?.name || 'Student')
                        : (teachers.find((t: any) => t._id === selectedHw.teacherId)?.name || 'Teacher')
                    )
                ) : ''}
            />
        </div>
    );
}
