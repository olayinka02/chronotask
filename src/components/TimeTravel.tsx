'use client';
import { useTaskStore } from '@/stores/taskStore';
import { HistoryList } from './HistoryList';

export function TimeTravel() {
  const history = useTaskStore((s) => s.history);
  const undo = useTaskStore((s) => s.undo);
  const redo = useTaskStore((s) => s.redo);
  const goTo = useTaskStore((s) => s.goToSnapshot);

  const total = history.snapshots.length;
  const canUndo = history.currentIndex > 0;
  const canRedo = history.currentIndex < total - 1;

  return (
    <section className="bg-bg-secondary border border-border-subtle rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Time Travel</h2>
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-1.5 text-sm rounded-md bg-bg-elevated border border-border-subtle hover:border-primary-500 disabled:opacity-40 disabled:cursor-not-allowed chrono-glow transition"
          >
            ← Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-1.5 text-sm rounded-md bg-bg-elevated border border-border-subtle hover:border-primary-500 disabled:opacity-40 disabled:cursor-not-allowed chrono-glow transition"
          >
            Redo →
          </button>
        </div>
      </div>

      <div>
        <input
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          value={Math.max(0, history.currentIndex)}
          onChange={(e) => goTo(Number(e.target.value))}
          disabled={total === 0}
          className="w-full accent-primary-500"
        />
        <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1">
          <span>start</span>
          <span>
            {total === 0 ? 'no history yet' : `${history.currentIndex + 1} / ${total}`}
          </span>
          <span>now</span>
        </div>
      </div>

      <HistoryList />
    </section>
  );
}
