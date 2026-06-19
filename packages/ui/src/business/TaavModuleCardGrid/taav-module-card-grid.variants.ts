import { cva } from 'class-variance-authority';

export const moduleCardGridRoot = cva('grid w-full', {
  variants: {
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
    },
    gap: {
      sm: 'gap-[var(--taav-module-card-grid-gap-sm)]',
      md: 'gap-[var(--taav-module-card-grid-gap-md)]',
      lg: 'gap-[var(--taav-module-card-grid-gap-lg)]',
      xl: 'gap-[var(--taav-module-card-grid-gap-xl)]',
    },
    density: {
      compact: '[--taav-module-card-grid-gap-sm:var(--taav-space-3)] [--taav-module-card-grid-gap-md:var(--taav-space-3)] [--taav-module-card-grid-gap-lg:var(--taav-space-4)] [--taav-module-card-grid-gap-xl:var(--taav-space-5)]',
      comfortable: '',
      spacious: '[--taav-module-card-grid-gap-sm:var(--taav-space-4)] [--taav-module-card-grid-gap-md:var(--taav-space-5)] [--taav-module-card-grid-gap-lg:var(--taav-space-6)] [--taav-module-card-grid-gap-xl:var(--taav-space-8)]',
    },
    responsive: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      columns: 2,
      responsive: false,
      className: 'grid-cols-2',
    },
    {
      columns: 3,
      responsive: false,
      className: 'grid-cols-3',
    },
    {
      columns: 4,
      responsive: false,
      className: 'grid-cols-4',
    },
  ],
  defaultVariants: {
    columns: 2,
    gap: 'md',
    density: 'comfortable',
    responsive: true,
  },
});

export const moduleCardGridItem = cva('min-w-0', {
  variants: {
    span: {
      1: '',
      2: 'col-span-1 md:col-span-2',
      3: 'col-span-1 md:col-span-2 xl:col-span-3',
      4: 'col-span-full',
    },
    spanResponsive: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { span: 2, spanResponsive: false, className: 'col-span-2' },
    { span: 3, spanResponsive: false, className: 'col-span-3' },
    { span: 4, spanResponsive: false, className: 'col-span-4' },
  ],
  defaultVariants: {
    span: 1,
    spanResponsive: true,
  },
});
