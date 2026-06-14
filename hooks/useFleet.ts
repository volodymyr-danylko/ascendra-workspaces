'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { FleetUtilization } from '@/types';

export function useFleet(hours = 24) {
  return useQuery({
    queryKey: ['fleet', hours],
    queryFn: () =>
      apiClient
        .get<{ fleet: FleetUtilization }>(`/api/fleet?hours=${hours}`)
        .then((r) => r.fleet),
  });
}
