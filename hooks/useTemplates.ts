'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { VMTemplate } from '@/types';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () =>
      apiClient
        .get<{ templates: VMTemplate[] }>('/api/templates')
        .then((r) => r.templates),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<VMTemplate, 'id'>) =>
      apiClient
        .post<{ template: VMTemplate }>('/api/templates', data)
        .then((r) => r.template),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
}

export function useUpdateTemplate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Omit<VMTemplate, 'id'>>) =>
      apiClient
        .patch<{ template: VMTemplate }>(`/api/templates/${id}`, data)
        .then((r) => r.template),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
}
