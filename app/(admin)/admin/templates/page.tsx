'use client';
import { useState } from 'react';
import { Plus, Cpu, HardDrive, MemoryStick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TemplateForm } from '@/components/admin/TemplateForm';
import { useTemplates, useCreateTemplate, useUpdateTemplate } from '@/hooks/useTemplates';
import { Skeleton } from '@/components/ui/skeleton';
import type { VMTemplate } from '@/types';

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const [editTarget, setEditTarget] = useState<VMTemplate | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const updateTemplate = useUpdateTemplate(editTarget?.id ?? '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">VM Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Machine specifications available to engineers</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-dev-accent hover:bg-dev-accent/90 gap-1.5">
          <Plus size={14} /> New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates?.map((t) => (
            <div key={t.id} className="rounded-xl border border-border-subtle bg-surface p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground"><Cpu size={10} /> {t.vCpu} vCPU</div>
                <div className="flex items-center gap-1 text-muted-foreground"><MemoryStick size={10} /> {t.memoryGb} GB</div>
                <div className="flex items-center gap-1 text-muted-foreground"><HardDrive size={10} /> {t.diskSizeGb} GB</div>
              </div>
              <div className="flex flex-wrap gap-1">
                {t.preinstalledTools.map((tool) => (
                  <span key={tool} className="rounded border border-border-subtle px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {tool}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">{t.baseImage}</p>
              <button
                onClick={() => setEditTarget(t)}
                className="text-xs text-admin-accent hover:underline"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-surface border-border-subtle sm:max-w-lg">
          <DialogHeader><DialogTitle>New Template</DialogTitle></DialogHeader>
          <TemplateForm
            onSubmit={async (data) => {
              await createTemplate.mutateAsync(data);
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
            isPending={createTemplate.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="bg-surface border-border-subtle sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Template</DialogTitle></DialogHeader>
          {editTarget && (
            <TemplateForm
              initial={editTarget}
              onSubmit={async (data) => {
                await updateTemplate.mutateAsync(data);
                setEditTarget(null);
              }}
              onCancel={() => setEditTarget(null)}
              isPending={updateTemplate.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
