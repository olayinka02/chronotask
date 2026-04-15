'use client';
/**
 * Task store with built-in time-travel history.
 *
 * Dependency strategy: CASCADE DELETE.
 * When a parent is deleted (or its creation undone), all descendants are
 * removed recursively. This keeps state consistent with no broken refs.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Task, TaskStatus, StateSnapshot, HistoryState, TaskTreeNode } from '@/types/task';
import { showToast } from '@/lib/toast';

const MAX_DEPTH = 5;
const HISTORY_LIMIT = 50;

interface TaskState {
  tasks: Record<string, Task>;
  history: HistoryState;

  createTask: (title: string, parentId?: string | null, description?: string) => void;
  updateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'status'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newParentId: string | null) => void;
  setStatus: (id: string, status: TaskStatus) => void;

  undo: () => void;
  redo: () => void;
  goToSnapshot: (index: number) => void;

  getRootTasks: () => Task[];
  getChildTasks: (parentId: string) => Task[];
  getTaskTree: () => TaskTreeNode[];
  getDepth: (id: string) => number;

  _saveSnapshot: (description: string, tasks: Record<string, Task>) => void;
}

const clone = <T,>(v: T): T =>
  typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));

const now = () => new Date().toISOString();

const collectDescendants = (tasks: Record<string, Task>, id: string): string[] => {
  const out: string[] = [];
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    const t = tasks[cur];
    if (!t) continue;
    for (const c of t.childIds) {
      out.push(c);
      stack.push(c);
    }
  }
  return out;
};

const getDepthIn = (tasks: Record<string, Task>, id: string): number => {
  let depth = 0;
  let cur: string | null = id;
  while (cur) {
    const t: Task | undefined = tasks[cur];
    if (!t || t.parentId === null) break;
    cur = t.parentId;
    depth++;
    if (depth > 100) break;
  }
  return depth;
};

const isDescendantOf = (tasks: Record<string, Task>, candidate: string, ancestor: string): boolean => {
  let cur: string | null = candidate;
  while (cur) {
    if (cur === ancestor) return true;
    cur = tasks[cur]?.parentId ?? null;
  }
  return false;
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
  tasks: {},
  history: { snapshots: [], currentIndex: -1, maxSnapshots: HISTORY_LIMIT },

  _saveSnapshot: (description, tasks) => {
    const { history } = get();
    const snap: StateSnapshot = {
      id: uuid(),
      timestamp: now(),
      tasks: clone(tasks),
      description,
    };
    const trimmedFuture = history.snapshots.slice(0, history.currentIndex + 1);
    trimmedFuture.push(snap);
    // enforce limit
    const overflow = trimmedFuture.length - HISTORY_LIMIT;
    const finalSnaps = overflow > 0 ? trimmedFuture.slice(overflow) : trimmedFuture;
    set({ history: { ...history, snapshots: finalSnaps, currentIndex: finalSnaps.length - 1 } });
  },

  createTask: (title, parentId = null, description) => {
    const trimmed = title.trim();
    if (!trimmed) {
      showToast.warning('Title is required');
      return;
    }
    const { tasks } = get();
    if (parentId) {
      if (!tasks[parentId]) {
        showToast.error('Parent task not found');
        return;
      }
      if (getDepthIn(tasks, parentId) + 1 >= MAX_DEPTH) {
        showToast.warning(`Maximum nesting depth (${MAX_DEPTH}) reached`);
        return;
      }
    }
    const id = uuid();
    const ts = now();
    const next = clone(tasks);
    next[id] = {
      id,
      title: trimmed,
      description,
      status: 'todo',
      parentId: parentId ?? null,
      childIds: [],
      createdAt: ts,
      updatedAt: ts,
    };
    if (parentId) next[parentId] = { ...next[parentId], childIds: [...next[parentId].childIds, id] };
    set({ tasks: next });
    get()._saveSnapshot(`Created task: ${trimmed}`, next);
    showToast.success(`Task "${trimmed}" created`);
  },

  updateTask: (id, updates) => {
    const { tasks } = get();
    const t = tasks[id];
    if (!t) return;
    const next = clone(tasks);
    next[id] = { ...t, ...updates, updatedAt: now() };
    set({ tasks: next });
    const desc = updates.status ? `Status → ${updates.status}: ${t.title}` : `Updated: ${t.title}`;
    get()._saveSnapshot(desc, next);
  },

  setStatus: (id, status) => get().updateTask(id, { status }),

  deleteTask: (id) => {
    const { tasks } = get();
    const t = tasks[id];
    if (!t) return;
    const descendants = collectDescendants(tasks, id);
    const next = clone(tasks);
    // unlink from parent
    if (t.parentId && next[t.parentId]) {
      next[t.parentId] = {
        ...next[t.parentId],
        childIds: next[t.parentId].childIds.filter((c) => c !== id),
      };
    }
    for (const d of descendants) delete next[d];
    delete next[id];
    set({ tasks: next });
    get()._saveSnapshot(`Deleted: ${t.title}`, next);
    showToast.undo(`Task "${t.title}" deleted`, () => get().undo());
  },

  moveTask: (taskId, newParentId) => {
    const { tasks } = get();
    const t = tasks[taskId];
    if (!t) return;
    if (newParentId === taskId) {
      showToast.error('Cannot parent a task to itself');
      return;
    }
    if (newParentId && isDescendantOf(tasks, newParentId, taskId)) {
      showToast.error('Circular reference blocked');
      return;
    }
    if (newParentId) {
      if (!tasks[newParentId]) {
        showToast.error('Parent task not found');
        return;
      }
      if (getDepthIn(tasks, newParentId) + 1 >= MAX_DEPTH) {
        showToast.warning(`Max depth (${MAX_DEPTH}) would be exceeded`);
        return;
      }
    }
    const next = clone(tasks);
    if (t.parentId && next[t.parentId]) {
      next[t.parentId] = {
        ...next[t.parentId],
        childIds: next[t.parentId].childIds.filter((c) => c !== taskId),
      };
    }
    if (newParentId && next[newParentId]) {
      next[newParentId] = {
        ...next[newParentId],
        childIds: [...next[newParentId].childIds, taskId],
      };
    }
    next[taskId] = { ...next[taskId], parentId: newParentId, updatedAt: now() };
    set({ tasks: next });
    get()._saveSnapshot(`Moved: ${t.title}`, next);
  },

  undo: () => {
    const { history } = get();
    if (history.currentIndex <= 0) {
      showToast.warning('Nothing to undo');
      return;
    }
    const target = history.snapshots[history.currentIndex - 1];
    const currentDesc = history.snapshots[history.currentIndex].description;
    set({
      tasks: clone(target.tasks),
      history: { ...history, currentIndex: history.currentIndex - 1 },
    });
    showToast.info(`Undid: ${currentDesc}`);
  },

  redo: () => {
    const { history } = get();
    if (history.currentIndex >= history.snapshots.length - 1) {
      showToast.warning('Nothing to redo');
      return;
    }
    const target = history.snapshots[history.currentIndex + 1];
    set({
      tasks: clone(target.tasks),
      history: { ...history, currentIndex: history.currentIndex + 1 },
    });
    showToast.info(`Redid: ${target.description}`);
  },

  goToSnapshot: (index) => {
    const { history } = get();
    if (index < 0 || index >= history.snapshots.length) return;
    const target = history.snapshots[index];
    set({
      tasks: clone(target.tasks),
      history: { ...history, currentIndex: index },
    });
  },

  getRootTasks: () => Object.values(get().tasks).filter((t) => t.parentId === null),
  getChildTasks: (parentId) => Object.values(get().tasks).filter((t) => t.parentId === parentId),
  getDepth: (id) => getDepthIn(get().tasks, id),

  getTaskTree: () => {
    const { tasks } = get();
    const build = (id: string, depth: number): TaskTreeNode => {
      const t = tasks[id];
      return { ...t, depth, children: t.childIds.map((c) => build(c, depth + 1)) };
    };
    return Object.values(tasks)
      .filter((t) => t.parentId === null)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((t) => build(t.id, 0));
  },
    }),
    {
      name: 'chronostack-store',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (undefined as never))),
      partialize: (state) => ({ tasks: state.tasks, history: state.history }),
      version: 1,
    }
  )
);
