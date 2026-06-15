'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { VMTemplate } from '@/types';

interface Props {
  initial?: Partial<VMTemplate>;
  onSubmit: (data: Omit<VMTemplate, 'id'>) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function TemplateForm({ initial, onSubmit, onCancel, isPending }: Props) {
  const [form, setForm] = useState<Omit<VMTemplate, 'id'>>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    baseImage: initial?.baseImage ?? 'ubuntu-22.04',
    vCpu: initial?.vCpu ?? 4,
    memoryGb: initial?.memoryGb ?? 16,
    diskSizeGb: initial?.diskSizeGb ?? 100,
    preinstalledTools: initial?.preinstalledTools ?? [],
  });

  const field = (key: keyof typeof form) => ({
    id: key,
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setForm((prev) => ({
        ...prev,
        [key]: typeof prev[key] === 'number' ? Number(raw) : raw,
      }));
    },
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input {...field('name')} placeholder="Standard Dev Box" required className="bg-surface border-border-subtle" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="baseImage">Base Image</Label>
          <Input {...field('baseImage')} placeholder="ubuntu-22.04" required className="bg-surface border-border-subtle" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vCpu">vCPU cores</Label>
          <Input {...field('vCpu')} type="number" min={1} max={128} required className="bg-surface border-border-subtle" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="memoryGb">Memory (GB)</Label>
          <Input {...field('memoryGb')} type="number" min={1} max={512} required className="bg-surface border-border-subtle" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="diskSizeGb">Disk (GB)</Label>
          <Input {...field('diskSizeGb')} type="number" min={10} max={2000} required className="bg-surface border-border-subtle" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input {...field('description')} placeholder="Short description" className="bg-surface border-border-subtle" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border-subtle">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="bg-dev-accent hover:bg-dev-accent/90">
          {isPending ? 'Saving…' : initial?.id ? 'Save changes' : 'Create template'}
        </Button>
      </div>
    </form>
  );
}
