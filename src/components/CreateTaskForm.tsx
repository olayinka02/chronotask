'use client';
import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';

export function CreateTaskForm({ parentId = null, onDone }: { parentId?: string | null; onDone?: () => void }) {
  const createTask = useTaskStore((s) => s.createTask);
  const [title, setTitle] = useState('');

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    createTask(trimmed, parentId);
    setTitle('');
    onDone?.();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd();
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        }}
        placeholder={parentId ? 'New subtask title…' : 'New task title…'}
        className="flex-1 px-3 py-2 bg-bg-tertiary border border-border-subtle rounded-md text-sm chrono-glow"
        autoFocus={!!parentId}
      />
      <button
        type="button"
        onClick={handleAdd}
        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-md transition shadow-glow cursor-pointer"
      >
        Add
      </button>
      {onDone && (
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-2 text-sm text-text-muted hover:text-text-primary"
        >
          Cancel
        </button>
      )}
    </form>
  );
}
