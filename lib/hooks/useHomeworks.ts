import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '../api';
import { toast } from 'sonner';
import type { Homework } from '@/types';

export const homeworkKeys = {
    all: ['homeworks'] as const,
    list: (params?: Record<string, string | undefined>) => ['homeworks', 'list', params] as const,
    detail: (id: string) => ['homeworks', 'detail', id] as const,
};

interface HomeworkResponse {
    success: boolean;
    data: {
        homeworks: Homework[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
    };
}

interface SingleHomeworkResponse {
    success: boolean;
    data: { homework: Homework };
}

export function useHomeworks(params?: Record<string, string | undefined>) {
    return useQuery({
        queryKey: homeworkKeys.list(params),
        queryFn: () => apiGet<HomeworkResponse>('/homework', params),
        select: (data) => ({
            homeworks: data.data.homeworks,
            pagination: data.data.pagination,
        }),
    });
}

export function useCreateHomework() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: any) => apiPost<SingleHomeworkResponse>('/homework', body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: homeworkKeys.all });
            toast.success('Homework assigned successfully');
        },
        onError: (err: any) => {
            console.error('Create Homework Error:', err);
            toast.error(err.message || 'Failed to assign homework to DB');
        },
    });
}

export function useUpdateHomework() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...body }: { id: string, [key: string]: any }) => 
            apiPatch<{ success: boolean }>(`/homework/${id}`, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: homeworkKeys.all });
            toast.success('Homework updated successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to update homework'),
    });
}

export function useDeleteHomework() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete<{ success: boolean }>(`/homework/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: homeworkKeys.all });
            toast.success('Homework deleted from DB');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to delete homework'),
    });
}
