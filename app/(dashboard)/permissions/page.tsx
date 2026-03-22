'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeachers, useUpdateTeacher, type ApiTeacher } from '@/lib/hooks/useTeachers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/dashboard/Pagination';
import type { Role } from '@/types';

export default function PermissionsPage() {
    const { user: currentUser } = useAuth();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: teachersData, isLoading, isError } = useTeachers({ page, limit });

    if (currentUser?.role !== 'super_admin') {
        return (
            <div className="text-center py-20">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-orange-500" />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Access Restricted</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Only Super Admins can access this page.</p>
            </div>
        );
    }

    const users = (teachersData?.teachers ?? []).filter(u => u._id !== currentUser?.id);

    const roleLabel: Record<string, string> = { super_admin: 'Super Admin', admin: 'Admin', teacher: 'Teacher' };
    const roleBadge: Record<string, string> = {
        super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        teacher: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    };

    // Removed local state changeRole as it's now handled by mutation in UserRow

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Permissions Management</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Manage user roles and access levels</p>
            </div>

            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" /> User Roles
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                                    {['User', 'Email', 'Current Role', 'Change Role', 'Action'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                                            <p className="text-xs text-muted-foreground">Loading users...</p>
                                        </td>
                                    </tr>
                                ) : isError ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-red-500 text-xs">
                                            Failed to load users.
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-muted-foreground text-xs">
                                            No other users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u, i) => (
                                        <UserRow
                                            key={u._id}
                                            user={u}
                                            roleBadge={roleBadge}
                                            roleLabel={roleLabel}
                                            isLast={i === users.length - 1}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {teachersData?.pagination && (
                    <Pagination 
                        currentPage={teachersData.pagination.page} 
                        totalPages={teachersData.pagination.totalPages} 
                        onPageChange={setPage} 
                    />
                )}
            </Card>

            {/* Role descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { role: 'teacher', label: 'Teacher', desc: 'Can view own students, classes, progress reports and earnings.', badge: roleBadge['teacher'] },
                    { role: 'admin', label: 'Admin', desc: 'Can view all teachers and students. Manage classes and reports.', badge: roleBadge['admin'] },
                    { role: 'super_admin', label: 'Super Admin', desc: 'Full system access including user management and permissions.', badge: roleBadge['super_admin'] },
                ].map((r) => (
                    <Card key={r.role} className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <CardContent className="p-4">
                            <Badge className={`text-xs border-0 mb-2 ${r.badge}`}>{r.label}</Badge>
                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{r.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function UserRow({ user, roleBadge, roleLabel, isLast }: {
    user: ApiTeacher; roleBadge: any; roleLabel: any; isLast: boolean;
}) {
    const [selectedRole, setSelectedRole] = useState<ApiTeacher['role']>(user.role);
    const updateRole = useUpdateTeacher(user._id);

    const handleSave = () => {
        updateRole.mutate({ role: selectedRole });
    };

    return (
        <tr style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}
            className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold font-mono">
                        {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>{user.name}</span>
                </div>
            </td>
            <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{user.email}</td>
            <td className="px-4 py-3">
                <Badge className={`text-[10px] uppercase tracking-wider font-bold border-0 ${roleBadge[user.role]}`}>{roleLabel[user.role]}</Badge>
            </td>
            <td className="px-4 py-3 w-44">
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as ApiTeacher['role'])}>
                    <SelectTrigger className="h-8 text-xs bg-muted/30">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                </Select>
            </td>
            <td className="px-4 py-3">
                <Button
                    size="sm"
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    onClick={handleSave}
                    disabled={selectedRole === user.role || updateRole.isPending}
                >
                    {updateRole.isPending ? 'Updating...' : updateRole.isSuccess ? '✓ Saved' : 'Apply'}
                </Button>
            </td>
        </tr>
    );
}
