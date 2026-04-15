'use client';
import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import type { Task, TaskStatus } from '@/types/task';
import { CreateTaskForm } from './CreateTaskForm';

const statusStyle: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',

'in-progress': 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/50',

done: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/50',
};

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

  return (
    <div className="space-y-2">
      <div
        className={`group rounded-lg border px-3 py-2.5 bg-bg-elevated border-border-subtle hover:border-primary-500/60 transition flex flex-wrap items-center gap-x-3 gap-y-2 ${
          task.isOrphaned ? 'border-amber-500/40' : ''
        }`}
      >
        <select
          value={task.status}
          onChange={(e) => setStatus(task.id, e.target.value as TaskStatus)}
          style={{ width: `${task.status.length + 4}ch` }}
          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border cursor-pointer chrono-glow appearance-none ${statusStyle[task.status]}`}
          title="Change status"
        >
          <option value="todo">todo</option>
          <option value="in-progress">in-progress</option>
          <option value="done">done</option>
        </select>

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
            className="flex-1 min-w-0 bg-transparent border-b border-primary-500 text-sm chrono-glow"
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            className={`flex-1 min-w-0 text-sm break-words ${task.status === 'done' ? 'line-through text-text-muted' : ''}`}
          >
            {task.title}
          </span>
        )}

        {task.childIds.length > 0 && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-tertiary text-text-muted">
            {task.childIds.length}
          </span>
        )}

        <div className="flex gap-1 basis-full justify-end sm:basis-auto sm:ml-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
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
            className="text-xs px-2 py-1 rounded hover:bg-green-500/20 text-green-400"
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
        <div className="ml-3 sm:ml-6">
          <CreateTaskForm parentId={task.id} onDone={() => setAddingChild(false)} />
        </div>
      )}
    </div>
  );
}
