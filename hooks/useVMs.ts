'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth';
import type { VM } from '@/types';

export function useVMs() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['vms', userId],
    queryFn: () => apiClient.get<{ vms: VM[] }>('/api/vms').then((r) => r.vms),
    enabled: !!userId,
  });
}

export function useVM(id: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['vms', userId, id],
    queryFn: () => apiClient.get<{ vm: VM }>(`/api/vms/${id}`).then((r) => r.vm),
    enabled: !!userId,
  });
}

export function useVMMetrics(id: string, hours = 24) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['vms', userId, id, 'metrics', hours],
    queryFn: () =>
      apiClient
        .get<{ metrics: { timestamp: string; cpuPercent: number; memoryPercent: number }[] }>(
          `/api/vms/${id}/metrics?hours=${hours}`
        )
        .then((r) => r.metrics),
    enabled: !!userId,
  });
}

export function useVMAction(vmId: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (action: 'start' | 'stop' | 'restart') =>
      apiClient
        .post<{ vm: VM }>(`/api/vms/${vmId}/action`, { action })
        .then((r) => r.vm),
    onMutate: async (action) => {
      await qc.cancelQueries({ queryKey: ['vms', userId] });
      const previous = qc.getQueryData<VM[]>(['vms', userId]);
      const transientStatus =
        action === 'start' ? 'starting' : action === 'stop' ? 'stopping' : 'starting';
      qc.setQueryData<VM[]>(['vms', userId], (old) =>
        old?.map((v) => (v.id === vmId ? { ...v, status: transientStatus } : v))
      );
      return { previous };
    },
    onError: (_e, _a, ctx) => {
      if (ctx?.previous) qc.setQueryData(['vms', userId], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['vms', userId] });
    },
  });
}
