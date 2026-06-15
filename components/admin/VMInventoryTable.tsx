'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { VMStatusBadge } from '@/components/developer/VMStatusBadge';
import { ResourceBar } from '@/components/developer/ResourceBar';
import { isIdle, cn } from '@/lib/utils';
import type { VM, User, VMTemplate } from '@/types';

interface Props {
  vms: VM[];
  users: User[];
  templates: VMTemplate[];
}

const STATUS_OPTIONS = ['all', 'running', 'stopped', 'starting', 'stopping', 'error'] as const;

export function VMInventoryTable({ vms, users, templates }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
  const templateMap = useMemo(() => Object.fromEntries(templates.map((t) => [t.id, t])), [templates]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vms.filter((vm) => {
      const owner = userMap[vm.ownerId];
      const matchesSearch =
        !q ||
        vm.name.toLowerCase().includes(q) ||
        owner?.name.toLowerCase().includes(q) ||
        owner?.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || vm.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vms, search, statusFilter, userMap]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search VMs or owners…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-surface border-border-subtle h-8 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs transition-colors',
                statusFilter === s
                  ? 'bg-admin-accent/20 text-admin-accent border border-admin-accent/30'
                  : 'border border-border-subtle text-muted-foreground hover:text-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="self-center text-xs text-muted-foreground">{filtered.length} VMs</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface/50">
              {['Name', 'Owner', 'Template', 'Status', 'CPU', 'Memory', 'Disk'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.map((vm) => {
              const idle = isIdle(vm.lastActiveAt);
              return (
                <tr key={vm.id} className={cn('bg-surface hover:bg-surface-raised transition-colors', idle && vm.status === 'running' && 'bg-amber-950/20')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {idle && vm.status === 'running' && (
                        <span title="Idle > 2h"><AlertTriangle size={12} className="text-status-starting flex-shrink-0" /></span>
                      )}
                      <Link href={`/developer/machines/${vm.id}`} className="font-medium text-foreground hover:text-admin-accent transition-colors">
                        {vm.name}
                      </Link>
                    </div>
                    <p className="text-xs text-muted-foreground">{vm.region}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{userMap[vm.ownerId]?.name ?? vm.ownerId}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{templateMap[vm.templateId]?.name ?? vm.templateId}</td>
                  <td className="px-4 py-3"><VMStatusBadge status={vm.status} /></td>
                  <td className="px-4 py-3 w-24"><ResourceBar value={vm.cpuUsagePercent} label="" /></td>
                  <td className="px-4 py-3 w-24"><ResourceBar value={vm.memoryUsagePercent} label="" /></td>
                  <td className="px-4 py-3 w-24"><ResourceBar value={vm.diskUsagePercent} label="" /></td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No VMs match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
