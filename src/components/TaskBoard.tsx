'use client';
import { CreateTaskForm } from './CreateTaskForm';
import { TaskTree } from './TaskTree';
import { useRealtimeTasks } from '@/hooks/useRealtimeTasks';

export function TaskBoard() {
  useRealtimeTasks();
  return (
    <section className="bg-bg-secondary border border-border-subtle rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Tasks</h2>
      </div>
      <CreateTaskForm />
      <TaskTree />
    </section>
  );
}
