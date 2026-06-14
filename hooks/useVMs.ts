'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { VM } from '@/types';

export function useVMs() {
  return useQuery({
    queryKey: ['vms'],
    queryFn: () => apiClient.get<{ vms: VM[] }>('/api/vms').then((r) => r.vms),
  });
}

export function useVM(id: string) {
  return useQuery({
    queryKey: ['vms', id],
    queryFn: () => apiClient.get<{ vm: VM }>(`/api/vms/${id}`).then((r) => r.vm),
  });
}

export function useVMMetrics(id: string, hours = 24) {
  return useQuery({
    queryKey: ['vms', id, 'metrics', hours],
    queryFn: () =>
      apiClient
        .get<{ metrics: { timestamp: string; cpuPercent: number; memoryPercent: number }[] }>(
          `/api/vms/${id}/metrics?hours=${hours}`
        )
        .then((r) => r.metrics),
  });
}

export function useVMAction(vmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: 'start' | 'stop' | 'restart') =>
      apiClient
        .post<{ vm: VM }>(`/api/vms/${vmId}/action`, { action })
        .then((r) => r.vm),
    onMutate: async (action) => {
      await qc.cancelQueries({ queryKey: ['vms'] });
      const previous = qc.getQueryData<VM[]>(['vms']);
      const transientStatus =
        action === 'start' ? 'starting' : action === 'stop' ? 'stopping' : 'starting';
      qc.setQueryData<VM[]>(['vms'], (old) =>
        old?.map((v) => (v.id === vmId ? { ...v, status: transientStatus } : v))
      );
      return { previous };
    },
    onError: (_e, _a, ctx) => {
      if (ctx?.previous) qc.setQueryData(['vms'], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['vms'] });
    },
  });
}
