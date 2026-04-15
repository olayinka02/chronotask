'use client';
import { useState } from 'react';
import type { TaskTreeNode } from '@/types/task';
import { TaskCard } from './TaskCard';

export function TaskNode({ node }: { node: TaskTreeNode }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div className="flex items-start gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          disabled={!hasChildren}
          className={`mt-2 w-5 h-5 grid place-items-center rounded text-xs font-mono ${
            hasChildren ? 'text-primary-400 hover:bg-bg-elevated' : 'text-transparent'
          }`}
          aria-label={expanded ? 'collapse' : 'expand'}
        >
          {expanded ? '▼' : '▶'}
        </button>
        <div className="flex-1">
          <TaskCard task={node} depth={node.depth} />
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-6 mt-2 space-y-2 border-l border-border-subtle pl-4">
          {node.children.map((c) => (
            <TaskNode key={c.id} node={c} />
          ))}
        </div>
      )}
    </div>
  );
}
