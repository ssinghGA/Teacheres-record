import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../api';

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
        onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.all }),
    });
}
