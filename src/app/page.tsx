'use client';
import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { TaskBoard } from '@/components/TaskBoard';
import { TimeTravel } from '@/components/TimeTravel';
import { useTaskStore } from '@/stores/taskStore';

export default function HomePage() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useTaskStore.getState().undo();
      } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        useTaskStore.getState().redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main>
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <TaskBoard />
        <TimeTravel />
      </div>
      <footer className="max-w-6xl mx-auto px-6 pb-10 text-center text-xs text-text-muted font-mono">
        ChronoStack · cascade-delete strategy · ⌘Z / ⌘⇧Z to undo/redo
      </footer>
    </main>
  );
}
