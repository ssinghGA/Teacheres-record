'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacher, useUpdateTeacher } from '@/lib/hooks/useTeachers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Save, CheckCircle, Camera, Loader2, Video } from 'lucide-react';

const profileSchema = z.object({
    name: z.string().min(2, 'Name required'),
    email: z.string().email('Valid email required'),
    phone: z.string().optional(),
    city: z.string().optional(),
    subjects: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.string().optional(),
    bio: z.string().optional(),
    googleMeetLink: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);

    const { data: teacher, isLoading } = useTeacher(user?._id ?? user?.id ?? '');
    const updateTeacher = useUpdateTeacher(user?._id ?? user?.id ?? '');

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        values: {
            name: teacher?.name ?? user?.name ?? '',
            email: teacher?.email ?? user?.email ?? '',
            phone: teacher?.phone ?? '',
            city: teacher?.city ?? '',
            subjects: teacher?.subjects?.join(', ') ?? '',
            qualification: teacher?.qualification ?? '',
            experience: teacher?.experience !== undefined ? String(teacher.experience) : '',
            bio: teacher?.bio ?? '',
            googleMeetLink: teacher?.googleMeetLink ?? '',
        },
    });

    const onSubmit = async (data: ProfileForm) => {
        await updateTeacher.mutateAsync({
            name: data.name,
            email: data.email,
            phone: data.phone,
            city: data.city,
            subjects: data.subjects ? data.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
            qualification: data.qualification,
            experience: data.experience ? parseInt(data.experience) : undefined,
            bio: data.bio,
            googleMeetLink: data.googleMeetLink,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const roleLabel: Record<string, string> = { super_admin: 'Super Admin', admin: 'Admin', teacher: 'Teacher' };
    const roleBadgeColor: Record<string, string> = {
        super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        teacher: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    };

    const displayName = teacher?.name ?? user?.name ?? '';
    const displaySubjects = teacher?.subjects ?? user?.subjects ?? [];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>My Profile</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Manage your personal information</p>
            </div>

            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/25">
                                {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{displayName}</h2>
                            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{teacher?.email ?? user?.email}</p>
                            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                                <Badge className={`text-xs border-0 ${user?.role ? roleBadgeColor[user.role] : ''}`}>
                                    {user?.role ? roleLabel[user.role] : ''}
                                </Badge>
                                {teacher?.city && <Badge variant="outline" className="text-xs">{teacher.city}</Badge>}
                                {displaySubjects.map(s => (
                                    <Badge key={s} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0">{s}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" /> Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1"><Label>Full Name *</Label>
                                    <Input {...register('name')} />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-1"><Label>Email Address *</Label>
                                    <Input type="email" {...register('email')} />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                                </div>
                                <div className="space-y-1"><Label>Phone Number</Label>
                                    <Input placeholder="+91 98765 43210" {...register('phone')} />
                                </div>
                                <div className="space-y-1"><Label>City</Label>
                                    <Input placeholder="e.g. Mumbai" {...register('city')} />
                                </div>
                                <div className="space-y-1"><Label>Subjects (comma separated)</Label>
                                    <Input placeholder="Mathematics, Physics" {...register('subjects')} />
                                </div>
                                <div className="space-y-1"><Label>Qualification</Label>
                                    <Input placeholder="e.g. M.Sc. Mathematics" {...register('qualification')} />
                                </div>
                                <div className="sm:col-span-2 space-y-1"><Label>Experience (years)</Label>
                                    <Input type="number" placeholder="e.g. 5" {...register('experience')} />
                                </div>
                                <div className="sm:col-span-2 space-y-1"><Label>Bio</Label>
                                    <Textarea placeholder="Write a short bio about yourself..." rows={4} {...register('bio')} />
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                    <Label>Google Meet Link</Label>
                                    <Input placeholder="https://meet.google.com/abc-defg-hij" {...register('googleMeetLink')} />
                                    {errors.googleMeetLink && <p className="text-xs text-red-500">{errors.googleMeetLink.message}</p>}
                                    <p className="text-[10px] text-muted-foreground mt-1">This link will be visible to your students on their dashboard.</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                {saved && (
                                    <div className="flex items-center gap-2 text-emerald-600 text-sm">
                                        <CheckCircle className="w-4 h-4" /> Profile saved!
                                    </div>
                                )}
                                <div className={`flex items-center gap-3 ${!saved ? 'ml-auto' : ''}`}>
                                    {teacher?.googleMeetLink && (
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 gap-2"
                                            onClick={() => window.open(teacher.googleMeetLink?.startsWith('http') ? teacher.googleMeetLink : `https://${teacher.googleMeetLink}`, '_blank')}
                                        >
                                            <Video className="w-4 h-4" /> Start Your Class
                                        </Button>
                                    )}
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white gap-2" disabled={updateTeacher.isPending}>
                                        {updateTeacher.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                        <Save className="w-4 h-4" /> Save Changes
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
