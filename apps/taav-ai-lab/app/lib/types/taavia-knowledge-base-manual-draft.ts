export type CategoryEditResource = {
  snapshotId: string;
  title: string;
  sourceTypeLabel: string;
  snapshotDate: string;
  versionLabel: string;
};

export type CategoryEditNode = {
  id: string;
  parentId: string | null;
  title: string;
  content: string;
  order: number;
  level: 1 | 2;
  unlocked: boolean;
  /** Pending local change not yet sent to AI */
  isEdited: boolean;
  /** After send-to-AI: this node differs from pure AI-generated build content */
  isManualVsAi: boolean;
  isPendingDeletion: boolean;
  sourceCount: number;
  resources: CategoryEditResource[];
  baseline: {
    parentId: string | null;
    title: string;
    content: string;
    order: number;
  } | null;
};

export type CategoryEditToast = {
  id: string;
  tone: 'success' | 'info' | 'warning' | 'danger';
  message: string;
};
