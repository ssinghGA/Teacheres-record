/**
 * Central API client for Teacher Management backend.
 * Automatically injects Bearer token from localStorage.
 * Base URL: NEXT_PUBLIC_API_URL (http://localhost:5000/api)
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://be-teachers-record.onrender.com/api';

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
}

function buildHeaders(extra?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...extra,
    };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.message || `Request failed: ${res.status}`);
    }
    return data;
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    let url = `${BASE_URL}${path}`;
    if (params) {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
        });
        if (q.toString()) url += `?${q.toString()}`;
    }
    const res = await fetch(url, { headers: buildHeaders() });
    return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'PATCH',
        headers: buildHeaders(),
        body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'DELETE',
        headers: buildHeaders(),
    });
    return handleResponse<T>(res);
}
