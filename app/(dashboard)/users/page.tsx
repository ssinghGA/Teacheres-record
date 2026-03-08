'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeachers, useCreateUser, type ApiTeacher } from '@/lib/hooks/useTeachers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Shield, AlertTriangle, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';

const userSchema = z.object({
    name: z.string().min(2, 'Full name is required'),
    email: z.string().email('Valid email required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['teacher', 'admin', 'super_admin']),
    phone: z.string().optional(),
    city: z.string().optional(),
    subjects: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.string().optional(),
});
type UserForm = z.infer<typeof userSchema>;

const roleBadge: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    teacher: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};
const roleLabel: Record<string, string> = { super_admin: 'Super Admin', admin: 'Admin', teacher: 'Teacher' };

export default function UsersPage() {
    const { user } = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [savedMsg, setSavedMsg] = useState('');
    const [apiError, setApiError] = useState('');

    const { data: teachers, isLoading, refetch } = useTeachers();
    const createUser = useCreateUser();

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
        defaultValues: { role: 'teacher' },
    });

    if (user?.role !== 'super_admin') {
        return (
            <div className="text-center py-20 space-y-3">
                <AlertTriangle className="w-12 h-12 mx-auto text-orange-500" />
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Access Restricted</h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Only Super Admins can manage users.</p>
            </div>
        );
    }

    const openAdd = () => {
        reset({ role: 'teacher' });
        setShowPassword(false);
        setApiError('');
        setDialogOpen(true);
    };

    const onSubmit = async (data: UserForm) => {
        setApiError('');
        try {
            await createUser.mutateAsync({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                phone: data.phone,
                city: data.city,
                subjects: data.subjects ? data.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
                qualification: data.qualification,
                experience: data.experience ? parseInt(data.experience) : undefined,
            });
            setSavedMsg(`User "${data.name}" created as ${roleLabel[data.role]}`);
            setDialogOpen(false);
            reset();
            refetch();
            setTimeout(() => setSavedMsg(''), 4000);
        } catch (err) {
            setApiError((err as Error).message);
        }
    };

    const allUsers = teachers ?? [];
    const counts = {
        super_admin: allUsers.filter(u => u.role === 'super_admin').length,
        admin: allUsers.filter(u => u.role === 'admin').length,
        teacher: allUsers.filter(u => u.role === 'teacher').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>User Management</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Create users and manage their roles</p>
                </div>
                <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <UserPlus className="w-4 h-4" /> Create User
                </Button>
            </div>

            {savedMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />{savedMsg}
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Super Admins', count: counts.super_admin, badge: roleBadge.super_admin },
                    { label: 'Admins', count: counts.admin, badge: roleBadge.admin },
                    { label: 'Teachers', count: counts.teacher, badge: roleBadge.teacher },
                ].map(item => (
                    <Card key={item.label} className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <CardContent className="p-4">
                            <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{item.count}</p>
                            <Badge className={`mt-1 text-xs border-0 ${item.badge}`}>{item.label}</Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" /> All System Users
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                                        {['User', 'Email', 'City', 'Subjects', 'Experience', 'Role'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.map((u, i) => (
                                        <tr key={u._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                                            style={{ borderBottom: i < allUsers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                                                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{u.email}</td>
                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{u.city ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {(u.subjects ?? []).slice(0, 2).map(s => (
                                                        <Badge key={s} className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 border-0">{s}</Badge>
                                                    ))}
                                                    {(u.subjects ?? []).length === 0 && <span style={{ color: 'var(--muted-foreground)' }}>—</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                                {u.experience ? `${u.experience} yr${u.experience !== 1 ? 's' : ''}` : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className={`text-xs border-0 ${roleBadge[u.role]}`}>{roleLabel[u.role]}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {allUsers.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>No users found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-blue-600" /> Create New User
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1"><Label>Full Name *</Label>
                                <Input placeholder="e.g. Priya Sharma" {...register('name')} />
                                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            </div>
                            <div className="col-span-2 space-y-1"><Label>Email Address *</Label>
                                <Input type="email" placeholder="user@school.com" {...register('email')} />
                                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                            </div>
                            <div className="col-span-2 space-y-1"><Label>Password *</Label>
                                <div className="relative">
                                    <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pr-10" {...register('password')} />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                            </div>
                            <div className="col-span-2 space-y-1"><Label>Role *</Label>
                                <Controller name="role" control={control} render={({ field }) => (
                                    <Select value={field.value} onValueChange={v => field.onChange(v ?? 'teacher')}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="teacher">👩‍🏫 Teacher</SelectItem>
                                            <SelectItem value="admin">🛡️ Admin</SelectItem>
                                            <SelectItem value="super_admin">⚡ Super Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                                {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
                            </div>
                            <div className="space-y-1"><Label>Phone</Label><Input placeholder="+91 98765 43210" {...register('phone')} /></div>
                            <div className="space-y-1"><Label>City</Label><Input placeholder="e.g. Mumbai" {...register('city')} /></div>
                            <div className="col-span-2 space-y-1"><Label>Subjects (comma separated)</Label>
                                <Input placeholder="Mathematics, Physics" {...register('subjects')} />
                            </div>
                            <div className="space-y-1"><Label>Qualification</Label><Input placeholder="e.g. M.Sc." {...register('qualification')} /></div>
                            <div className="space-y-1"><Label>Experience (years)</Label><Input type="number" placeholder="e.g. 5" {...register('experience')} /></div>
                        </div>
                        {apiError && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">{apiError}</p>}
                        <div className="p-3 rounded-xl text-xs" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                            <p className="font-semibold mb-1">Role Permissions:</p>
                            <p>• <strong>Teacher</strong> — View own students, classes, reports, earnings</p>
                            <p>• <strong>Admin</strong> — View all teachers, students, classes, reports</p>
                            <p>• <strong>Super Admin</strong> — Full access + user management + permissions</p>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white gap-2" disabled={createUser.isPending}>
                                {createUser.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                <UserPlus className="w-4 h-4" /> Create User
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
