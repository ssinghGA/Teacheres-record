import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch } from '../api';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiPayment {
    _id: string;
    teacherId: string | { _id: string; name: string; email: string };
    studentId: string | { _id: string; name: string; class: string };
    amount: number;
    paymentDate: string;
    status: 'paid' | 'pending' | 'overdue';
    createdAt: string;
}

interface PaymentsResponse {
    success: boolean;
    data: {
        payments: ApiPayment[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
    };
}

interface PaymentResponse {
    success: boolean;
    data: { payment: ApiPayment };
}

export const paymentKeys = {
    all: ['payments'] as const,
    list: (params?: Record<string, string | number | undefined>) => ['payments', 'list', params] as const,
    detail: (id: string) => ['payments', 'detail', id] as const,
};

export function usePayments(params?: Record<string, string | number | undefined>) {
    return useQuery({
        queryKey: paymentKeys.list(params),
        queryFn: () => apiGet<PaymentsResponse>('/payments', params),
        select: (data) => ({
            payments: data.data.payments,
            pagination: data.data.pagination,
        }),
    });
}

export function usePayment(id: string) {
    return useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: () => apiGet<PaymentResponse>(`/payments/${id}`),
        select: (data) => data.data.payment,
        enabled: !!id,
    });
}

export function useCreatePayment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: { studentId: string; amount: number; paymentDate: string; status: string }) =>
            apiPost<PaymentResponse>('/payments', body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: paymentKeys.all });
            toast.success('Payment recorded successfully');
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to record payment'),
    });
}

export function useUpdatePayment(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<ApiPayment>) => apiPatch<PaymentResponse>(`/payments/${id}`, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: paymentKeys.all });
            qc.invalidateQueries({ queryKey: paymentKeys.detail(id) });
            toast.success('Payment updated successfully');
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to update payment'),
    });
}
