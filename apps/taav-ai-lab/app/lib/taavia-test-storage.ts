import type { TestWorkspaceSnapshot } from '@/app/lib/types/taavia-test-workspace';
import { migrateTestKnowledgeBaseDocument } from '@/app/lib/taavia-test-knowledge-migrate';

const STORAGE_PREFIX = 'taavia-test-workspace';

export function getTestWorkspaceStorageKey(brandId: string) {
  return `${STORAGE_PREFIX}:${brandId}`;
}

export function loadTestWorkspaceSnapshot(brandId: string): TestWorkspaceSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(getTestWorkspaceStorageKey(brandId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TestWorkspaceSnapshot;
    return {
      ...parsed,
      knowledgeBaseDocument: migrateTestKnowledgeBaseDocument(parsed.knowledgeBaseDocument),
    };
  } catch {
    return null;
  }
}

export function saveTestWorkspaceSnapshot(brandId: string, snapshot: TestWorkspaceSnapshot) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(getTestWorkspaceStorageKey(brandId), JSON.stringify(snapshot));
  } catch {
    // ignore quota errors
  }
}
