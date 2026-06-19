import { cva } from 'class-variance-authority';

export const businessSidebarRoot = cva(
  [
    'flex h-full min-h-0 shrink-0 flex-col overflow-hidden backdrop-blur-[18px]',
    'transition-[width] duration-[var(--taav-duration-slow)] ease-[var(--taav-ease-standard)]',
  ],
  {
    variants: {
      variant: {
        dastranj: ['bg-[var(--taav-business-sidebar-bg)]', 'text-[var(--taav-business-sidebar-text)]'],
        default: ['bg-[var(--taav-surface-elevated)]', 'text-[var(--taav-text-body)]'],
      },
      placement: {
        right: [
          'border-l',
          'rounded-[0_var(--taav-business-sidebar-radius)_var(--taav-business-sidebar-radius)_0]',
          'shadow-[var(--taav-business-sidebar-shadow-right)]',
        ],
        left: [
          'border-r',
          'rounded-[var(--taav-business-sidebar-radius)_0_0_var(--taav-business-sidebar-radius)]',
          'shadow-[var(--taav-business-sidebar-shadow-left)]',
        ],
      },
      width: {
        compact: 'w-[var(--taav-business-sidebar-width-compact)]',
        default: 'w-[var(--taav-business-sidebar-width-default)]',
        wide: 'w-[var(--taav-business-sidebar-width-wide)]',
      },
      collapsed: {
        true: 'w-[var(--taav-business-sidebar-width-collapsed)]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'dastranj',
      placement: 'right',
      width: 'default',
      collapsed: false,
    },
    compoundVariants: [
      {
        variant: 'dastranj',
        class: 'border-[color:var(--taav-business-sidebar-border)]',
      },
      {
        variant: 'default',
        class: 'border-[color:var(--taav-border)]',
      },
    ],
  },
);

/** Scrollable nav region — only the menu list scrolls; header/footer stay fixed. */
export const businessSidebarNavScroll = (collapsed?: boolean) =>
  [
    'taav-scrollarea taav-scrollarea--minimal taav-sidebar-scrollarea',
    'min-h-0 flex-1 shrink basis-0',
    collapsed ? 'pt-1' : 'pt-2',
  ].join(' ');

export const businessSidebarProfileRow = cva(
  'flex shrink-0 items-center border-b border-[color:var(--taav-business-sidebar-section-border)] px-[var(--taav-business-sidebar-section-px)] py-[var(--taav-business-sidebar-profile-py)] transition-[padding] duration-[var(--taav-duration-slow)]',
  {
    variants: {
      collapsed: {
        true: 'justify-center px-2 py-2',
        false: '',
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  },
);

export const businessSidebarMenuItem = cva(
  [
    'relative flex w-full items-center gap-[7px] border-0 bg-transparent text-right',
    'text-[length:var(--taav-business-sidebar-menu-text)] transition-[background,color] duration-200',
    'px-3 py-[7px] my-0.5 no-underline',
    'text-[var(--taav-business-sidebar-text-muted)]',
    'hover:bg-[var(--taav-business-sidebar-item-hover-bg)]',
    'hover:text-[var(--taav-business-sidebar-text)]',
    'focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]',
  ],
  {
    variants: {
      placement: {
        right: '',
        left: '',
      },
      active: {
        true: 'font-bold text-[var(--taav-business-sidebar-text)]',
        false: '',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50 pointer-events-none',
        false: 'cursor-pointer',
      },
      collapsed: {
        true: [
          'mx-2 justify-center rounded-[14px] px-2',
          'min-h-[var(--taav-business-sidebar-collapsed-item-height)]',
          'py-[var(--taav-business-sidebar-collapsed-item-py)]',
          '[&_svg]:h-[var(--taav-business-sidebar-collapsed-icon-size)]',
          '[&_svg]:w-[var(--taav-business-sidebar-collapsed-icon-size)]',
        ],
        false: '',
      },
    },
    defaultVariants: {
      placement: 'right',
      active: false,
      disabled: false,
      collapsed: false,
    },
    compoundVariants: [
      {
        placement: 'right',
        active: true,
        collapsed: false,
        class: [
          'rounded-[var(--taav-business-sidebar-active-radius-right)]',
          'bg-[var(--taav-business-sidebar-active-bg)]',
        ],
      },
      {
        placement: 'left',
        active: true,
        collapsed: false,
        class: [
          'rounded-[var(--taav-business-sidebar-active-radius-left)]',
          'bg-[var(--taav-business-sidebar-active-bg)]',
        ],
      },
      {
        active: true,
        collapsed: true,
        class: [
          'rounded-[14px]',
          'bg-[var(--taav-business-sidebar-collapsed-active-bg)]',
          'text-[var(--taav-business-sidebar-icon-active)]',
          'shadow-[inset_0_0_0_1px_var(--taav-business-sidebar-collapsed-active-border)]',
        ],
      },
    ],
  },
);

export const businessSidebarQuickAction = cva(
  'relative inline-flex items-center justify-center border-0 bg-transparent p-0 text-[var(--taav-business-sidebar-icon)] transition-colors focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]',
  {
    variants: {
      active: {
        true: 'text-[var(--taav-business-sidebar-icon-active)]',
        false: '',
      },
      collapsed: {
        true: 'h-[var(--taav-business-sidebar-collapsed-action-size)] w-[var(--taav-business-sidebar-collapsed-action-size)] [&_svg]:h-[var(--taav-business-sidebar-collapsed-icon-size)] [&_svg]:w-[var(--taav-business-sidebar-collapsed-icon-size)]',
        false: 'h-8 w-8 [&_svg]:h-[15px] [&_svg]:w-[15px]',
      },
    },
    defaultVariants: {
      active: false,
      collapsed: false,
    },
  },
);

export const businessSidebarCollapsedToolbar = cva(
  'flex shrink-0 flex-col items-center gap-1 bg-[var(--taav-business-sidebar-toolbar-bg)] px-1 py-1.5',
);

export const businessSidebarCollapsedTenantStrip = cva(
  'flex shrink-0 items-center justify-center px-2 py-3',
);

/** Full app shell: content column + sidebar rail, top-aligned via shared shell padding. */
export const businessSidebarShell = cva(
  'flex h-full min-h-0 w-full flex-row',
  {
    variants: {
      placement: {
        right: 'py-[var(--taav-business-sidebar-shell-py)] pr-[var(--taav-business-sidebar-shell-pr)] pl-0',
        left: 'py-[var(--taav-business-sidebar-shell-py)] pl-[var(--taav-business-sidebar-shell-pr)] pr-0',
      },
    },
    defaultVariants: {
      placement: 'right',
    },
  },
);

export const businessSidebarContentColumn = cva(
  'relative flex min-w-0 flex-1 flex-col overflow-hidden',
);

export const businessSidebarContentBody = cva('relative min-h-0 flex-1 overflow-hidden');

export const businessSidebarRailWrap = cva('flex h-full shrink-0 self-stretch');

export const businessSidebarNavPathRoot = cva(
  [
    'flex w-full shrink-0 items-center justify-start',
    'min-h-[var(--taav-business-nav-path-height)]',
    'border-b border-[color:var(--taav-business-nav-path-border)]',
    'bg-[var(--taav-business-nav-path-bg)]',
    'px-[var(--taav-business-nav-path-px)] py-[var(--taav-business-nav-path-py)]',
  ].join(' '),
);

export const businessSidebarNavPathList = cva(
  'm-0 flex min-w-0 list-none flex-wrap items-center justify-start gap-[var(--taav-business-nav-path-gap)] p-0',
);

export const businessSidebarNavPathLink = cva(
  [
    'inline-flex min-w-0 items-center border-0 bg-transparent p-0 no-underline',
    'text-[length:var(--taav-business-nav-path-text-size)] leading-tight',
    'text-[var(--taav-business-nav-path-text)]',
    'transition-colors hover:text-[var(--taav-business-nav-path-text-hover)]',
    'focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]',
  ].join(' '),
);

export const businessSidebarNavPathCurrent = cva(
  [
    'inline-flex min-w-0 items-center truncate',
    'text-[length:var(--taav-business-nav-path-text-size)] font-bold leading-tight',
    'text-[var(--taav-business-nav-path-text-current)]',
  ].join(' '),
);

export const businessSidebarNavPathSeparator = cva(
  'inline-flex shrink-0 text-[var(--taav-business-nav-path-separator)] [&_svg]:h-3 [&_svg]:w-3',
);
