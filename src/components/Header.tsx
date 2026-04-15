'use client';
import { useTaskStore } from '@/stores/taskStore';

export function Header() {
  const count = useTaskStore((s) => Object.keys(s.tasks).length);
  const history = useTaskStore((s) => s.history);
  return (
    <header className="border-b border-border-subtle bg-bg-secondary/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow grid place-items-center font-mono text-sm font-bold">
            CS
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">ChronoStack</h1>
            <p className="text-xs text-text-muted font-mono">time-travel task manager</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-secondary font-mono">
          <span>{count} tasks</span>
          <span className="text-text-muted">·</span>
          <span>
            snapshot {history.currentIndex + 1}/{history.snapshots.length}
          </span>
        </div>
      </div>
    </header>
  );
}
