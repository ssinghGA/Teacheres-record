'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import StudentSidebar from '@/components/layout/StudentSidebar';
import Navbar from '@/components/layout/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role === 'student' && !pathname.startsWith('/homework')) {
                router.push('/student-dashboard');
            }
        }
    }, [isAuthenticated, isLoading, user, router, pathname]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center" style={{ background: 'var(--background)' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 animate-pulse" />
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || (user?.role === 'student' && !pathname.includes('homework'))) return null;

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
            {user?.role === 'student' ? (
                <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            ) : (
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            )}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
