'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent, type ApiStudent } from '@/lib/hooks/useStudents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Pencil, Trash2, Users, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const studentSchema = z.object({
    name: z.string().min(2, 'Name required'),
    class: z.string().min(1, 'Class required'),
    school: z.string().optional(),
    parentName: z.string().optional(),
    parentPhone: z.string().optional(),
    email: z.union([z.string().email('Valid email required'), z.literal('')]).optional(),
    subject: z.string().min(2, 'Subject required'),
    startDate: z.string().min(1, 'Start date required'),
    status: z.enum(['active', 'inactive', 'pending']),
    notes: z.string().optional(),
});
type StudentForm = z.infer<typeof studentSchema>;

export default function StudentsPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const { data, isLoading, isError, error } = useStudents({ search: search || undefined });
    const createStudent = useCreateStudent();
    const deleteStudent = useDeleteStudent();

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<StudentForm>({
        resolver: zodResolver(studentSchema),
        defaultValues: { status: 'active', startDate: new Date().toISOString().split('T')[0] },
    });

    const students = data?.students ?? [];
    const filtered = statusFilter === 'all' ? students : students.filter(s => s.status === statusFilter);

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        };
        return map[status] ?? '';
    };

    const openAdd = () => {
        setEditingId(null);
        reset({ status: 'active', startDate: new Date().toISOString().split('T')[0] });
        setDialogOpen(true);
    };

    const openEdit = (s: ApiStudent) => {
        setEditingId(s._id);
        reset({
            name: s.name, class: s.class, school: s.school,
            parentName: s.parentName, parentPhone: s.parentPhone,
            email: s.email, subject: s.subject,
            startDate: s.startDate.split('T')[0],
            status: s.status, notes: s.notes ?? '',
        });
        setDialogOpen(true);
    };

    const dynamicUpdate = useUpdateStudent(editingId ?? '');

    const onSubmit = async (data: StudentForm) => {
        if (editingId) {
            await dynamicUpdate.mutateAsync(data);
        } else {
            await createStudent.mutateAsync(data);
        }
        setDialogOpen(false);
        reset();
    };

    if (isLoading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    if (isError) return (
        <div className="flex items-center justify-center py-20 gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="text-sm text-red-500">{(error as Error).message}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                        {user?.role === 'teacher' ? 'My Students' : 'All Students'}
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> Add Student
                </Button>
            </div>

            {/* Filters */}
            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                        <Input placeholder="Search students..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? 'all')}>
                        <SelectTrigger className="sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Student Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((s) => (
                    <Card key={s._id} className="shadow-sm border hover:shadow-md transition-all" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                                    {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/students/${s._id}`} className="font-semibold hover:text-blue-600 transition-colors" style={{ color: 'var(--foreground)' }}>
                                        {s.name}
                                    </Link>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{s.school} · {s.class}</p>
                                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.subject}</p>
                                </div>
                                <Badge className={`text-xs border-0 flex-shrink-0 ${statusBadge(s.status)}`}>{s.status}</Badge>
                            </div>
                            <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    Since {s.startDate ? format(new Date(s.startDate), 'dd MMM yyyy') : 'N/A'}
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(s)}>
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost" size="sm"
                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => setDeleteConfirm(s._id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <Users className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No students found</p>
                    </div>
                )}
            </div>

            {/* Delete confirm */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Delete Student?</DialogTitle></DialogHeader>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={async () => {
                                if (deleteConfirm) {
                                    await deleteStudent.mutateAsync(deleteConfirm);
                                    setDeleteConfirm(null);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1"><Label>Full Name *</Label>
                                <Input placeholder="Student name" {...register('name')} />
                                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Class *</Label>
                                <Input placeholder="e.g. Grade 10" {...register('class')} />
                                {errors.class && <p className="text-xs text-red-500">{errors.class.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Subject *</Label>
                                <Input placeholder="e.g. Math" {...register('subject')} />
                                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
                            </div>
                            {/* <div className="col-span-2 space-y-1"><Label>School</Label>
                                <Input placeholder="School name" {...register('school')} />
                                {errors.school && <p className="text-xs text-red-500">{errors.school.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Parent Name</Label>
                                <Input placeholder="Parent name" {...register('parentName')} />
                                {errors.parentName && <p className="text-xs text-red-500">{errors.parentName.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Parent Phone</Label>
                                <Input placeholder="Phone number" {...register('parentPhone')} />
                                {errors.parentPhone && <p className="text-xs text-red-500">{errors.parentPhone.message}</p>}
                            </div>
                            <div className="col-span-2 space-y-1"><Label>Email</Label>
                                <Input type="email" placeholder="student@email.com" {...register('email')} />
                                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                            </div> */}
                            <div className="space-y-1"><Label>Start Date *</Label>
                                <Input type="date" {...register('startDate')} />
                                {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Status *</Label>
                                <Controller name="status" control={control} render={({ field }) => (
                                    <Select value={field.value} onValueChange={v => field.onChange(v ?? 'active')}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                            <div className="col-span-2 space-y-1"><Label>Notes</Label>
                                <Input placeholder="Additional notes..." {...register('notes')} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={createStudent.isPending || dynamicUpdate.isPending}
                            >
                                {(createStudent.isPending || dynamicUpdate.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editingId ? 'Save Changes' : 'Add Student'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
