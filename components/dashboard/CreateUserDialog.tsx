'use client';

import { useState } from 'react';
import { useCreateUser } from '@/lib/hooks/useTeachers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';

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

const roleLabel: Record<string, string> = { super_admin: 'Super Admin', admin: 'Admin', teacher: 'Teacher' };

interface CreateUserDialogProps {
    trigger?: React.ReactNode;
    defaultRole?: 'teacher' | 'admin' | 'super_admin';
    onSuccess?: (msg: string) => void;
}

export function CreateUserDialog({ trigger, defaultRole = 'teacher', onSuccess }: CreateUserDialogProps) {
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState('');
    
    const createUser = useCreateUser();

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
        defaultValues: { role: defaultRole },
    });

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
            
            const msg = `User "${data.name}" created as ${roleLabel[data.role]}`;
            onSuccess?.(msg);
            setOpen(false);
            reset();
        } catch (err) {
            setApiError((err as Error).message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
                reset();
                setApiError('');
                setShowPassword(false);
            }
        }}>
            <DialogTrigger render={trigger ? (trigger as React.ReactElement) : (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <UserPlus className="w-4 h-4" /> Create User
                    </Button>
                )} />
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
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white gap-2" disabled={createUser.isPending}>
                            {createUser.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            <UserPlus className="w-4 h-4" /> Create User
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
