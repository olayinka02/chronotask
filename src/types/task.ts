export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  parentId: string | null;
  childIds: string[];
  createdAt: string;
  updatedAt: string;
  isOrphaned?: boolean;
}

export interface StateSnapshot {
  id: string;
  timestamp: string;
  tasks: Record<string, Task>;
  description: string;
}

export interface HistoryState {
  snapshots: StateSnapshot[];
  currentIndex: number;
  maxSnapshots?: number;
}

export interface TaskTreeNode extends Task {
  children: TaskTreeNode[];
  depth: number;
}
