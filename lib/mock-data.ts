import type { VM, VMTemplate, User, VMStatus } from '@/types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Chen', email: 'alice@ascendra.dev', role: 'engineer', vmCount: 2 },
  { id: 'u2', name: 'Bob Martinez', email: 'bob@ascendra.dev', role: 'admin', vmCount: 0 },
  { id: 'u3', name: 'Charlie Park', email: 'charlie@ascendra.dev', role: 'engineer', vmCount: 4 },
];

const now = Date.now();
const h = (n: number) => new Date(now - n * 3_600_000).toISOString();

const BASE_VMS: VM[] = [
  { id: 'vm1', name: 'dev-machine-01', ownerId: 'u1', templateId: 't2', status: 'running', region: 'us-east-1', createdAt: h(48), startedAt: h(1), lastActiveAt: h(0), cpuUsagePercent: 42, memoryUsagePercent: 67, diskUsagePercent: 31, hourlyCost: 0.48 },
  { id: 'vm2', name: 'dev-machine-02', ownerId: 'u1', templateId: 't1', status: 'stopped', region: 'us-east-1', createdAt: h(48), startedAt: null, lastActiveAt: h(5), cpuUsagePercent: 0, memoryUsagePercent: 0, diskUsagePercent: 12, hourlyCost: 0.12 },
  { id: 'vm3', name: 'charlie-dev-01', ownerId: 'u3', templateId: 't2', status: 'running', region: 'us-west-2', createdAt: h(48), startedAt: h(2), lastActiveAt: h(0), cpuUsagePercent: 78, memoryUsagePercent: 82, diskUsagePercent: 45, hourlyCost: 0.48 },
  { id: 'vm4', name: 'charlie-dev-02', ownerId: 'u3', templateId: 't3', status: 'running', region: 'us-west-2', createdAt: h(48), startedAt: h(3), lastActiveAt: h(3), cpuUsagePercent: 3, memoryUsagePercent: 18, diskUsagePercent: 72, hourlyCost: 1.92 },
  { id: 'vm5', name: 'charlie-dev-03', ownerId: 'u3', templateId: 't1', status: 'stopped', region: 'eu-central-1', createdAt: h(48), startedAt: null, lastActiveAt: h(6), cpuUsagePercent: 0, memoryUsagePercent: 0, diskUsagePercent: 8, hourlyCost: 0.12 },
  { id: 'vm6', name: 'charlie-dev-04', ownerId: 'u3', templateId: 't2', status: 'running', region: 'eu-central-1', createdAt: h(48), startedAt: h(1), lastActiveAt: h(0), cpuUsagePercent: 55, memoryUsagePercent: 49, diskUsagePercent: 38, hourlyCost: 0.48 },
];

const BASE_TEMPLATES: VMTemplate[] = [
  { id: 't1', name: 'Small Dev Box', description: 'Lightweight box for frontend work', baseImage: 'ubuntu-22.04', vCpu: 2, memoryGb: 4, diskSizeGb: 50, preinstalledTools: ['vscode-server', 'node', 'git'] },
  { id: 't2', name: 'Standard Dev Box', description: 'Balanced box for full-stack development', baseImage: 'ubuntu-22.04', vCpu: 4, memoryGb: 16, diskSizeGb: 100, preinstalledTools: ['vscode-server', 'docker', 'node', 'git', 'python3'] },
  { id: 't3', name: 'Power Dev Box', description: 'High-performance box for ML/data work', baseImage: 'ubuntu-22.04', vCpu: 16, memoryGb: 64, diskSizeGb: 500, preinstalledTools: ['vscode-server', 'docker', 'cuda', 'python3', 'jupyter'] },
];

// Module-level mutable state — persists across requests in Next.js dev server
let vms: VM[] = [...BASE_VMS];
let templates: VMTemplate[] = [...BASE_TEMPLATES];

export const db = {
  getUserByEmail: (email: string) => MOCK_USERS.find((u) => u.email === email),
  getUser: (id: string) => MOCK_USERS.find((u) => u.id === id),

  getAllVMs: () => vms,
  getVMsByOwner: (ownerId: string) => vms.filter((v) => v.ownerId === ownerId),
  getVM: (id: string) => vms.find((v) => v.id === id),

  applyVMAction(id: string, action: 'start' | 'stop' | 'restart'): VM | undefined {
    const vm = vms.find((v) => v.id === id);
    if (!vm) return undefined;
    if (action === 'start') {
      vm.status = 'running';
      vm.startedAt = new Date().toISOString();
      vm.lastActiveAt = new Date().toISOString();
      vm.cpuUsagePercent = Math.floor(Math.random() * 40) + 20;
      vm.memoryUsagePercent = Math.floor(Math.random() * 30) + 30;
    } else if (action === 'stop') {
      vm.status = 'stopped';
      vm.startedAt = null;
      vm.cpuUsagePercent = 0;
      vm.memoryUsagePercent = 0;
    } else if (action === 'restart') {
      vm.status = 'running';
      vm.startedAt = new Date().toISOString();
      vm.lastActiveAt = new Date().toISOString();
    }
    return vm;
  },

  getTemplates: () => templates,
  getTemplate: (id: string) => templates.find((t) => t.id === id),

  createTemplate(data: Omit<VMTemplate, 'id'>): VMTemplate {
    const t: VMTemplate = { id: `t${Date.now()}`, ...data };
    templates = [...templates, t];
    return t;
  },

  updateTemplate(id: string, data: Partial<Omit<VMTemplate, 'id'>>): VMTemplate | undefined {
    const idx = templates.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    templates[idx] = { ...templates[idx], ...data };
    return templates[idx];
  },
};

export function generateVMMetrics(vmId: string, hours = 24) {
  const vm = db.getVM(vmId);
  const baseCpu = vm?.cpuUsagePercent ?? 40;
  const baseMem = vm?.memoryUsagePercent ?? 60;
  const points = [];
  for (let i = hours * 4; i >= 0; i--) {
    points.push({
      timestamp: new Date(Date.now() - i * 15 * 60_000).toISOString(),
      cpuPercent: Math.max(0, Math.min(100, baseCpu + (Math.random() - 0.5) * 30)),
      memoryPercent: Math.max(0, Math.min(100, baseMem + (Math.random() - 0.5) * 15)),
    });
  }
  return points;
}

export function generateFleetMetrics(hours = 24) {
  const points = [];
  for (let i = hours * 2; i >= 0; i--) {
    const t = i / (hours * 2);
    points.push({
      timestamp: new Date(Date.now() - i * 30 * 60_000).toISOString(),
      cpuPercent: 35 + Math.sin(t * Math.PI * 3) * 20 + (Math.random() - 0.5) * 8,
      memoryPercent: 58 + Math.sin(t * Math.PI * 2 + 1) * 12 + (Math.random() - 0.5) * 6,
      runningVms: 3 + Math.round(Math.sin(t * Math.PI) * 2),
    });
  }
  return points;
}

export const MOCK_DELAY_MS = 400;
export const delay = () => new Promise<void>((r) => setTimeout(r, MOCK_DELAY_MS));
