'use client';
import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import type { Task, TaskStatus } from '@/types/task';
import { CreateTaskForm } from './CreateTaskForm';

const statusStyle: Record<TaskStatus, string> = {
  todo: 'bg-status-todo/20 text-slate-300 border-slate-400',
  'in-progress': 'bg-primary-500/20 text-primary-300 border-primary-500/50',
  done: 'bg-status-done/20 text-green-300 border-green-500/50',
};

const statusOrder: TaskStatus[] = ['todo', 'in-progress', 'done'];

export function TaskCard({ task, depth }: { task: Task; depth: number }) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const setStatus = useTaskStore((s) => s.setStatus);

  const [editing, setEditing] = useState(false);
  const [addingChild, setAddingChild] = useState(false);
  const [title, setTitle] = useState(task.title);

  const saveEdit = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) updateTask(task.id, { title: trimmed });
    else setTitle(task.title);
    setEditing(false);
  };

  const cycleStatus = () => {
    const next = statusOrder[(statusOrder.indexOf(task.status) + 1) % statusOrder.length];
    setStatus(task.id, next);
  };

  return (
    <div className="space-y-2">
      <div
        className={`group rounded-lg border px-3 py-2.5 bg-bg-elevated border-border-subtle hover:border-primary-500/60 transition flex items-center gap-3 ${
          task.isOrphaned ? 'border-amber-500/40' : ''
        }`}
      >
        <button
          onClick={cycleStatus}
          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${statusStyle[task.status]}`}
          title="Click to cycle status"
        >
          {task.status}
        </button>

        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') {
                setTitle(task.title);
                setEditing(false);
              }
            }}
            autoFocus
            className="flex-1 bg-transparent border-b border-primary-500 text-sm chrono-glow"
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-text-muted' : ''}`}
          >
            {task.title}
          </span>
        )}

        {task.childIds.length > 0 && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-tertiary text-text-muted">
            {task.childIds.length}
          </span>
        )}

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
          {depth < 4 && (
            <button
              onClick={() => setAddingChild((v) => !v)}
              className="text-xs px-2 py-1 rounded hover:bg-primary-600/30 text-text-secondary"
              title="Add subtask"
            >
              +
            </button>
          )}
          <button
            onClick={() => setEditing(true)}
            className="text-xs px-2 py-1 rounded hover:bg-bg-tertiary text-text-secondary"
            title="Edit"
          >
            ✎
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="text-xs px-2 py-1 rounded hover:bg-red-500/20 text-red-400"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {addingChild && (
        <div className="ml-6">
          <CreateTaskForm parentId={task.id} onDone={() => setAddingChild(false)} />
        </div>
      )}
    </div>
  );
}
