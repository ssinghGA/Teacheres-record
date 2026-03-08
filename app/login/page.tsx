'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof schema>;

const demoAccounts = [
    { role: 'Super Admin', email: 'superadmin@school.com', password: 'admin123', color: 'purple' },
    { role: 'Admin', email: 'admin@school.com', password: 'admin123', color: 'blue' },
    { role: 'Teacher', email: 'teacher@school.com', password: 'teacher123', color: 'green' },
];

export default function LoginPage() {
    const { login, isAuthenticated, user } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            router.push(user.role === 'student' ? '/student-dashboard' : '/dashboard');
        }
    }, [isAuthenticated, user, router]);

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        setError('');
        try {
            const success = await login(data.email, data.password);
            if (!success) {
                setError('Invalid email or password. Please try again.');
            }
            // `useEffect` will handle the successful redirect once context updates
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (email: string, password: string) => {
        setValue('email', email);
        setValue('password', password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #24282dff 0%, #24282dff 50%, #24282dff 100%)' }}>
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-200/10 blur-3xl" />
            </div>

            <div className="w-full max-w-md relative animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 mb-4">
                        <School className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TeacherPro</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Teacher Management Dashboard</p>
                </div>

                {/* Login card */}
                <Card className="shadow-2xl shadow-blue-500/10 border border-white/40 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl text-gray-900 dark:text-white">Welcome back</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">Sign in to your account to continue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@school.com"
                                    className="h-10"
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="h-10 pr-10"
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-500">{errors.password.message}</p>
                                )}
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Demo accounts */}
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 font-medium bg-transparent text-gray-500 dark:text-gray-400">Demo Accounts</span>
                                </div>
                            </div>
                            <div className="mt-4 grid gap-2">
                                {demoAccounts.map((acc) => (
                                    <button
                                        key={acc.role}
                                        type="button"
                                        onClick={() => fillDemo(acc.email, acc.password)}
                                        className="flex items-center justify-between w-full text-left px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all text-xs group"
                                    >
                                        <div>
                                            <span className={`font-semibold ${acc.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                                acc.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                                                }`}>{acc.role}</span>
                                            <p className="text-gray-500 dark:text-gray-400">{acc.email}</p>
                                        </div>
                                        <span className="text-gray-400 group-hover:text-blue-500 font-mono">→</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
