'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
    DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { Menu, Sun, Moon, Bell, Search, LogOut, Settings, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const router = useRouter();

    const getInitials = (name: string) =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <header
            className="sticky top-0 z-10 flex h-16 items-center gap-3 px-4 md:px-6 border-b"
            style={{
                background: 'var(--background)',
                borderColor: 'var(--border)',
            }}
        >
            {/* Hamburger (mobile) */}
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden flex-shrink-0"
                onClick={onMenuClick}
            >
                <Menu className="w-5 h-5" />
            </Button>

            {/* Search bar */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    <Input
                        placeholder="Search students, classes..."
                        className="pl-9 h-9 rounded-xl text-sm"
                        style={{
                            background: 'var(--muted)',
                            border: '1px solid var(--border)',
                        }}
                    />
                </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
                {/* Theme toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" size={18} />
                    <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" size={18} />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="rounded-xl relative">
                    <Bell className="w-4 h-4" size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-background" />
                </Button>

                {/* Profile dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none transition-transform hover:scale-105">
                        <Avatar className="h-9 w-9 ring-2 ring-blue-200 dark:ring-blue-800 focus:ring-blue-500">
                            <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                                {user ? getInitials(user.name) : 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-semibold">{user?.name}</p>
                                    <p className="text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onClick={logout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
