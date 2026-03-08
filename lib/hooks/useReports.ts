import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '../api';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiReport {
    _id: string;
    teacherId: string | { _id: string; name: string };
    studentId: string | { _id: string; name: string };
    subject: string;
    date: string;
    topicCovered: string;
    homeworkGiven: string;
    understandingLevel: number; // 1–5
    remarks: string;
    createdAt: string;
}

interface ReportsResponse {
    success: boolean;
    data: {
        reports: ApiReport[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
    };
}

interface ReportResponse {
    success: boolean;
    data: { report: ApiReport };
}

export const reportKeys = {
    all: ['reports'] as const,
    list: (params?: Record<string, string | number | undefined>) => ['reports', 'list', params] as const,
    detail: (id: string) => ['reports', 'detail', id] as const,
};

export function useReports(params?: Record<string, string | number | undefined>) {
    return useQuery({
        queryKey: reportKeys.list(params),
        queryFn: () => apiGet<ReportsResponse>('/reports', params),
        select: (data) => ({
            reports: data.data.reports,
            pagination: data.data.pagination,
        }),
    });
}

export function useReport(id: string) {
    return useQuery({
        queryKey: reportKeys.detail(id),
        queryFn: () => apiGet<ReportResponse>(`/reports/${id}`),
        select: (data) => data.data.report,
        enabled: !!id,
    });
}

export function useCreateReport() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<ApiReport>) => apiPost<ReportResponse>('/reports', body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: reportKeys.all });
            toast.success('Progress report created');
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to create report'),
    });
}

export function useUpdateReport(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<ApiReport>) => apiPatch<ReportResponse>(`/reports/${id}`, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: reportKeys.all });
            qc.invalidateQueries({ queryKey: reportKeys.detail(id) });
            toast.success('Progress report updated');
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to update report'),
    });
}

export function useDeleteReport() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete<{ success: boolean }>(`/reports/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: reportKeys.all });
            toast.success('Report deleted');
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to delete report'),
    });
}
