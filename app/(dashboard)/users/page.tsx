'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeachers } from '@/lib/hooks/useTeachers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { CreateUserDialog } from '@/components/dashboard/CreateUserDialog';
import { Pagination } from '@/components/dashboard/Pagination';

const roleBadge: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    teacher: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};
const roleLabel: Record<string, string> = { super_admin: 'Super Admin', admin: 'Admin', teacher: 'Teacher' };

export default function UsersPage() {
    const { user } = useAuth();
    const [savedMsg, setSavedMsg] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: teachersData, isLoading, refetch } = useTeachers({ page, limit });

    if (user?.role !== 'super_admin') {
        return (
            <div className="text-center py-20 space-y-3">
                <AlertTriangle className="w-12 h-12 mx-auto text-orange-500" />
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Access Restricted</h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Only Super Admins can manage users.</p>
            </div>
        );
    }

    const allUsers = teachersData?.teachers ?? [];
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
                <CreateUserDialog 
                    onSuccess={(msg) => {
                        setSavedMsg(msg);
                        refetch();
                        setTimeout(() => setSavedMsg(''), 4000);
                    }}
                />
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
                {teachersData?.pagination && (
                    <Pagination 
                        currentPage={teachersData.pagination.page} 
                        totalPages={teachersData.pagination.totalPages} 
                        onPageChange={setPage} 
                    />
                )}
            </Card>
        </div>
    );
}
