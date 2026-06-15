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
npm run test:e2e  # E2E tests (Playwright, starts dev server automatically)
```

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js App Router | Route groups give clean persona separation; deploys to Vercel as-is |
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
