import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { VMStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCost(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(usd);
}

export function formatUptime(startedAt: string | null): string {
  if (!startedAt) return '—';
  const diffMs = Date.now() - new Date(startedAt).getTime();
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function isIdle(lastActiveAt: string, thresholdHours = 2): boolean {
  return Date.now() - new Date(lastActiveAt).getTime() > thresholdHours * 60 * 60 * 1000;
}

export function getStatusColor(status: VMStatus): string {
  const map: Record<VMStatus, string> = {
    running: 'text-status-running',
    stopped: 'text-status-stopped',
    starting: 'text-status-starting',
    stopping: 'text-status-starting',
    error: 'text-status-error',
  };
  return map[status];
}

export function getStatusBgColor(status: VMStatus): string {
  const map: Record<VMStatus, string> = {
    running: 'bg-green-950 text-status-running border-green-800',
    stopped: 'bg-slate-800 text-status-stopped border-slate-700',
    starting: 'bg-amber-950 text-status-starting border-amber-800',
    stopping: 'bg-amber-950 text-status-starting border-amber-800',
    error: 'bg-red-950 text-status-error border-red-800',
  };
  return map[status];
}
