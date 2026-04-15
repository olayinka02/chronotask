'use client';
import { useEffect } from 'react';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/types/task';

type Row = {
  id: string;
  title: string;
  description: string | null;
  status: Task['status'];
  parent_id: string | null;
  is_orphaned: boolean | null;
  created_at: string;
  updated_at: string;
};

const rowToTask = (r: Row, allRows: Row[]): Task => ({
  id: r.id,
  title: r.title,
  description: r.description ?? undefined,
  status: r.status,
  parentId: r.parent_id,
  childIds: allRows.filter((x) => x.parent_id === r.id).map((x) => x.id),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  isOrphaned: r.is_orphaned ?? false,
});

export function useRealtimeTasks() {
  useEffect(() => {
    if (!supabaseEnabled || !supabase) return;
    const client = supabase;

    const load = async () => {
      const { data, error } = await client.from('tasks').select('*').order('created_at');
      if (error || !data || data.length === 0) return;
      const rows = data as Row[];
      const existing = useTaskStore.getState().tasks;
      const merged: Record<string, Task> = { ...existing };
      for (const r of rows) merged[r.id] = rowToTask(r, rows);
      useTaskStore.setState({ tasks: merged });
    };
    load();

    const channel = client
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, load)
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);
}
