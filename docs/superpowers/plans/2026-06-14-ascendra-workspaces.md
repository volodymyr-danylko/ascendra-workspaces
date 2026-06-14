# Ascendra Workspaces Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Ascendra Workspaces dashboard with Developer and Admin personas, mock Next.js API backend, TanStack Query data layer, and polished dark UI.

**Architecture:** Next.js 14 App Router with route groups `(developer)` and `(admin)` for persona separation. Mock backend via Next.js Route Handlers. TanStack Query for client data fetching with skeleton/error/empty states. Cookie-based simulated auth with Zustand client store. Optimistic updates for VM lifecycle actions.

**Tech Stack:** Next.js 14, TypeScript (strict), Tailwind CSS, shadcn/ui, TanStack Query v5, Zustand, Recharts, Vitest + React Testing Library, Playwright

---

## File Map

```
ascendra-workspaces/
├── app/
│   ├── layout.tsx                          root layout + QueryProvider
│   ├── page.tsx                            redirect → /login
│   ├── globals.css                         dark CSS variables
│   ├── (auth)/login/page.tsx               login page
│   ├── (developer)/layout.tsx             developer sidebar shell
│   ├── (developer)/developer/machines/page.tsx
│   ├── (developer)/developer/machines/[id]/page.tsx
│   ├── (admin)/layout.tsx                 admin sidebar shell
│   ├── (admin)/admin/overview/page.tsx
│   ├── (admin)/admin/inventory/page.tsx
│   ├── (admin)/admin/utilization/page.tsx
│   ├── (admin)/admin/templates/page.tsx
│   └── api/
│       ├── auth/route.ts
│       ├── vms/route.ts
│       ├── vms/[id]/route.ts
│       ├── vms/[id]/action/route.ts
│       ├── vms/[id]/metrics/route.ts
│       ├── fleet/route.ts
│       ├── templates/route.ts
│       └── templates/[id]/route.ts
├── components/
│   ├── providers/QueryProvider.tsx
│   ├── developer/
│   │   ├── DeveloperSidebar.tsx
│   │   ├── VMCard.tsx
│   │   ├── VMStatusBadge.tsx
│   │   ├── ResourceBar.tsx
│   │   └── VMMetricsChart.tsx
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── FleetKPICard.tsx
│       ├── VMInventoryTable.tsx
│       ├── UtilizationChart.tsx
│       └── TemplateForm.tsx
├── hooks/
│   ├── useVMs.ts
│   ├── useFleet.ts
│   └── useTemplates.ts
├── lib/
│   ├── api-client.ts
│   ├── auth.ts                             Zustand store
│   ├── mock-data.ts                        in-memory seed + mutators
│   └── utils.ts                            formatCost, formatUptime, isIdle
├── types/index.ts
├── middleware.ts
├── vitest.config.ts
├── tests/
│   ├── setup.ts
│   ├── lib/utils.test.ts
│   ├── components/VMStatusBadge.test.tsx
│   ├── components/ResourceBar.test.tsx
│   ├── components/VMCard.test.tsx
│   └── e2e/dashboard.spec.ts
└── README.md
```

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: project root (scaffold in existing directory)

- [ ] **Step 1: Run create-next-app inside the existing directory**

```bash
cd /Users/mac/Documents/Work/GDE/ascendra-workspaces
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

Expected: Next.js scaffolded with `app/`, `public/`, `package.json`, `tsconfig.json`, `tailwind.config.ts`.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install @tanstack/react-query zustand recharts
npm install lucide-react class-variance-authority clsx tailwind-merge
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @playwright/test
```

- [ ] **Step 4: Install shadcn/ui**

```bash
npx shadcn@latest init --defaults
```

When prompted: style → Default, base color → Slate, CSS variables → yes.

- [ ] **Step 5: Add shadcn components**

```bash
npx shadcn@latest add button card input label badge table dialog form select skeleton separator
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with dependencies"
```

---

### Task 2: Configure dark theme

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace globals.css with dark design system variables**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222 47% 6%;
    --foreground: 214 32% 91%;
    --card: 222 31% 15%;
    --card-foreground: 214 32% 91%;
    --popover: 222 31% 15%;
    --popover-foreground: 214 32% 91%;
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    --secondary: 215 28% 22%;
    --secondary-foreground: 214 32% 91%;
    --muted: 215 28% 22%;
    --muted-foreground: 215 16% 47%;
    --accent: 215 28% 22%;
    --accent-foreground: 214 32% 91%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 215 25% 22%;
    --input: 215 25% 22%;
    --ring: 239 84% 67%;
    --radius: 0.5rem;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

- [ ] **Step 2: Update tailwind.config.ts to extend with custom colors**

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'dev-accent': '#6366f1',
        'admin-accent': '#22d3ee',
        'surface': '#1e2433',
        'surface-raised': '#253047',
        'border-subtle': '#2d3a55',
        'status-running': '#22c55e',
        'status-stopped': '#475569',
        'status-starting': '#f59e0b',
        'status-error': '#ef4444',
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 3: Update root layout**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ascendra Workspaces',
  description: 'Developer machine management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Create QueryProvider**

```tsx
// components/providers/QueryProvider.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 5: Make root page redirect to login**

```tsx
// app/page.tsx
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/login');
}
```

- [ ] **Step 6: Configure Vitest**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
```

```ts
// tests/setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Step 7: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: configure dark theme, Vitest, QueryProvider"
```

---

### Task 3: Domain types

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Write types/index.ts**

```ts
// types/index.ts
export type VMStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error';

export interface VM {
  id: string;
  name: string;
  ownerId: string;
  templateId: string;
  status: VMStatus;
  region: string;
  createdAt: string;
  startedAt: string | null;
  lastActiveAt: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskUsagePercent: number;
  hourlyCost: number;
}

export interface VMTemplate {
  id: string;
  name: string;
  description: string;
  baseImage: string;
  vCpu: number;
  memoryGb: number;
  diskSizeGb: number;
  preinstalledTools: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'engineer' | 'admin';
  vmCount: number;
}

export interface MetricPoint {
  timestamp: string;
  cpuPercent: number;
  memoryPercent: number;
}

export interface FleetMetricPoint extends MetricPoint {
  runningVms: number;
}

export interface FleetUtilization {
  period: string;
  totalVms: number;
  runningVms: number;
  stoppedVms: number;
  totalUsers: number;
  avgCpuUtilizationPercent: number;
  peakCpuUtilizationPercent: number;
  avgMemoryUtilizationPercent: number;
  peakMemoryUtilizationPercent: number;
  totalHourlyCost: number;
  monthToDateCost: number;
  projectedMonthlyCost: number;
  utilizationTrend: FleetMetricPoint[];
  vmMetrics: {
    vmId: string;
    cpuPercent: number;
    memoryPercent: number;
    diskPercent: number;
    status: VMStatus;
  }[];
}
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: add domain types"
```

---

### Task 4: Utility functions + unit tests

**Files:**
- Create: `lib/utils.ts`
- Create: `tests/lib/utils.test.ts`

- [ ] **Step 1: Write the failing tests first**

```ts
// tests/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCost, formatUptime, isIdle, getStatusColor, cn } from '@/lib/utils';

describe('formatCost', () => {
  it('formats whole dollars', () => expect(formatCost(2.0)).toBe('$2.00'));
  it('formats cents', () => expect(formatCost(0.48)).toBe('$0.48'));
  it('formats large values', () => expect(formatCost(2140)).toBe('$2,140.00'));
});

describe('formatUptime', () => {
  it('returns dashes when startedAt is null', () => expect(formatUptime(null)).toBe('—'));
  it('formats minutes', () => {
    const startedAt = new Date(Date.now() - 45 * 60 * 1000).toISOString();
    expect(formatUptime(startedAt)).toBe('45m');
  });
  it('formats hours and minutes', () => {
    const startedAt = new Date(Date.now() - (2 * 60 + 30) * 60 * 1000).toISOString();
    expect(formatUptime(startedAt)).toBe('2h 30m');
  });
});

describe('isIdle', () => {
  it('returns true when lastActiveAt > 2h ago', () => {
    const lastActiveAt = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(isIdle(lastActiveAt)).toBe(true);
  });
  it('returns false when lastActiveAt < 2h ago', () => {
    const lastActiveAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    expect(isIdle(lastActiveAt)).toBe(false);
  });
});

describe('getStatusColor', () => {
  it('maps running to green', () => expect(getStatusColor('running')).toBe('text-status-running'));
  it('maps stopped to slate', () => expect(getStatusColor('stopped')).toBe('text-status-stopped'));
  it('maps starting to amber', () => expect(getStatusColor('starting')).toBe('text-status-starting'));
  it('maps stopping to amber', () => expect(getStatusColor('stopping')).toBe('text-status-starting'));
  it('maps error to red', () => expect(getStatusColor('error')).toBe('text-status-error'));
});
```

- [ ] **Step 2: Run tests — expect failures**

```bash
npm test -- tests/lib/utils.test.ts
```

Expected: 9 failures — `formatCost`, `formatUptime`, `isIdle`, `getStatusColor` not found.

- [ ] **Step 3: Implement lib/utils.ts**

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { VMStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  const diffMs = Date.now() - new Date(lastActiveAt).getTime();
  return diffMs > thresholdHours * 60 * 60 * 1000;
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
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npm test -- tests/lib/utils.test.ts
```

Expected: 9 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/utils.ts tests/lib/utils.test.ts tests/setup.ts vitest.config.ts
git commit -m "feat: utility functions with unit tests"
```

---

### Task 5: Mock data seed

**Files:**
- Create: `lib/mock-data.ts`

- [ ] **Step 1: Write lib/mock-data.ts**

```ts
// lib/mock-data.ts
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

// Module-level mutable state (persists across requests in Next.js dev server)
let vms: VM[] = [...BASE_VMS];
let templates: VMTemplate[] = [...BASE_TEMPLATES];

export const db = {
  // Users
  getUserByEmail: (email: string) => MOCK_USERS.find((u) => u.email === email),
  getUser: (id: string) => MOCK_USERS.find((u) => u.id === id),

  // VMs
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

  // Templates
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

const DELAY_MS = 400;
export const delay = () => new Promise((r) => setTimeout(r, DELAY_MS));
```

- [ ] **Step 2: Commit**

```bash
git add lib/mock-data.ts
git commit -m "feat: mock data seed with in-memory store"
```

---

### Task 6: Auth API route + Zustand store + middleware

**Files:**
- Create: `app/api/auth/route.ts`
- Create: `lib/auth.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Write auth API route**

```ts
// app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, delay } from '@/lib/mock-data';

export async function POST(req: Request) {
  await delay();
  const { email } = await req.json();
  const user = db.getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }
  const cookieStore = cookies();
  cookieStore.set('userId', user.id, { httpOnly: true, path: '/', sameSite: 'lax' });
  cookieStore.set('role', user.role, { httpOnly: true, path: '/', sameSite: 'lax' });
  return NextResponse.json({ user });
}

export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete('userId');
  cookieStore.delete('role');
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Write Zustand auth store**

```ts
// lib/auth.ts
'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: async () => {
        await fetch('/api/auth', { method: 'DELETE' });
        set({ user: null });
      },
    }),
    { name: 'ascendra-auth' }
  )
);
```

- [ ] **Step 3: Write middleware**

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userId = request.cookies.get('userId')?.value;
  const role = request.cookies.get('role')?.value;

  if (pathname === '/login') {
    if (userId) {
      const dest = role === 'admin' ? '/admin/overview' : '/developer/machines';
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/developer/machines', request.url));
  }

  if (pathname.startsWith('/developer') && role !== 'engineer') {
    return NextResponse.redirect(new URL('/admin/overview', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

- [ ] **Step 4: Commit**

```bash
git add app/api/auth/route.ts lib/auth.ts middleware.ts
git commit -m "feat: auth API route, Zustand store, route middleware"
```

---

### Task 7: Login page

**Files:**
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Write login page**

```tsx
// app/(auth)/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PRESET_ACCOUNTS = [
  { email: 'alice@ascendra.dev', name: 'Alice Chen', role: 'Engineer', hint: 'Developer view' },
  { email: 'charlie@ascendra.dev', name: 'Charlie Park', role: 'Engineer', hint: 'Developer view' },
  { email: 'bob@ascendra.dev', name: 'Bob Martinez', role: 'Admin', hint: 'Admin view' },
];

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  async function login(email: string) {
    setLoading(email);
    setError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Login failed');
      const { user } = await res.json();
      setUser(user);
      router.push(user.role === 'admin' ? '/admin/overview' : '/developer/machines');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ascendra</h1>
          <p className="text-xs tracking-widest text-dev-accent mt-1">WORKSPACES</p>
        </div>

        <Card className="bg-surface border-border-subtle">
          <CardHeader>
            <CardTitle className="text-base">Choose an account</CardTitle>
            <CardDescription>Preset demo accounts — no password required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {PRESET_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => login(account.email)}
                disabled={loading !== null}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-background border border-border-subtle hover:border-dev-accent transition-colors text-left disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-full bg-dev-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {account.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{account.name}</p>
                  <p className="text-xs text-muted-foreground">{account.hint}</p>
                </div>
                <span className="text-xs text-muted-foreground border border-border-subtle rounded px-2 py-0.5">
                  {account.role}
                </span>
                {loading === account.email && (
                  <div className="w-4 h-4 border-2 border-dev-accent border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
            {error && <p className="text-sm text-status-error text-center pt-1">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify login page renders**

```bash
npm run dev
```

Open http://localhost:3000 — should redirect to `/login` and show three account buttons.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/
git commit -m "feat: login page with preset accounts"
```

---

### Task 8: VM API routes

**Files:**
- Create: `app/api/vms/route.ts`
- Create: `app/api/vms/[id]/route.ts`
- Create: `app/api/vms/[id]/action/route.ts`
- Create: `app/api/vms/[id]/metrics/route.ts`

- [ ] **Step 1: Write GET /api/vms**

```ts
// app/api/vms/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, delay } from '@/lib/mock-data';

export async function GET() {
  await delay();
  const cookieStore = cookies();
  const userId = cookieStore.get('userId')?.value;
  const role = cookieStore.get('role')?.value;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const vms = role === 'admin' ? db.getAllVMs() : db.getVMsByOwner(userId);
  return NextResponse.json({ vms });
}
```

- [ ] **Step 2: Write GET /api/vms/[id]**

```ts
// app/api/vms/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, delay } from '@/lib/mock-data';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await delay();
  const cookieStore = cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const vm = db.getVM(params.id);
  if (!vm) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ vm });
}
```

- [ ] **Step 3: Write POST /api/vms/[id]/action**

```ts
// app/api/vms/[id]/action/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, delay } from '@/lib/mock-data';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await delay();
  const cookieStore = cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action } = await req.json() as { action: 'start' | 'stop' | 'restart' };
  const vm = db.applyVMAction(params.id, action);
  if (!vm) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ vm });
}
```

- [ ] **Step 4: Write GET /api/vms/[id]/metrics**

```ts
// app/api/vms/[id]/metrics/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, generateVMMetrics, delay } from '@/lib/mock-data';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await delay();
  const cookieStore = cookies();
  if (!cookieStore.get('userId')?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(req.url);
  const hours = Number(url.searchParams.get('hours') ?? '24');
  const vm = db.getVM(params.id);
  if (!vm) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ metrics: generateVMMetrics(params.id, hours) });
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/vms/
git commit -m "feat: VM API routes (list, detail, action, metrics)"
```

---

### Task 9: Fleet + Templates API routes

**Files:**
- Create: `app/api/fleet/route.ts`
- Create: `app/api/templates/route.ts`
- Create: `app/api/templates/[id]/route.ts`

- [ ] **Step 1: Write GET /api/fleet**

```ts
// app/api/fleet/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, generateFleetMetrics, delay } from '@/lib/mock-data';

export async function GET(req: Request) {
  await delay();
  const cookieStore = cookies();
  if (!cookieStore.get('userId')?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(req.url);
  const hours = Number(url.searchParams.get('hours') ?? '24');

  const vms = db.getAllVMs();
  const running = vms.filter((v) => v.status === 'running');
  const stopped = vms.filter((v) => v.status === 'stopped');
  const avgCpu = running.length
    ? running.reduce((s, v) => s + v.cpuUsagePercent, 0) / running.length
    : 0;
  const avgMem = running.length
    ? running.reduce((s, v) => s + v.memoryUsagePercent, 0) / running.length
    : 0;
  const totalHourlyCost = running.reduce((s, v) => s + v.hourlyCost, 0);
  const daysElapsed = new Date().getDate();
  const monthToDateCost = totalHourlyCost * 24 * daysElapsed;

  return NextResponse.json({
    fleet: {
      period: `last-${hours}-hours`,
      totalVms: vms.length,
      runningVms: running.length,
      stoppedVms: stopped.length,
      totalUsers: new Set(vms.map((v) => v.ownerId)).size,
      avgCpuUtilizationPercent: Math.round(avgCpu),
      peakCpuUtilizationPercent: Math.round(avgCpu * 1.4),
      avgMemoryUtilizationPercent: Math.round(avgMem),
      peakMemoryUtilizationPercent: Math.round(avgMem * 1.3),
      totalHourlyCost,
      monthToDateCost,
      projectedMonthlyCost: totalHourlyCost * 24 * 30,
      utilizationTrend: generateFleetMetrics(hours),
      vmMetrics: vms.map((v) => ({
        vmId: v.id,
        cpuPercent: v.cpuUsagePercent,
        memoryPercent: v.memoryUsagePercent,
        diskPercent: v.diskUsagePercent,
        status: v.status,
      })),
    },
  });
}
```

- [ ] **Step 2: Write GET + POST /api/templates**

```ts
// app/api/templates/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, delay } from '@/lib/mock-data';
import type { VMTemplate } from '@/types';

export async function GET() {
  await delay();
  const cookieStore = cookies();
  if (!cookieStore.get('userId')?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ templates: db.getTemplates() });
}

export async function POST(req: Request) {
  await delay();
  const cookieStore = cookies();
  if (cookieStore.get('role')?.value !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json() as Omit<VMTemplate, 'id'>;
  const template = db.createTemplate(data);
  return NextResponse.json({ template }, { status: 201 });
}
```

- [ ] **Step 3: Write PATCH /api/templates/[id]**

```ts
// app/api/templates/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, delay } from '@/lib/mock-data';
import type { VMTemplate } from '@/types';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await delay();
  const cookieStore = cookies();
  if (cookieStore.get('role')?.value !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const data = await req.json() as Partial<Omit<VMTemplate, 'id'>>;
  const template = db.updateTemplate(params.id, data);
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ template });
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/fleet/ app/api/templates/
git commit -m "feat: fleet and templates API routes"
```

---

### Task 10: API client + TanStack Query hooks

**Files:**
- Create: `lib/api-client.ts`
- Create: `hooks/useVMs.ts`
- Create: `hooks/useFleet.ts`
- Create: `hooks/useTemplates.ts`

- [ ] **Step 1: Write typed API client**

```ts
// lib/api-client.ts
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
};
```

- [ ] **Step 2: Write VM hooks**

```ts
// hooks/useVMs.ts
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
      apiClient.post<{ vm: VM }>(`/api/vms/${vmId}/action`, { action }).then((r) => r.vm),
    onMutate: async (action) => {
      await qc.cancelQueries({ queryKey: ['vms'] });
      const previous = qc.getQueryData<VM[]>(['vms']);
      const transientStatus = action === 'start' ? 'starting' : action === 'stop' ? 'stopping' : 'starting';
      qc.setQueryData<VM[]>(['vms'], (old) =>
        old?.map((v) => (v.id === vmId ? { ...v, status: transientStatus } : v))
      );
      return { previous };
    },
    onError: (_e, _a, ctx) => qc.setQueryData(['vms'], ctx?.previous),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['vms'] });
    },
  });
}
```

- [ ] **Step 3: Write fleet hook**

```ts
// hooks/useFleet.ts
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
```

- [ ] **Step 4: Write templates hooks**

```ts
// hooks/useTemplates.ts
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { VMTemplate } from '@/types';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () =>
      apiClient.get<{ templates: VMTemplate[] }>('/api/templates').then((r) => r.templates),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<VMTemplate, 'id'>) =>
      apiClient.post<{ template: VMTemplate }>('/api/templates', data).then((r) => r.template),
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
```

- [ ] **Step 5: Commit**

```bash
git add lib/api-client.ts hooks/
git commit -m "feat: typed API client and TanStack Query hooks"
```

---

### Task 11: Shared UI components + tests

**Files:**
- Create: `components/developer/VMStatusBadge.tsx`
- Create: `components/developer/ResourceBar.tsx`
- Create: `tests/components/VMStatusBadge.test.tsx`
- Create: `tests/components/ResourceBar.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// tests/components/VMStatusBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { VMStatusBadge } from '@/components/developer/VMStatusBadge';

it('shows "running" label for running status', () => {
  render(<VMStatusBadge status="running" />);
  expect(screen.getByText('running')).toBeInTheDocument();
});

it('shows "starting" with animate-pulse class for starting status', () => {
  const { container } = render(<VMStatusBadge status="starting" />);
  expect(container.firstChild).toHaveClass('animate-pulse');
});

it('shows "stopped" label for stopped status', () => {
  render(<VMStatusBadge status="stopped" />);
  expect(screen.getByText('stopped')).toBeInTheDocument();
});
```

```tsx
// tests/components/ResourceBar.test.tsx
import { render } from '@testing-library/react';
import { ResourceBar } from '@/components/developer/ResourceBar';

it('renders bar with correct width percentage', () => {
  const { container } = render(<ResourceBar value={42} label="CPU" />);
  const bar = container.querySelector('[style*="42%"]');
  expect(bar).toBeTruthy();
});

it('applies warning color when value > 80', () => {
  const { container } = render(<ResourceBar value={85} label="MEM" />);
  const bar = container.querySelector('[style*="85%"]');
  expect(bar?.className).toContain('bg-amber');
});
```

- [ ] **Step 2: Run — expect failures**

```bash
npm test -- tests/components/VMStatusBadge.test.tsx tests/components/ResourceBar.test.tsx
```

Expected: failures — components not found.

- [ ] **Step 3: Implement VMStatusBadge**

```tsx
// components/developer/VMStatusBadge.tsx
import { cn, getStatusBgColor } from '@/lib/utils';
import type { VMStatus } from '@/types';

interface Props {
  status: VMStatus;
  className?: string;
}

export function VMStatusBadge({ status, className }: Props) {
  const isTransient = status === 'starting' || status === 'stopping';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium',
        getStatusBgColor(status),
        isTransient && 'animate-pulse',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
```

- [ ] **Step 4: Implement ResourceBar**

```tsx
// components/developer/ResourceBar.tsx
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  label: string;
  className?: string;
}

export function ResourceBar({ value, label, className }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const barColor =
    clamped > 90 ? 'bg-status-error' : clamped > 80 ? 'bg-amber-400' : 'bg-dev-accent';

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border">
        <div
          className={cn('h-1.5 rounded-full transition-all', barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests — expect all pass**

```bash
npm test -- tests/components/VMStatusBadge.test.tsx tests/components/ResourceBar.test.tsx
```

Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add components/developer/VMStatusBadge.tsx components/developer/ResourceBar.tsx tests/components/
git commit -m "feat: VMStatusBadge and ResourceBar components with tests"
```

---

### Task 12: Developer layout + sidebar

**Files:**
- Create: `components/developer/DeveloperSidebar.tsx`
- Create: `app/(developer)/layout.tsx`

- [ ] **Step 1: Write DeveloperSidebar**

```tsx
// components/developer/DeveloperSidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Monitor, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth';

const NAV = [{ href: '/developer/machines', label: 'My Machines', icon: Monitor }];

export function DeveloperSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border-subtle bg-[#0a0d14]">
      {/* Logo */}
      <div className="px-4 py-5">
        <p className="text-sm font-bold tracking-tight text-foreground">Ascendra</p>
        <p className="text-[10px] tracking-widest text-dev-accent">WORKSPACES</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
              pathname.startsWith(href)
                ? 'border-l-2 border-dev-accent bg-surface text-dev-accent pl-[10px]'
                : 'text-muted-foreground hover:bg-surface hover:text-foreground'
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dev-accent text-xs font-bold text-white">
            {user?.name?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground">engineer</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Write developer layout**

```tsx
// app/(developer)/layout.tsx
import { DeveloperSidebar } from '@/components/developer/DeveloperSidebar';

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DeveloperSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/developer/DeveloperSidebar.tsx app/\(developer\)/layout.tsx
git commit -m "feat: developer layout and sidebar"
```

---

### Task 13: My Machines page

**Files:**
- Create: `components/developer/VMCard.tsx`
- Create: `app/(developer)/developer/machines/page.tsx`
- Create: `tests/components/VMCard.test.tsx`

- [ ] **Step 1: Write failing VMCard test**

```tsx
// tests/components/VMCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { VMCard } from '@/components/developer/VMCard';
import type { VM } from '@/types';

const mockVM: VM = {
  id: 'vm1', name: 'dev-machine-01', ownerId: 'u1', templateId: 't2',
  status: 'running', region: 'us-east-1', createdAt: '2025-01-01T00:00:00Z',
  startedAt: new Date(Date.now() - 3_600_000).toISOString(),
  lastActiveAt: new Date().toISOString(),
  cpuUsagePercent: 42, memoryUsagePercent: 67, diskUsagePercent: 31, hourlyCost: 0.48,
};

it('renders VM name and status', () => {
  render(<VMCard vm={mockVM} onAction={vi.fn()} isActioning={false} />);
  expect(screen.getByText('dev-machine-01')).toBeInTheDocument();
  expect(screen.getByText('running')).toBeInTheDocument();
});

it('renders resource usage', () => {
  render(<VMCard vm={mockVM} onAction={vi.fn()} isActioning={false} />);
  expect(screen.getByText('42%')).toBeInTheDocument();
  expect(screen.getByText('67%')).toBeInTheDocument();
});

it('calls onAction with "stop" when Stop is clicked', async () => {
  const onAction = vi.fn();
  render(<VMCard vm={mockVM} onAction={onAction} isActioning={false} />);
  await userEvent.click(screen.getByRole('button', { name: /stop/i }));
  expect(onAction).toHaveBeenCalledWith('stop');
});
```

- [ ] **Step 2: Run — expect failures**

```bash
npm test -- tests/components/VMCard.test.tsx
```

Expected: failures — VMCard not found.

- [ ] **Step 3: Implement VMCard**

```tsx
// components/developer/VMCard.tsx
import Link from 'next/link';
import { Play, Square, RotateCcw, ExternalLink } from 'lucide-react';
import { VMStatusBadge } from './VMStatusBadge';
import { ResourceBar } from './ResourceBar';
import { formatUptime, cn } from '@/lib/utils';
import type { VM } from '@/types';

interface Props {
  vm: VM;
  onAction: (action: 'start' | 'stop' | 'restart') => void;
  isActioning: boolean;
}

export function VMCard({ vm, onAction, isActioning }: Props) {
  const isRunning = vm.status === 'running';
  const isStopped = vm.status === 'stopped';
  const isTransient = vm.status === 'starting' || vm.status === 'stopping';

  return (
    <div className={cn('rounded-xl border bg-surface p-4 transition-colors', isTransient && 'border-amber-800/50')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <Link
            href={`/developer/machines/${vm.id}`}
            className="text-sm font-semibold text-foreground hover:text-dev-accent transition-colors truncate block"
          >
            {vm.name}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {vm.region} · Uptime {formatUptime(vm.startedAt)}
          </p>
        </div>
        <VMStatusBadge status={vm.status} />
      </div>

      {/* Resource bars — only shown when running */}
      {isRunning && (
        <div className="space-y-2 mb-4">
          <ResourceBar value={vm.cpuUsagePercent} label="CPU" />
          <ResourceBar value={vm.memoryUsagePercent} label="MEM" />
          <ResourceBar value={vm.diskUsagePercent} label="DISK" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isRunning && (
          <a
            href={`https://vscode-server.${vm.id}.ascendra.dev`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-dev-accent bg-dev-accent/10 px-3 py-1.5 text-xs font-medium text-dev-accent hover:bg-dev-accent/20 transition-colors"
          >
            <ExternalLink size={11} /> Open in IDE
          </a>
        )}
        {isStopped && (
          <ActionBtn onClick={() => onAction('start')} disabled={isActioning} aria-label="Start">
            <Play size={11} /> Start
          </ActionBtn>
        )}
        {isRunning && (
          <>
            <ActionBtn onClick={() => onAction('stop')} disabled={isActioning} aria-label="Stop">
              <Square size={11} /> Stop
            </ActionBtn>
            <ActionBtn onClick={() => onAction('restart')} disabled={isActioning} aria-label="Restart">
              <RotateCcw size={11} /> Restart
            </ActionBtn>
          </>
        )}
        {isActioning && (
          <div className="ml-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-dev-accent border-t-transparent" />
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  children, onClick, disabled, 'aria-label': label,
}: {
  children: React.ReactNode; onClick: () => void; disabled: boolean; 'aria-label': string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Run — expect all pass**

```bash
npm test -- tests/components/VMCard.test.tsx
```

Expected: 3 passed.

- [ ] **Step 5: Write My Machines page**

```tsx
// app/(developer)/developer/machines/page.tsx
'use client';
import { VMCard } from '@/components/developer/VMCard';
import { useVMs, useVMAction } from '@/hooks/useVMs';
import { Skeleton } from '@/components/ui/skeleton';

export default function MachinesPage() {
  const { data: vms, isLoading, isError, error } = useVMs();

  if (isLoading) return <MachinesSkeleton />;
  if (isError) return <ErrorState message={error?.message} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">My Machines</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {vms?.length ?? 0} machine{vms?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {vms?.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vms?.map((vm) => (
            <VMCardContainer key={vm.id} vm={vm} />
          ))}
        </div>
      )}
    </div>
  );
}

function VMCardContainer({ vm }: { vm: import('@/types').VM }) {
  const { mutate, isPending } = useVMAction(vm.id);
  return <VMCard vm={vm} onAction={(action) => mutate(action)} isActioning={isPending} />;
}

function MachinesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border-subtle bg-surface p-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border-subtle p-12 text-center">
      <p className="text-sm font-medium text-foreground">No machines yet</p>
      <p className="text-xs text-muted-foreground mt-1">Contact your admin to provision a dev machine.</p>
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border border-status-error/30 bg-red-950/20 p-6 text-center">
      <p className="text-sm text-status-error">Failed to load machines</p>
      {message && <p className="text-xs text-muted-foreground mt-1">{message}</p>}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/developer/VMCard.tsx app/\(developer\)/developer/ tests/components/VMCard.test.tsx
git commit -m "feat: My Machines page with VMCard, skeleton, empty, error states"
```

---

### Task 14: VM Detail page

**Files:**
- Create: `components/developer/VMMetricsChart.tsx`
- Create: `app/(developer)/developer/machines/[id]/page.tsx`

- [ ] **Step 1: Implement VMMetricsChart**

```tsx
// components/developer/VMMetricsChart.tsx
'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Props {
  data: { timestamp: string; cpuPercent: number; memoryPercent: number }[];
}

function formatTs(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function VMMetricsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="mem" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="timestamp" tickFormatter={formatTs} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          contentStyle={{ background: '#1e2433', border: '1px solid #2d3a55', borderRadius: 6, fontSize: 11 }}
          labelFormatter={formatTs}
          formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]}
        />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Area type="monotone" dataKey="cpuPercent" name="CPU" stroke="#6366f1" fill="url(#cpu)" strokeWidth={1.5} dot={false} />
        <Area type="monotone" dataKey="memoryPercent" name="Memory" stroke="#22d3ee" fill="url(#mem)" strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Write VM detail page**

```tsx
// app/(developer)/developer/machines/[id]/page.tsx
'use client';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useVM, useVMMetrics, useVMAction } from '@/hooks/useVMs';
import { useTemplates } from '@/hooks/useTemplates';
import { VMStatusBadge } from '@/components/developer/VMStatusBadge';
import { ResourceBar } from '@/components/developer/ResourceBar';
import { VMMetricsChart } from '@/components/developer/VMMetricsChart';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUptime, formatCost } from '@/lib/utils';

export default function VMDetailPage({ params }: { params: { id: string } }) {
  const { data: vm, isLoading: vmLoading } = useVM(params.id);
  const { data: metrics, isLoading: metricsLoading } = useVMMetrics(params.id, 24);
  const { data: templates } = useTemplates();
  const { mutate, isPending } = useVMAction(params.id);

  const template = templates?.find((t) => t.id === vm?.templateId);

  if (vmLoading) return <DetailSkeleton />;
  if (!vm) return <p className="text-sm text-muted-foreground">VM not found.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/developer/machines" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-semibold text-foreground">{vm.name}</h1>
        <VMStatusBadge status={vm.status} />
      </div>

      {/* Metadata */}
      <div className="rounded-xl border border-border-subtle bg-surface p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        {[
          { label: 'Template', value: template?.name ?? vm.templateId },
          { label: 'Region', value: vm.region },
          { label: 'Uptime', value: formatUptime(vm.startedAt) },
          { label: 'Cost/hr', value: formatCost(vm.hourlyCost) },
          { label: 'vCPU', value: template ? `${template.vCpu} cores` : '—' },
          { label: 'Memory', value: template ? `${template.memoryGb} GB` : '—' },
          { label: 'Disk', value: template ? `${template.diskSizeGb} GB` : '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium text-foreground mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Resource usage */}
      {vm.status === 'running' && (
        <div className="rounded-xl border border-border-subtle bg-surface p-4 space-y-3">
          <h2 className="text-sm font-medium text-foreground">Current Usage</h2>
          <ResourceBar value={vm.cpuUsagePercent} label="CPU" />
          <ResourceBar value={vm.memoryUsagePercent} label="Memory" />
          <ResourceBar value={vm.diskUsagePercent} label="Disk" />
        </div>
      )}

      {/* Charts */}
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="text-sm font-medium text-foreground mb-4">CPU & Memory — last 24h</h2>
        {metricsLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : metrics ? (
          <VMMetricsChart data={metrics} />
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {vm.status === 'running' && (
          <a
            href={`https://vscode-server.${vm.id}.ascendra.dev`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-dev-accent bg-dev-accent/10 px-4 py-2 text-sm text-dev-accent hover:bg-dev-accent/20 transition-colors"
          >
            <ExternalLink size={13} /> Open in IDE
          </a>
        )}
        {vm.status === 'stopped' && (
          <button
            onClick={() => mutate('start')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-4 py-2 text-sm text-foreground hover:border-dev-accent transition-colors disabled:opacity-40"
          >
            Start
          </button>
        )}
        {vm.status === 'running' && (
          <>
            <button onClick={() => mutate('stop')} disabled={isPending} className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">Stop</button>
            <button onClick={() => mutate('restart')} disabled={isPending} className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">Restart</button>
          </>
        )}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-3xl space-y-6">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-[220px] w-full rounded-xl" />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/developer/VMMetricsChart.tsx app/\(developer\)/developer/machines/\[id\]/
git commit -m "feat: VM detail page with metrics chart"
```

---

### Task 15: Admin layout + sidebar

**Files:**
- Create: `components/admin/AdminSidebar.tsx`
- Create: `app/(admin)/layout.tsx`

- [ ] **Step 1: Write AdminSidebar**

```tsx
// components/admin/AdminSidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Server, Activity, Box, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth';

const NAV = [
  { href: '/admin/overview', label: 'Overview', icon: BarChart3 },
  { href: '/admin/inventory', label: 'VM Inventory', icon: Server },
  { href: '/admin/utilization', label: 'Utilization', icon: Activity },
  { href: '/admin/templates', label: 'Templates', icon: Box },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border-subtle bg-[#0a0d14]">
      <div className="px-4 py-5">
        <p className="text-sm font-bold tracking-tight text-foreground">Ascendra</p>
        <p className="text-[10px] tracking-widest text-admin-accent">ADMIN</p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
              pathname.startsWith(href)
                ? 'border-l-2 border-admin-accent bg-surface text-admin-accent pl-[10px]'
                : 'text-muted-foreground hover:bg-surface hover:text-foreground'
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-admin-accent text-xs font-bold text-[#0a0d14]">
            {user?.name?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground">admin</p>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Log out">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Write admin layout**

```tsx
// app/(admin)/layout.tsx
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/AdminSidebar.tsx app/\(admin\)/layout.tsx
git commit -m "feat: admin layout and sidebar"
```

---

### Task 16: Fleet Overview page

**Files:**
- Create: `components/admin/FleetKPICard.tsx`
- Create: `app/(admin)/admin/overview/page.tsx`
- Create: `tests/components/FleetKPICard.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// tests/components/FleetKPICard.test.tsx
import { render, screen } from '@testing-library/react';
import { FleetKPICard } from '@/components/admin/FleetKPICard';

it('renders label and value', () => {
  render(<FleetKPICard label="Running VMs" value="18" sub="of 24 total" />);
  expect(screen.getByText('Running VMs')).toBeInTheDocument();
  expect(screen.getByText('18')).toBeInTheDocument();
  expect(screen.getByText('of 24 total')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- tests/components/FleetKPICard.test.tsx
```

Expected: FAIL — FleetKPICard not found.

- [ ] **Step 3: Implement FleetKPICard**

```tsx
// components/admin/FleetKPICard.tsx
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  className?: string;
}

export function FleetKPICard({ label, value, sub, accent, className }: Props) {
  return (
    <div className={cn('rounded-xl border border-border-subtle bg-surface p-4', className)}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-3xl font-bold tabular-nums', accent ? 'text-admin-accent' : 'text-foreground')}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- tests/components/FleetKPICard.test.tsx
```

Expected: 1 passed.

- [ ] **Step 5: Write Fleet Overview page**

```tsx
// app/(admin)/admin/overview/page.tsx
'use client';
import { useFleet } from '@/hooks/useFleet';
import { FleetKPICard } from '@/components/admin/FleetKPICard';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCost } from '@/lib/utils';

export default function OverviewPage() {
  const { data: fleet, isLoading, isError } = useFleet(24);

  if (isLoading) return <OverviewSkeleton />;
  if (isError || !fleet) return <p className="text-sm text-status-error">Failed to load fleet data.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Fleet Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time infrastructure health</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FleetKPICard label="Running VMs" value={fleet.runningVms} sub={`of ${fleet.totalVms} total`} accent />
        <FleetKPICard label="Stopped VMs" value={fleet.stoppedVms} />
        <FleetKPICard label="Total Users" value={fleet.totalUsers} />
        <FleetKPICard label="Cost / hr" value={formatCost(fleet.totalHourlyCost)} sub={`${formatCost(fleet.monthToDateCost)} MTD`} />
        <FleetKPICard label="Avg CPU" value={`${fleet.avgCpuUtilizationPercent}%`} sub={`peak ${fleet.peakCpuUtilizationPercent}%`} />
        <FleetKPICard label="Avg Memory" value={`${fleet.avgMemoryUtilizationPercent}%`} sub={`peak ${fleet.peakMemoryUtilizationPercent}%`} />
        <FleetKPICard label="MTD Cost" value={formatCost(fleet.monthToDateCost)} sub="this month" />
        <FleetKPICard label="Projected" value={formatCost(fleet.projectedMonthlyCost)} sub="end of month" />
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/admin/FleetKPICard.tsx app/\(admin\)/admin/overview/ tests/components/FleetKPICard.test.tsx
git commit -m "feat: Fleet Overview page with KPI cards"
```

---

### Task 17: VM Inventory page

**Files:**
- Create: `components/admin/VMInventoryTable.tsx`
- Create: `app/(admin)/admin/inventory/page.tsx`

- [ ] **Step 1: Implement VMInventoryTable**

```tsx
// components/admin/VMInventoryTable.tsx
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
      {/* Filters */}
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

      {/* Table */}
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
                        <AlertTriangle size={12} className="text-status-starting flex-shrink-0" title="Idle > 2h" />
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
```

- [ ] **Step 2: Write Inventory page**

```tsx
// app/(admin)/admin/inventory/page.tsx
'use client';
import { useVMs } from '@/hooks/useVMs';
import { useTemplates } from '@/hooks/useTemplates';
import { VMInventoryTable } from '@/components/admin/VMInventoryTable';
import { Skeleton } from '@/components/ui/skeleton';
import { MOCK_USERS } from '@/lib/mock-data';

export default function InventoryPage() {
  const { data: vms, isLoading: vmsLoading } = useVMs();
  const { data: templates, isLoading: tplLoading } = useTemplates();

  const isLoading = vmsLoading || tplLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">VM Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">All machines across the fleet</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : (
        <VMInventoryTable
          vms={vms ?? []}
          users={MOCK_USERS}
          templates={templates ?? []}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/VMInventoryTable.tsx app/\(admin\)/admin/inventory/
git commit -m "feat: VM Inventory page with search, filter, idle detection"
```

---

### Task 18: Fleet Utilization page

**Files:**
- Create: `components/admin/UtilizationChart.tsx`
- Create: `app/(admin)/admin/utilization/page.tsx`

- [ ] **Step 1: Implement UtilizationChart**

```tsx
// components/admin/UtilizationChart.tsx
'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Props {
  data: { timestamp: string; cpuPercent: number; memoryPercent: number; runningVms: number }[];
}

function fmt(ts: string, hours: number) {
  const d = new Date(ts);
  return hours <= 1
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : hours <= 24
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function UtilizationChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="fcpu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fmem" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="timestamp" tickFormatter={(ts) => fmt(ts, 24)} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          contentStyle={{ background: '#1e2433', border: '1px solid #2d3a55', borderRadius: 6, fontSize: 11 }}
          labelFormatter={(ts) => fmt(ts, 24)}
          formatter={(v: number, name: string) => [`${Number(v).toFixed(1)}%`, name]}
        />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Area type="monotone" dataKey="cpuPercent" name="Avg CPU" stroke="#6366f1" fill="url(#fcpu)" strokeWidth={1.5} dot={false} />
        <Area type="monotone" dataKey="memoryPercent" name="Avg Memory" stroke="#22d3ee" fill="url(#fmem)" strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Write Utilization page**

```tsx
// app/(admin)/admin/utilization/page.tsx
'use client';
import { useState } from 'react';
import { useFleet } from '@/hooks/useFleet';
import { UtilizationChart } from '@/components/admin/UtilizationChart';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const RANGES = [
  { label: '1h', hours: 1 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
  { label: '30d', hours: 720 },
];

export default function UtilizationPage() {
  const [hours, setHours] = useState(24);
  const { data: fleet, isLoading } = useFleet(hours);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Fleet Utilization</h1>
          <p className="text-sm text-muted-foreground mt-1">Aggregate CPU and memory over time</p>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.hours}
              onClick={() => setHours(r.hours)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors border',
                hours === r.hours
                  ? 'bg-admin-accent/20 text-admin-accent border-admin-accent/30'
                  : 'border-border-subtle text-muted-foreground hover:text-foreground'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main chart */}
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="text-sm font-medium text-foreground mb-4">CPU & Memory Utilization</h2>
        {isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : fleet ? (
          <UtilizationChart data={fleet.utilizationTrend} />
        ) : null}
      </div>

      {/* VM distribution */}
      {fleet && (
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="text-sm font-medium text-foreground mb-4">VM Distribution (CPU%)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {fleet.vmMetrics.map((m) => (
              <div
                key={m.vmId}
                className={cn(
                  'rounded-lg border p-2.5 text-center',
                  m.cpuPercent > 80
                    ? 'border-status-error/30 bg-red-950/20'
                    : m.cpuPercent < 5
                    ? 'border-status-stopped/30 bg-slate-900/50'
                    : 'border-border-subtle bg-background'
                )}
              >
                <p className="text-xs font-mono font-bold text-foreground">{m.cpuPercent.toFixed(0)}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{m.vmId}</p>
                <p className={cn('text-[10px] mt-1', m.cpuPercent > 80 ? 'text-status-error' : m.cpuPercent < 5 ? 'text-muted-foreground' : 'text-admin-accent')}>
                  {m.cpuPercent > 80 ? 'hot' : m.cpuPercent < 5 ? 'idle' : 'normal'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/UtilizationChart.tsx app/\(admin\)/admin/utilization/
git commit -m "feat: Fleet Utilization page with area chart and VM distribution"
```

---

### Task 19: Templates page

**Files:**
- Create: `components/admin/TemplateForm.tsx`
- Create: `app/(admin)/admin/templates/page.tsx`

- [ ] **Step 1: Implement TemplateForm**

```tsx
// components/admin/TemplateForm.tsx
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
```

- [ ] **Step 2: Write Templates page**

```tsx
// app/(admin)/admin/templates/page.tsx
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

      {/* Create dialog */}
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

      {/* Edit dialog */}
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
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/TemplateForm.tsx app/\(admin\)/admin/templates/
git commit -m "feat: Templates page with create/edit dialogs"
```

---

### Task 20: Playwright E2E test

**Files:**
- Create: `tests/e2e/dashboard.spec.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: Write playwright.config.ts**

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Write E2E spec**

```ts
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('engineer login → sees My Machines', async ({ page }) => {
  await page.goto('/login');
  await page.getByText('Alice Chen').click();
  await expect(page).toHaveURL(/developer\/machines/);
  await expect(page.getByRole('heading', { name: 'My Machines' })).toBeVisible();
  await expect(page.getByText('dev-machine-01')).toBeVisible();
});

test('admin login → sees Fleet Overview', async ({ page }) => {
  await page.goto('/login');
  await page.getByText('Bob Martinez').click();
  await expect(page).toHaveURL(/admin\/overview/);
  await expect(page.getByRole('heading', { name: 'Fleet Overview' })).toBeVisible();
  await expect(page.getByText('Running VMs')).toBeVisible();
});

test('admin can navigate to VM Inventory and filter', async ({ page }) => {
  await page.goto('/login');
  await page.getByText('Bob Martinez').click();
  await page.getByRole('link', { name: 'VM Inventory' }).click();
  await expect(page).toHaveURL(/admin\/inventory/);
  await page.getByPlaceholder('Search VMs or owners…').fill('charlie');
  await expect(page.getByText('dev-machine-01')).not.toBeVisible();
  await expect(page.getByText('charlie-dev-01')).toBeVisible();
});
```

- [ ] **Step 3: Install Playwright browsers**

```bash
npx playwright install chromium
```

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/ playwright.config.ts
git commit -m "test: Playwright E2E tests for login and navigation flows"
```

---

### Task 21: README + .gitignore + final cleanup

**Files:**
- Modify: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Update .gitignore**

Add to `.gitignore`:
```
.superpowers/
```

- [ ] **Step 2: Write README.md**

```markdown
# Ascendra Workspaces Dashboard

A polished developer machine management dashboard built for the Ascendra Networks Product Design Engineer take-home assignment.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on the login page with three preset accounts:

| Account | Role | Experience |
|---------|------|-----------|
| alice@ascendra.dev | Engineer | Developer dashboard |
| charlie@ascendra.dev | Engineer | Developer dashboard |
| bob@ascendra.dev | Admin | Admin dashboard |

No password required — click any account to sign in.

## Running Tests

```bash
npm test          # unit + component tests (Vitest)
npm run test:e2e  # E2E tests (Playwright, starts server automatically)
```

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 App Router | Route groups give clean persona separation; deploys to Vercel as-is |
| Styling | Tailwind CSS + shadcn/ui | Unstyled Radix primitives we fully own; no runtime CSS-in-JS |
| Data fetching | TanStack Query v5 | Handles loading/error/empty/stale automatically; optimistic updates |
| Auth state | Zustand | Minimal client store for the session; cookies handle server-side auth |
| Charts | Recharts | Best dark-mode support, React-native, smallest bundle |
| Mock backend | Next.js API Routes | Real HTTP, visible network tab, single repo, deploys to Vercel with zero extra config |

## Design Decisions

**Dark Pro visual style** — Developers use this tool all day; dark reduces eye strain. Indigo accent for the developer area, cyan for admin — gives an instant visual signal about which context you're in.

**Simulated auth with preset accounts** — The evaluator can switch between personas without managing sessions. Login sets an `httpOnly` cookie; the middleware enforces role-based routing; Zustand holds the client session.

**Optimistic VM actions** — Start/Stop/Restart immediately show a `starting`/`stopping` badge with an amber pulse animation. If the API call fails, the UI rolls back. This makes the dashboard feel fast even with the simulated 400ms backend delay.

**Idle VM detection** — Any running VM with `lastActiveAt > 2h` ago is highlighted in the inventory table (amber row tint + warning icon). This helps admins spot waste at a glance.

**In-memory mock state** — The API routes mutate a module-level variable. This persists across requests in the Next.js dev server but resets on cold starts in Vercel serverless. For a take-home, this is the right trade-off: zero setup, real HTTP, visible loading states.

## What I'd Do With More Time

- Real auth (NextAuth.js or Clerk) replacing the cookie simulation
- WebSocket / SSE for live metric streaming instead of the 30s poll interval
- Policies & quotas management screen (max VMs per user, idle auto-stop)
- Users & teams page with per-user utilization breakdown
- Storybook for component documentation
- Full accessibility audit (focus traps in modals, screen reader labels)
- More E2E coverage: VM start/stop flow, template create/edit
```

- [ ] **Step 3: Final commit**

```bash
git add README.md .gitignore
git commit -m "docs: README with setup instructions and design decisions"
```

---

### Task 22: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
gh repo create ascendra-workspaces --public --source=. --remote=origin --push
```

- [ ] **Step 2: Deploy**

```bash
npx vercel --prod
```

Follow prompts: link to the repo, accept defaults for Next.js detection.

- [ ] **Step 3: Verify deployed URL**

Open the Vercel URL, log in as Alice, verify machines load. Log out, log in as Bob, verify fleet overview loads.

- [ ] **Step 4: Note the URL**

Copy the deployed URL (e.g. `https://ascendra-workspaces.vercel.app`) for submission.

---

## Run All Tests

```bash
npm test && npm run test:e2e
```

Expected: all Vitest unit + component tests pass, all 3 Playwright specs pass.
