import { cva } from 'class-variance-authority';

export type TaavDialogShellSize = 'sm' | 'md' | 'lg';
export type TaavDialogShellVariant = 'default' | 'form' | 'selection';
export type TaavDialogFooterVariant = 'default' | 'sticky' | 'separated';

export const taavDialogShellBackdropClass =
  'fixed inset-0 z-[var(--taav-z-overlay)] bg-[rgba(22,25,27,0.42)] backdrop-blur-[1.5px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0';

export const taavDialogShellVariants = cva(
  [
    'fixed left-1/2 top-1/2 z-[calc(var(--taav-z-overlay)+1)] flex max-h-[calc(100dvh-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden',
    'rounded-[30px] border-0 bg-[#f6f7f8] text-right text-[#55585b] shadow-[0_18px_38px_rgba(20,24,26,0.28)] outline-none',
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
  ],
  {
    variants: {
      size: {
        sm: 'w-[min(320px,calc(100vw-32px))]',
        md: 'w-[min(350px,calc(100vw-32px))]',
        lg: 'w-[min(480px,calc(100vw-32px))]',
      },
      variant: {
        default: '',
        form: '',
        selection: 'h-[min(516px,calc(100dvh-32px))]',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
);

export const taavDialogShellHeaderClass =
  'grid shrink-0 gap-[12px] px-[32px] pb-[14px] pt-[30px] text-center';

export const taavDialogShellTitleClass =
  'm-0 text-center text-[21px] font-bold leading-[1.45] text-[#55585b]';

export const taavDialogShellDescriptionClass =
  'm-0 text-center text-[12px] font-normal leading-[1.65] text-[#686b6e]';

export const taavDialogShellContentClass =
  'min-h-0 flex-1 overflow-y-auto px-[32px] pb-[30px]';

export const taavDialogShellFooterVariants = cva(
  [
    'flex min-h-[84px] shrink-0 flex-wrap items-center justify-start gap-[30px] px-[32px] py-[22px]',
    'bg-[#fafbfc] text-[#009b9f]',
  ],
  {
    variants: {
      variant: {
        default: '',
        sticky: 'sticky bottom-0 z-10',
        separated: 'shadow-[0_-5px_12px_rgba(42,49,52,0.05)]',
      },
    },
    defaultVariants: {
      variant: 'separated',
    },
  },
);

export const taavDialogShellActionClass =
  'inline-flex min-h-[32px] items-center justify-center border-0 bg-transparent p-0 text-[15px] font-bold leading-none text-[#009b9f] transition-colors hover:text-[#007f83] focus-visible:rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80cfd2] disabled:cursor-not-allowed disabled:opacity-45';
