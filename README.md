# ChronoStack

A full-stack collaborative task manager with real-time **time-travel** state. Every mutation captures a snapshot, so you can undo, redo, or drag a slider back to any point in the session's history — complete with human-readable action descriptions.

Built with **Next.js (App Router)**, **Zustand**, **Tailwind CSS**, **Supabase** (optional realtime sync), and **React Toastify**.

---

## Features

- **Hierarchical tasks** — parent/child relationships up to 5 levels deep, with circular-reference protection.
- **Time-travel history** — undo / redo / history slider / clickable snapshot list (max 50 snapshots).
- **Cascade-delete strategy** — when a parent is deleted or its creation is undone, all descendants are removed consistently (documented in `src/stores/taskStore.ts`).
- **Toast notifications** with inline **Undo** action on delete.
- **Keyboard shortcuts** — `⌘Z` / `Ctrl+Z` to undo, `⌘⇧Z` / `Ctrl+Y` to redo.
- **Theme toggle** (bottom-left) — dark / light, defaults to system preference then falls back to light.
- **Responsive** — works on mobile, tablet, desktop.
- **Supabase-optional** — runs entirely in-memory by default; wire env vars to enable persistence + realtime sync across tabs/clients.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| State | Zustand (custom history middleware) |
| Styling | Tailwind CSS |
| Notifications | React Toastify |
| Backend | Next.js Route Handlers |
| Database / Realtime | Supabase (PostgreSQL + Realtime) |

---

## Quick start

```bash
# 1. install
npm install

# 2. run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app works out of the box with a local in-memory store — no database required.

---

## Optional: enable Supabase

ChronoStack runs locally without Supabase. To persist tasks and sync in realtime across clients:

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.local.example` → `.env.local` and fill in the three keys (from Project Settings → API):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. Open Supabase SQL Editor and run the schema in `src/lib/schema.sql` (creates `tasks` + `history_snapshots` tables, triggers, and RLS policies).
4. In **Table Editor → Realtime**, toggle realtime **on** for the `tasks` table.
5. Restart the dev server. The app will load existing tasks on mount and subscribe to live changes.

When Supabase is not configured, API routes return `501` and the realtime hook is a no-op — the UI continues to work locally.

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── tasks/route.ts          GET (list) / POST (create)
│   │   ├── tasks/[id]/route.ts     GET / PATCH / DELETE
│   │   ├── history/route.ts        GET / POST snapshots
│   │   └── history/restore/route.ts POST — load a snapshot
│   ├── layout.tsx                  Root layout + ThemeToggle
│   ├── page.tsx                    Main UI + keyboard shortcuts
│   ├── providers.tsx               ToastContainer
│   └── globals.css                 Tailwind + light-mode overrides
├── components/
│   ├── Header.tsx
│   ├── TaskBoard.tsx               Tasks section
│   ├── CreateTaskForm.tsx
│   ├── TaskTree.tsx                Renders tree + orphaned section
│   ├── TaskNode.tsx                Recursive node w/ expand/collapse
│   ├── TaskCard.tsx                Card with inline edit, status, actions
│   ├── TimeTravel.tsx              Undo / Redo / slider / list
│   ├── HistoryList.tsx
│   └── ThemeToggle.tsx             Fixed bottom-left
├── hooks/
│   └── useRealtimeTasks.ts         Supabase realtime subscription (merge)
├── lib/
│   ├── supabase.ts                 Client + server factories
│   ├── toast.tsx                   showToast helpers
│   └── schema.sql                  Run this in Supabase SQL Editor
├── stores/
│   └── taskStore.ts                Zustand store + time-travel logic
└── types/
    └── task.ts                     Task, StateSnapshot, HistoryState
```

---

## How the time-travel works

Every mutating action (`createTask`, `updateTask`, `deleteTask`, `moveTask`) calls `_saveSnapshot(description, tasks)` in the Zustand store. The snapshot captures a deep-cloned copy of the full `tasks` map plus a human-readable description.

- **Undo** / **Redo** move `currentIndex` in `history.snapshots` and restore the tasks from that snapshot.
- **Slider / History list** call `goToSnapshot(index)` to jump directly.
- When you mutate from a past point in history, everything after that index is discarded (standard branching undo behavior).
- History is capped at **50** entries; the oldest snapshots are dropped when that's exceeded.

### Dependency strategy: Cascade Delete

Chosen for predictability. When a parent task is deleted — or its creation is undone — all descendants are removed recursively. State integrity is guaranteed: no dangling `parentId` refs, no orphans.

---

## Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # run the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

---

## Keyboard shortcuts

| Action | Mac | Win/Linux |
|---|---|---|
| Undo | `⌘Z` | `Ctrl+Z` |
| Redo | `⌘⇧Z` | `Ctrl+Y` |
| Submit new task | `Enter` | `Enter` |
| Edit task title | double-click the title | double-click |
| Cancel edit | `Esc` | `Esc` |
| Cycle task status | click the status chip | click |

---

## Design notes

- **Theme** — modern tech blue with dark mode default. Light mode overrides live in `globals.css` as `html.light` selectors so existing Tailwind utility classes keep working.
- **Responsive** — task cards wrap controls on narrow viewports; action buttons are always visible on touch devices (hover-revealed on desktop).
- **Accessibility** — focus rings via the `chrono-glow` class; semantic buttons; titles/aria labels on interactive icons.

---

## Extending

Likely next steps (see the spec in the original prompt for details):

- Supabase Auth for multi-user access
- Persist the history timeline per user session in `history_snapshots`
- Drag-and-drop reparenting
- Full-text search across tasks
- Branch/fork history from any snapshot
- Export / import state as JSON
