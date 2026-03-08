import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiStudent {
    _id: string;
    teacherId: string | { _id: string; name: string; email: string };
    name: string;
    class: string;
    school: string;
    parentName: string;
    parentPhone: string;
    email: string;
    subject: string;
    startDate: string;
    status: 'active' | 'inactive' | 'pending';
    notes?: string;
    createdAt: string;
}

interface StudentsResponse {
    success: boolean;
    data: {
        students: ApiStudent[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
    };
}

interface StudentResponse {
    success: boolean;
    data: { student: ApiStudent };
}

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const studentKeys = {
    all: ['students'] as const,
    list: (params?: Record<string, string | number | undefined>) => ['students', 'list', params] as const,
    detail: (id: string) => ['students', 'detail', id] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────
export function useStudents(params?: Record<string, string | number | undefined>) {
    return useQuery({
        queryKey: studentKeys.list(params),
        queryFn: () => apiGet<StudentsResponse>('/students', params),
        select: (data) => ({
            students: data.data.students,
            pagination: data.data.pagination,
        }),
    });
}

export function useStudent(id: string) {
    return useQuery({
        queryKey: studentKeys.detail(id),
        queryFn: () => apiGet<StudentResponse>(`/students/${id}`),
        select: (data) => data.data.student,
        enabled: !!id,
    });
}

export function useCreateStudent() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<ApiStudent>) => apiPost<StudentResponse>('/students', body),
        onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
    });
}

export function useUpdateStudent(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<ApiStudent>) => apiPatch<StudentResponse>(`/students/${id}`, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: studentKeys.all });
            qc.invalidateQueries({ queryKey: studentKeys.detail(id) });
        },
    });
}

export function useDeleteStudent() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete<{ success: boolean }>(`/students/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
    });
}
