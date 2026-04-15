'use client';
import { useTaskStore } from '@/stores/taskStore';
import { TaskNode } from './TaskNode';

export function TaskTree() {
  const tree = useTaskStore((s) => s.getTaskTree());
  const orphaned = tree.filter((t) => t.isOrphaned);
  const normal = tree.filter((t) => !t.isOrphaned);

  if (tree.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted font-mono text-sm border border-dashed border-border-subtle rounded-lg">
        No tasks yet. Create one above to start your timeline.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {normal.map((n) => (
        <TaskNode key={n.id} node={n} />
      ))}
      {orphaned.length > 0 && (
        <div className="mt-6 pt-4 border-t border-amber-500/30">
          <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-2">
            Orphaned
          </h3>
          <div className="space-y-2">
            {orphaned.map((n) => (
              <TaskNode key={n.id} node={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
