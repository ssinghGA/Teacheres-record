'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor, Bell, Shield, Palette, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { apiPatch } from '@/lib/api';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        weekly: true,
    });

    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [is2FAOpen, setIs2FAOpen] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuth();

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun, desc: 'White background with blue accents' },
        { value: 'dark', label: 'Dark', icon: Moon, desc: 'Gray-800 background with blue accents' },
        { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your OS preference' },
    ];

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);
        try {
            await apiPatch(`/teachers/${user?.id}/change-password`, {
                currentPassword,
                newPassword,
            });
            toast.success('Password updated successfully');
            setIsPasswordOpen(false);
            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSave2FA = () => {
        setIs2FAEnabled(true);
        setIs2FAOpen(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Settings</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Customize your experience</p>
            </div>

            {/* Theme */}
            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Palette className="w-4 h-4 text-blue-600" /> Appearance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                        {themeOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isActive = theme === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setTheme(opt.value)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${isActive
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'hover:border-blue-300'
                                        }`}
                                    style={{ borderColor: isActive ? undefined : 'var(--border)' }}
                                >
                                    <Icon className={`w-5 h-5 mb-2 ${isActive ? 'text-blue-600' : ''}`} style={{ color: isActive ? undefined : 'var(--muted-foreground)' }} />
                                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{opt.label}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{opt.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600" /> Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[
                        { key: 'email', label: 'Email notifications', desc: 'Get emails for class reminders and payments' },
                        { key: 'push', label: 'Push notifications', desc: 'Browser notifications for upcoming classes' },
                        { key: 'weekly', label: 'Weekly summary', desc: 'Weekly email digest of your activity' },
                    ].map((n) => {
                        const isEnabled = notifications[n.key as keyof typeof notifications];
                        return (
                            <div key={n.key} className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{n.label}</p>
                                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{n.desc}</p>
                                </div>
                                <button
                                    onClick={() => toggleNotification(n.key as keyof typeof notifications)}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                >
                                    <span className={`absolute flex items-center justify-center top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isEnabled ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Security */}
            <Card className="shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" /> Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Change Password Dialog */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Change Password</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Update your account password</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsPasswordOpen(true)}>Change</Button>
                        <Dialog open={isPasswordOpen} onOpenChange={(open) => {
                            setIsPasswordOpen(open);
                            if (!open) {
                                setCurrentPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                            }
                        }}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Change Password</DialogTitle>
                                    <DialogDescription>
                                        Enter your current password to verify your identity, then your new password.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSavePassword}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="current">Current Password</Label>
                                            <Input 
                                                id="current" 
                                                type="password" 
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required 
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="new">New Password</Label>
                                            <Input 
                                                id="new" 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required 
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="confirm">Confirm New Password</Label>
                                            <Input 
                                                id="confirm" 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsPasswordOpen(false)} disabled={isSubmitting}>Cancel</Button>
                                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                                            {isSubmitting ? 'Saving...' : 'Save Password'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* 2FA Dialog */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Two-Factor Authentication</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Add an extra layer of security</p>
                        </div>
                        {is2FAEnabled ? (
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-medium text-sm border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-md">
                                <CheckCircle2 className="w-4 h-4" /> Enabled
                            </div>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setIs2FAOpen(true)}>Enable</Button>
                                <Dialog open={is2FAOpen} onOpenChange={setIs2FAOpen}>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Enable 2FA</DialogTitle>
                                        <DialogDescription>
                                            Connect an authenticator app to enable Two-Factor Authentication.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                                        <div className="w-40 h-40 bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-xl flex items-center justify-center">
                                            <p className="text-xs text-muted-foreground font-medium text-center px-4">QR Code Placeholder</p>
                                        </div>
                                        <p className="text-sm text-center text-muted-foreground">Scan this code with Google Authenticator or Authy to complete setup.</p>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIs2FAOpen(false)}>Cancel</Button>
                                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave2FA}>Simulate Success</Button>
                                    </DialogFooter>
                                </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
