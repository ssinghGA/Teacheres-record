'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StudentSidebar from '@/components/layout/StudentSidebar';
import Navbar from '@/components/layout/Navbar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'student') {
                // If a teacher/admin tries to hit a student route, boot them back to their dashboard
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center" style={{ background: 'var(--background)' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 animate-pulse" />
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading Portal...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'student') return null;

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
            <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
