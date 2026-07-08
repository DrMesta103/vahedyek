import type {
  TestKnowledgeBaseCategory,
  TestKnowledgeBaseDocument,
  TestKnowledgeBaseSubTab,
  TestKnowledgeBaseTab,
} from '@/app/lib/types/taavia-test-workspace';

export function createTestKbId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeSubTab(sub: TestKnowledgeBaseSubTab, fallback: string): TestKnowledgeBaseSubTab {
  return {
    ...sub,
    sources: Array.isArray(sub.sources) ? sub.sources : [],
    updatedAt: sub.updatedAt ?? fallback,
  };
}

function normalizeTab(tab: TestKnowledgeBaseTab, fallback: string): TestKnowledgeBaseTab {
  return {
    ...tab,
    sources: Array.isArray(tab.sources) ? tab.sources : [],
    updatedAt: tab.updatedAt ?? fallback,
    subTabs: tab.subTabs.map((sub) => normalizeSubTab(sub, fallback)),
  };
}

function sectionToSubTabs(
  sections: TestKnowledgeBaseCategory['sections'],
  fallback: string,
): { subTabs: TestKnowledgeBaseSubTab[]; fallbackBody: string; fallbackAttachments: TestKnowledgeBaseSubTab['attachments'] } {
  const subTabs: TestKnowledgeBaseSubTab[] = [];
  let fallbackBody = '';
  let fallbackAttachments: TestKnowledgeBaseSubTab['attachments'] = [];

  for (const section of sections) {
    if (section.subsections && section.subsections.length > 0) {
      if (section.body.trim()) {
        subTabs.push({
          id: section.id,
          title: section.title,
          body: section.body,
          attachments: section.attachments,
          sources: [],
          updatedAt: fallback,
        });
      }
      for (const sub of section.subsections) {
        subTabs.push({
          id: sub.id,
          title: sub.title,
          body: sub.body,
          attachments: sub.attachments,
          sources: [],
          updatedAt: fallback,
        });
      }
      continue;
    }

    if (subTabs.length === 0 && !fallbackBody) {
      fallbackBody = section.body;
      fallbackAttachments = section.attachments;
    }

    subTabs.push({
      id: section.id,
      title: section.title,
      body: section.body,
      attachments: section.attachments,
      sources: [],
      updatedAt: fallback,
    });
  }

  return { subTabs, fallbackBody, fallbackAttachments };
}

function categoryToTab(category: TestKnowledgeBaseCategory, fallback: string): TestKnowledgeBaseTab {
  const { subTabs, fallbackBody, fallbackAttachments } = sectionToSubTabs(category.sections, fallback);

  return {
    id: category.id,
    title: category.subtitle ?? category.title,
    body: subTabs.length > 0 ? '' : fallbackBody,
    attachments: subTabs.length > 0 ? [] : fallbackAttachments,
    sources: [],
    subTabs,
    updatedAt: fallback,
  };
}

export function migrateTestKnowledgeBaseDocument(raw: unknown): TestKnowledgeBaseDocument | null {
  if (!raw || typeof raw !== 'object') return null;

  const doc = raw as Record<string, unknown>;
  const fallback = String(doc.builtAt ?? new Date().toISOString());

  if (Array.isArray(doc.tabs)) {
    const tabs = (doc.tabs as TestKnowledgeBaseTab[]).map((tab) => normalizeTab(tab, fallback));
    return {
      title: String(doc.title ?? ''),
      brandName: String(doc.brandName ?? ''),
      builtAt: fallback,
      lastSavedAt: doc.lastSavedAt ? String(doc.lastSavedAt) : null,
      tabs,
    };
  }

  if (Array.isArray(doc.categories)) {
    const categories = doc.categories as TestKnowledgeBaseCategory[];
    return {
      title: String(doc.title ?? ''),
      brandName: String(doc.brandName ?? ''),
      builtAt: fallback,
      lastSavedAt: doc.lastSavedAt ? String(doc.lastSavedAt) : null,
      tabs: categories.map((category) => categoryToTab(category, fallback)),
    };
  }

  return null;
}

export function createEmptyKnowledgeBaseTab(title = 'تب جدید'): TestKnowledgeBaseTab {
  const updatedAt = new Date().toISOString();
  return {
    id: createTestKbId('tab'),
    title,
    body: '',
    attachments: [],
    sources: [],
    subTabs: [],
    updatedAt,
  };
}

export function createEmptyKnowledgeBaseSubTab(title = 'زیرتب جدید'): TestKnowledgeBaseSubTab {
  return {
    id: createTestKbId('subtab'),
    title,
    body: '',
    attachments: [],
    sources: [],
    updatedAt: new Date().toISOString(),
  };
}
