'use client';
import { useTaskStore } from '@/stores/taskStore';

export function HistoryList() {
  const history = useTaskStore((s) => s.history);
  const goTo = useTaskStore((s) => s.goToSnapshot);

  if (history.snapshots.length === 0) {
    return (
      <p className="text-xs text-text-muted font-mono italic">
        Perform an action to begin your timeline.
      </p>
    );
  }

  return (
    <div className="max-h-56 overflow-y-auto chrono-scroll rounded-md border border-border-subtle bg-bg-tertiary">
      <ul className="divide-y divide-border-subtle">
        {history.snapshots.map((s, i) => {
          const active = i === history.currentIndex;
          return (
            <li key={s.id}>
              <button
                onClick={() => goTo(i)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-3 transition ${
                  active ? 'bg-primary-900/40 border-l-2 border-primary-500' : 'hover:bg-bg-elevated'
                }`}
              >
                <span className="font-mono text-text-muted w-6">{i + 1}</span>
                <span className="flex-1 truncate">{s.description}</span>
                <span className="font-mono text-text-muted text-[10px]">
                  {new Date(s.timestamp).toLocaleTimeString()}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
