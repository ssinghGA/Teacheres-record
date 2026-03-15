'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthContextType, Role } from '@/types';

export interface AuthUser {
    id: string;    // frontend-friendly alias for _id
    _id: string;
    name: string;
    email: string;
    role: Role;
    phone?: string;
    city?: string;
    subjects?: string[];
    profilePhoto?: string;
    googleMeetLink?: string;
}

interface AuthCtx {
    user: AuthUser | null;
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://be-teachers-record.onrender.com/api';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Rehydrate from localStorage on mount
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('authUser');
            if (storedToken && storedUser) {
                const parsed = JSON.parse(storedUser);
                setToken(storedToken);
                setUser({ ...parsed, id: parsed._id ?? parsed.id });
            }
        } catch {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) return false;

            const apiUser = data.data.user;
            const authUser: AuthUser = {
                _id: apiUser._id,
                id: apiUser._id,
                name: apiUser.name,
                email: apiUser.email,
                role: apiUser.role as Role,
                phone: apiUser.phone,
                city: apiUser.city,
                subjects: apiUser.subjects,
                profilePhoto: apiUser.profilePhoto,
                googleMeetLink: apiUser.googleMeetLink,
            };

            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('authUser', JSON.stringify(authUser));
            setToken(data.data.token);
            setUser(authUser);
            return true;
        } catch (err) {
            console.error('Login error:', err);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!user,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
