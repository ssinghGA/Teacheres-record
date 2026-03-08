'use client';

import { useState } from 'react';
import { MOCK_USERS } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle } from 'lucide-react';
import type { Role } from '@/types';

export default function PermissionsPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState(MOCK_USERS.filter(u => u.id !== user?.id));

    if (user?.role !== 'super_admin') {
        return (
            <div className="text-center py-20">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-orange-500" />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Access Restricted</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Only Super Admins can access this page.</p>
            </div>
        );
    }

    const roleLabel: Record<string, string> = { super_admin: 'Super Admin', admin: 'Admin', teacher: 'Teacher' };
    const roleBadge: Record<string, string> = {
        super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        teacher: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    };

    const changeRole = (userId: string, newRole: Role) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

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
                                {users.map((u, i) => (
                                    <UserRow
                                        key={u.id}
                                        user={u}
                                        roleBadge={roleBadge}
                                        roleLabel={roleLabel}
                                        onChangeRole={changeRole}
                                        isLast={i === users.length - 1}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
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

function UserRow({ user, roleBadge, roleLabel, onChangeRole, isLast }: {
    user: any; roleBadge: any; roleLabel: any; onChangeRole: (id: string, role: Role) => void; isLast: boolean;
}) {
    const [selectedRole, setSelectedRole] = useState<Role>(user.role);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        onChangeRole(user.id, selectedRole);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <tr style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}
            className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold">
                        {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>{user.name}</span>
                </div>
            </td>
            <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{user.email}</td>
            <td className="px-4 py-3">
                <Badge className={`text-xs border-0 ${roleBadge[user.role]}`}>{roleLabel[user.role]}</Badge>
            </td>
            <td className="px-4 py-3 w-44">
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as Role)}>
                    <SelectTrigger className="h-8 text-xs">
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
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleSave}
                    disabled={selectedRole === user.role}
                >
                    {saved ? '✓ Saved' : 'Apply'}
                </Button>
            </td>
        </tr>
    );
}
