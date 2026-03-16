'use client';

import { useState } from 'react';
import { useCreateUser, useUpdateTeacher, type ApiTeacher } from '@/lib/hooks/useTeachers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Eye, EyeOff, Loader2, Users, Shield, GraduationCap, Phone, MapPin, BookOpen, Pencil } from 'lucide-react';

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
    trigger?: React.ReactElement;
    defaultRole?: 'teacher' | 'admin' | 'super_admin';
    onSuccess?: (msg: string) => void;
    initialData?: ApiTeacher;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateUserDialog({ trigger, defaultRole = 'teacher', onSuccess, initialData, open: controlledOpen, onOpenChange: setControlledOpen }: CreateUserDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen ?? internalOpen;
    const setOpen = setControlledOpen ?? setInternalOpen;

    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState('');

    const createUser = useCreateUser();
    const updateTeacher = useUpdateTeacher(initialData?._id ?? '');

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: initialData?.name ?? '',
            email: initialData?.email ?? '',
            role: initialData?.role ?? defaultRole,
            phone: initialData?.phone ?? '',
            city: initialData?.city ?? '',
            subjects: initialData?.subjects?.join(', ') ?? '',
            qualification: initialData?.qualification ?? '',
            experience: initialData?.experience?.toString() ?? '',
            password: '',
        },
    });

    const onSubmit = async (data: UserForm) => {
        setApiError('');
        try {
            const payload = {
                name: data.name,
                email: data.email,
                password: data.password || undefined,
                role: data.role,
                phone: data.phone,
                city: data.city,
                subjects: data.subjects ? data.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
                qualification: data.qualification,
                experience: data.experience ? parseInt(data.experience) : undefined,
            };

            if (initialData) {
                await updateTeacher.mutateAsync(payload);
            } else {
                await createUser.mutateAsync(payload as any);
            }

            const msg = initialData
                ? `Teacher "${data.name}" updated successfully`
                : `User "${data.name}" created as ${roleLabel[data.role]}`;

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
            {trigger && (
                <DialogTrigger render={trigger} />
            )}
            {!trigger && !controlledOpen && (
                <DialogTrigger>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <UserPlus className="w-4 h-4" /> Create User
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4 mb-2">
                    <DialogTitle className="flex items-center gap-3 text-lg font-bold">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            {initialData ? <Pencil className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
                        </div>
                        {initialData ? 'Update Teacher' : 'Create New User'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4 pb-4">
                    <div className="space-y-8">
                        {/* Section: Account Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Shield className="w-4 h-4" /> Account Details
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-medium">Full Name *</Label>
                                    <Input placeholder="e.g. Priya Sharma" {...register('name')} />
                                    {errors.name && <p className="text-[11px] font-medium text-destructive mt-1">{errors.name.message}</p>}
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-medium">Email Address *</Label>
                                    <Input type="email" placeholder="user@school.com" {...register('email')} />
                                    {errors.email && <p className="text-[11px] font-medium text-destructive mt-1">{errors.email.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Password {initialData ? '(optional)' : '*'}</Label>
                                    <div className="relative">
                                        <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pr-10" {...register('password', { required: !initialData })} />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-[11px] font-medium text-destructive mt-1">{errors.password.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Role *</Label>
                                    <Controller name="role" control={control} render={({ field }) => (
                                        <Select value={field.value} onValueChange={v => field.onChange(v ?? 'teacher')}>
                                            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="teacher">Teacher</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                                    {errors.role && <p className="text-[11px] font-medium text-destructive mt-1">{errors.role.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Personal Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Users className="w-4 h-4" /> Personal Identity
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone</Label>
                                    <Input placeholder="+91..." {...register('phone')} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium flex items-center gap-1.5"><MapPin className="w-3 h-3" /> City</Label>
                                    <Input placeholder="Mumbai" {...register('city')} />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-medium flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Subjects (comma separated)</Label>
                                    <Input placeholder="e.g. Maths, Science" {...register('subjects')} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium flex items-center gap-1.5"><GraduationCap className="w-3 h-3" /> Qualification</Label>
                                    <Input placeholder="M.Sc." {...register('qualification')} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Experience (yrs)</Label>
                                    <Input type="number" placeholder="5" {...register('experience')} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {apiError && <p className="text-xs font-semibold text-destructive bg-destructive/10 p-3 border border-destructive/20 rounded-lg">{apiError}</p>}

                    <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                        <p className="text-xs font-bold flex items-center gap-2">
                            Access Permissions Overview
                        </p>
                        <div className="grid gap-3 text-[11px] leading-relaxed text-muted-foreground">
                            <div className="flex gap-2"><span className="font-bold text-primary w-24 shrink-0">Teacher:</span><span>Dedicated dashboard for managing own students, classes, and earnings.</span></div>
                            <div className="flex gap-2"><span className="font-bold text-primary w-24 shrink-0">Admin:</span><span>Broad visibility across all teachers, classes, and school reports.</span></div>
                            <div className="flex gap-2"><span className="font-bold text-primary w-24 shrink-0">Super Admin:</span><span>Unlimited access to user management and system configuration.</span></div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                        <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="px-8 font-bold" disabled={createUser.isPending || updateTeacher.isPending}>
                            {(createUser.isPending || updateTeacher.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {initialData ? 'Update Account' : 'Create Account Now'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
