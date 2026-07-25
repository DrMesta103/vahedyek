import type { TestWorkspaceSnapshot } from "@/app/lib/types/taavia-test-workspace";
import { migrateTestKnowledgeBaseDocument } from "@/app/lib/taavia-test-knowledge-migrate";

const STORAGE_PREFIX = "taavia-test-workspace";

export function getTestWorkspaceStorageKey(businessId: string, brandId: string) {
  return `${STORAGE_PREFIX}:${businessId}:${brandId}`;
}

export function loadTestWorkspaceSnapshot(businessId: string, brandId: string): TestWorkspaceSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(getTestWorkspaceStorageKey(businessId, brandId));
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

export function saveTestWorkspaceSnapshot(businessId: string, brandId: string, snapshot: TestWorkspaceSnapshot) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(getTestWorkspaceStorageKey(businessId, brandId), JSON.stringify(snapshot));
  } catch {
    // ignore quota errors
  }
}
