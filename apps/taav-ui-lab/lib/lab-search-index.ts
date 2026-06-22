import {
  LAB_BUSINESS_NAV,
  LAB_COMPONENT_NAV,
  LAB_DATA_DISPLAY_NAV,
  LAB_FORM_NAV,
  LAB_FOUNDATION_NAV,
  LAB_LAYOUT_NAV,
  LAB_MAIN_NAV,
  LAB_NAVIGATION_NAV,
  LAB_OVERLAY_NAV,
  type LabNavItem,
} from './navigation';

export type LabSearchEntry = LabNavItem & {
  section: string;
  searchText: string;
};

function normalizeLabSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[يی]/g, 'ی')
    .replace(/[كک]/g, 'ک')
    .trim();
}

function toSearchEntry(section: string, item: LabNavItem): LabSearchEntry {
  const searchText = normalizeLabSearch(
    [item.label, item.badge, item.description, item.href, ...(item.keywords ?? [])].filter(Boolean).join(' '),
  );

  return {
    ...item,
    section,
    searchText,
  };
}

const LAB_SEARCH_SECTIONS: Array<{ section: string; items: LabNavItem[] }> = [
  { section: 'Foundation', items: LAB_FOUNDATION_NAV },
  { section: 'Business', items: LAB_BUSINESS_NAV },
  { section: 'Forms', items: LAB_FORM_NAV },
  { section: 'Overlays', items: LAB_OVERLAY_NAV },
  { section: 'Navigation', items: LAB_NAVIGATION_NAV },
  { section: 'Data Display', items: LAB_DATA_DISPLAY_NAV },
  { section: 'Layout', items: LAB_LAYOUT_NAV },
  { section: 'Primitives', items: LAB_COMPONENT_NAV },
  { section: 'اصلی', items: LAB_MAIN_NAV },
];

export const LAB_SEARCH_INDEX: LabSearchEntry[] = LAB_SEARCH_SECTIONS.flatMap(({ section, items }) =>
  items.map((item) => toSearchEntry(section, item)),
);

export function filterLabSearchIndex(query: string, limit = 12) {
  const normalizedQuery = normalizeLabSearch(query);
  if (!normalizedQuery) return [];

  return LAB_SEARCH_INDEX.filter((entry) => entry.searchText.includes(normalizedQuery)).slice(0, limit);
}
