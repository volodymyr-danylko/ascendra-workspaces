# Ascendra Workspaces Dashboard — Design Spec

**Date:** 2026-06-14  
**Role:** Product Design Engineer take-home assignment

---

## 1. Brief Interpretation & Key Decisions

### What we're building
A full-stack dashboard for managing developer machines (VMs) serving two distinct personas:
- **Engineers** — see and control only their own VMs
- **Admins** — see fleet-wide health, utilization, cost, and manage infrastructure configuration

### Key decisions made

| Decision | Choice | Reasoning |
|---|---|---|
| Visual style | Dark Pro — deep navy/slate (`#0f1117` bg, `#1e2433` cards), indigo accents for developer, cyan for admin | Developer tool used all day; dark reduces eye strain; accent color gives instant role signal |
| Persona separation | Simulated auth login with preset accounts | Evaluators can switch personas without setting up real auth; more realistic than a toggle |
| Mock backend | Next.js API routes (`/app/api/...`) | Single repo, real HTTP, visible network tab, deploys to Vercel with zero extra config |
| Framework | Next.js 14 App Router | Matches job description stack exactly; route groups give clean persona separation |
| Charts | Recharts | Best dark-mode support, React-native, well-documented, smallest bundle of the listed options |
| State management | TanStack Query for server state, Zustand for auth session | TQ handles loading/error/empty/stale automatically; Zustand is minimal for the auth slice |
| Component library | shadcn/ui + Tailwind CSS | Matches stack; unstyled primitives we fully own; no runtime CSS-in-JS |

---

## 2. Information Architecture

```
/login
├── Preset accounts: alice (engineer), bob (admin), charlie (engineer)
└── Role in mock user → redirect to role home

/(developer) — route group, layout with indigo sidebar
└── /developer/machines             ← default route for engineers
    └── /developer/machines/[id]   ← VM detail

/(admin) — route group, layout with cyan sidebar  
├── /admin/overview                 ← default route for admins
├── /admin/inventory
├── /admin/utilization
└── /admin/templates
    └── /admin/templates/new        ← create modal / page
```

---

## 3. Architecture

### Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Components | shadcn/ui (Radix primitives) |
| Data fetching | TanStack Query v5 |
| Auth state | Zustand |
| Charts | Recharts |
| Mock backend | Next.js Route Handlers (`/app/api/`) |
| Deployment | Vercel |

### Project structure

```
ascendra-workspaces/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (developer)/
│   │   ├── layout.tsx              ← developer sidebar layout
│   │   └── developer/
│   │       └── machines/
│   │           ├── page.tsx        ← My Machines list
│   │           └── [id]/page.tsx   ← VM detail
│   ├── (admin)/
│   │   ├── layout.tsx              ← admin sidebar layout
│   │   └── admin/
│   │       ├── overview/page.tsx
│   │       ├── inventory/page.tsx
│   │       ├── utilization/page.tsx
│   │       └── templates/page.tsx
│   └── api/
│       ├── auth/route.ts           ← mock login (POST)
│       ├── vms/route.ts            ← GET all VMs (admin) / GET own VMs (dev)
│       ├── vms/[id]/route.ts       ← GET VM detail
│       ├── vms/[id]/action/route.ts← POST start/stop/restart
│       ├── vms/[id]/metrics/route.ts← GET time-series metrics
│       ├── fleet/route.ts          ← GET fleet utilization summary
│       ├── templates/route.ts      ← GET/POST templates
│       └── templates/[id]/route.ts ← PATCH template
├── components/
│   ├── ui/                         ← shadcn/ui primitives
│   ├── developer/
│   │   ├── VMCard.tsx
│   │   ├── VMStatusBadge.tsx
│   │   ├── ResourceBar.tsx
│   │   └── VMMetricsChart.tsx
│   └── admin/
│       ├── FleetKPICard.tsx
│       ├── VMInventoryTable.tsx
│       ├── UtilizationChart.tsx
│       └── TemplateForm.tsx
├── lib/
│   ├── api-client.ts               ← typed fetch wrappers
│   ├── mock-data.ts                ← seed data for API routes
│   └── auth.ts                     ← Zustand store + helpers
├── types/
│   └── index.ts                    ← VM, VMTemplate, User, Policy, FleetUtilization
└── hooks/
    ├── useVMs.ts                   ← TanStack Query hooks
    ├── useFleet.ts
    └── useTemplates.ts
```

---

## 4. Domain Types

Exactly as specified in the assignment brief, placed in `types/index.ts`:

```typescript
type VMStatus = "running" | "stopped" | "starting" | "stopping" | "error";

interface VM {
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

interface VMTemplate {
  id: string;
  name: string;
  description: string;
  baseImage: string;
  vCpu: number;
  memoryGb: number;
  diskSizeGb: number;
  preinstalledTools: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "engineer" | "admin";
  vmCount: number;
}

interface FleetUtilization {
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
  utilizationTrend: {
    timestamp: string;
    cpuPercent: number;
    memoryPercent: number;
    runningVms: number;
  }[];
  vmMetrics: {
    vmId: string;
    cpuPercent: number;
    memoryPercent: number;
    diskPercent: number;
    status: VMStatus;
  }[];
}
```

---

## 5. Mock Backend Design

All API routes live in `app/api/`. They read from `lib/mock-data.ts` (in-memory seed data). Simulated network delay: 300–600ms on all responses to make loading states visible.

### Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth` | Accept `{ email }`, return mock user + session token |
| GET | `/api/vms` | Returns VMs filtered by auth header role (engineer → own, admin → all) |
| GET | `/api/vms/[id]` | Single VM detail |
| POST | `/api/vms/[id]/action` | Body `{ action: "start" \| "stop" \| "restart" }` → mutates mock state, returns updated VM |
| GET | `/api/vms/[id]/metrics` | Time-series CPU/memory data for charts (last N hours) |
| GET | `/api/fleet` | Fleet-wide utilization snapshot + trend data |
| GET | `/api/templates` | All VM templates |
| POST | `/api/templates` | Create new template |
| PATCH | `/api/templates/[id]` | Update template |

### Auth simulation
- Login POST stores `userId` in a cookie (Next.js `cookies()`)
- All subsequent API routes read that cookie to determine role + filter data
- Logout clears the cookie and redirects to `/login`

### Mock data seed
- 3 users (alice: engineer, bob: admin, charlie: engineer)
- 6 VMs (mix of running/stopped/starting statuses, assigned to alice and charlie)
- 3 VM templates (Small, Medium, Large)
- 24h of pre-generated utilization trend data

---

## 6. Data Fetching Layer

TanStack Query hooks in `hooks/`:

```typescript
// Example — useVMs
export function useVMs() {
  return useQuery({
    queryKey: ['vms'],
    queryFn: () => apiClient.get<VM[]>('/api/vms'),
    staleTime: 30_000,
  });
}

// VM action mutation with optimistic update
export function useVMAction(vmId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: 'start' | 'stop' | 'restart') =>
      apiClient.post<VM>(`/api/vms/${vmId}/action`, { action }),
    onMutate: async (action) => {
      // Optimistic: immediately show "starting"/"stopping" status
      await queryClient.cancelQueries({ queryKey: ['vms'] });
      const previous = queryClient.getQueryData<VM[]>(['vms']);
      queryClient.setQueryData<VM[]>(['vms'], (old) =>
        old?.map((vm) =>
          vm.id === vmId
            ? { ...vm, status: action === 'start' ? 'starting' : 'stopping' }
            : vm
        )
      );
      return { previous };
    },
    onError: (_err, _action, ctx) => {
      queryClient.setQueryData(['vms'], ctx?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['vms'] }),
  });
}
```

---

## 7. UI States

Every data-driven view handles four states explicitly:

| State | Treatment |
|---|---|
| **Loading** | Skeleton cards/rows that match the shape of loaded content — not a spinner in the middle |
| **Empty** | Illustrated empty state with contextual message and CTA (e.g., "No machines yet — contact your admin") |
| **Error** | Inline error card with retry button; does not crash the whole layout |
| **In-transition** | VM action buttons show spinner + disabled state; status badge shows "starting"/"stopping" with pulse animation |

The `status: "starting"` and `status: "stopping"` VM statuses drive amber/animated badges to signal in-progress transitions.

---

## 8. Feature Scope

### Core — Developer
- [x] My Machines list (status, template, CPU/mem/disk bars)
- [x] Start / Stop / Restart with optimistic UI
- [x] Open in IDE button (stub link to `https://vscode-server.{vm.id}.ascendra.dev`)
- [x] VM detail: CPU + memory time-series charts (Recharts `LineChart`), metadata card

### Core — Admin
- [x] Fleet overview KPI cards (VMs running/stopped, users, avg CPU%, avg mem%, MTD cost, projected cost)
- [x] VM inventory: search by name/owner, filter by status and template, idle VM highlighting (lastActiveAt > 2h)
- [x] Fleet utilization: area chart (CPU + memory), time range picker (1h/24h/7d/30d)
- [x] Templates: list view, create form, edit form

### Stretch (build if time allows)
- [ ] Polling / simulated real-time refresh (refetchInterval on useFleet)
- [ ] Per-VM drill-down from inventory
- [ ] Dark/light mode toggle
- [ ] Keyboard accessibility polish (focus traps in modals)

---

## 9. Visual Design System

```
Background:   #0f1117  (page)
Card:         #1e2433  (surface)
Border:       #2d3a55  (subtle)
Text primary: #e2e8f0
Text muted:   #64748b
Text accent:  #94a3b8

Developer accent: #6366f1 (indigo-500) — sidebar border, buttons, active nav
Admin accent:     #22d3ee (cyan-400) — sidebar border, chart lines, active nav

Status colors:
  running:  #22c55e (green-500)
  stopped:  #475569 (slate-600)
  starting: #f59e0b (amber-400) + pulse
  stopping: #f59e0b (amber-400) + pulse
  error:    #ef4444 (red-500)

Idle VM row: amber-900/30 background tint with amber warning icon
```

---

## 10. Testing

- Unit tests (Vitest): pure functions — `lib/mock-data.ts` generators, status helpers, cost formatters
- Component tests (React Testing Library): `VMCard`, `VMStatusBadge`, `ResourceBar` — render + state variations
- Integration test (Playwright): login as alice → see machines → start a VM → verify status change; login as bob → see fleet overview → filter inventory

Tests are added for components and logic that have non-trivial branching, not for trivial wrappers.

---

## 11. Deployment

- Host: Vercel (Next.js first-class support)
- API routes deploy as Vercel serverless functions
- No environment variables needed — mock data is in-memory
- `vercel --prod` from project root

---

## 12. What Would Come Next (with more time)

- Real auth (NextAuth.js / Clerk) replacing the cookie simulation
- WebSocket or SSE for live metric streaming (currently polled at 30s intervals)
- Policies & quotas management screen
- Users & teams management
- Per-VM activity log
- Storybook component documentation
- Full E2E test suite for all flows
