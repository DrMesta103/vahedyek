export type RoadmapStatus = 'done' | 'in_progress' | 'planned';

export type RoadmapStage = {
  id: string;
  title: string;
  titleFa: string;
  status: RoadmapStatus;
  description: string;
  items: string[];
};

export const ROADMAP_STAGES: RoadmapStage[] = [
  {
    id: 'foundation',
    title: 'Foundation',
    titleFa: 'پایه',
    status: 'done',
    description: 'ساختار monorepo، UI Lab، consumption contract',
    items: ['packages/ui TaavUI structure', 'TaavUI Lab', '@repo/ui/taav entry', 'taav-tokens.css export'],
  },
  {
    id: 'tokens',
    title: 'Tokens',
    titleFa: 'توکن‌ها',
    status: 'in_progress',
    description: 'سیستم توکن primitive، semantic و component',
    items: ['رنگ معنایی', 'تایپوگرافی', 'spacing/radius/shadow', 'component sizing'],
  },
  {
    id: 'primitives',
    title: 'Primitives',
    titleFa: 'پایه‌ها',
    status: 'in_progress',
    description: 'پالایش API و بصری primitives موجود',
    items: ['TaavButton', 'TaavBadge', 'TaavCard', 'TaavTooltip', 'TaavFieldHint'],
  },
  {
    id: 'forms',
    title: 'Forms',
    titleFa: 'فرم‌ها',
    status: 'in_progress',
    description: 'Text fields، form controls و field composition',
    items: [
      'TaavInput / TaavTextarea / TaavSelect',
      'TaavCheckbox / TaavRadio / TaavSwitch',
      'TaavSegmentedControl / TaavOptionCard',
      'TaavFormField composition',
    ],
  },
  {
    id: 'overlays',
    title: 'Overlays',
    titleFa: 'اورلی',
    status: 'in_progress',
    description: 'Dialog، Drawer، Popover، Dropdown',
    items: ['TaavDialog', 'TaavDrawer', 'TaavPopover', 'TaavDropdown'],
  },
  {
    id: 'navigation',
    title: 'Navigation',
    titleFa: 'ناوبری',
    status: 'in_progress',
    description: 'Tabs و Stepper برای صفحات و wizardها',
    items: ['TaavTabs', 'TaavStepper'],
  },
  {
    id: 'data-display',
    title: 'Data Display',
    titleFa: 'نمایش داده',
    status: 'in_progress',
    description: 'Chip system، status، empty/loading، pagination، table shell',
    items: ['TaavChip / TaavStatusBadge', 'TaavEmptyState / TaavSkeleton', 'TaavFilterBar / TaavTableShell', 'TaavPagination / TaavKeyValue'],
  },
  {
    id: 'layout',
    title: 'Layout Patterns',
    titleFa: 'الگوهای چیدمان',
    status: 'in_progress',
    description: 'Page shell، headers، sections، settings، detail، sticky actions، sidebar، stats',
    items: [
      'TaavPageShell / TaavPageHeader',
      'TaavSection / TaavSettingsSection',
      'TaavDetailHeader / TaavStickyActionBar',
      'TaavSidebarPanel / TaavStatsCard / TaavProgressSummary',
    ],
  },
  {
    id: 'business',
    title: 'Business Components',
    titleFa: 'کسب‌وکار',
    status: 'planned',
    description: 'اجزای تخصصی DastRanj و VahedYek',
    items: ['Contract tags', 'Rule panels', 'Domain-specific widgets'],
  },
  {
    id: 'migration',
    title: 'Migration Pilot',
    titleFa: 'مهاجرت آزمایشی',
    status: 'planned',
    description: 'مهاجرت محدود صفحات انتخاب‌شده',
    items: ['یک صفحه VahedYek', 'یک صفحه DastRanj', 'بازخورد تیم'],
  },
  {
    id: 'enforcement',
    title: 'Enforcement',
    titleFa: 'اجرای استاندارد',
    status: 'planned',
    description: 'جلوگیری از UI تکراری و انحراف بصری',
    items: ['Lint/review checklist', 'Deprecation plan', 'Coverage tracking'],
  },
];

export const ROADMAP_STATUS_LABEL: Record<RoadmapStatus, string> = {
  done: 'انجام شده',
  in_progress: 'در حال انجام',
  planned: 'برنامه‌ریزی‌شده',
};
