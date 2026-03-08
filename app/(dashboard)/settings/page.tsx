'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun, desc: 'White background with blue accents' },
        { value: 'dark', label: 'Dark', icon: Moon, desc: 'Gray-800 background with blue accents' },
        { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your OS preference' },
    ];

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
                        { label: 'Email notifications', desc: 'Get emails for class reminders and payments' },
                        { label: 'Push notifications', desc: 'Browser notifications for upcoming classes' },
                        { label: 'Weekly summary', desc: 'Weekly email digest of your activity' },
                    ].map((n) => (
                        <div key={n.label} className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{n.label}</p>
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{n.desc}</p>
                            </div>
                            <button
                                className="relative w-11 h-6 rounded-full bg-blue-600 transition-colors"
                            >
                                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </button>
                        </div>
                    ))}
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
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Change Password</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Update your account password</p>
                        </div>
                        <Button variant="outline" size="sm">Change</Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Two-Factor Authentication</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" size="sm">Enable</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
