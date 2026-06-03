import type { ElementType } from 'react';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function RuleTabButton({
  title,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  icon: ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex min-w-[168px] flex-1 flex-col items-center justify-center gap-3 px-3 py-5 text-center transition max-sm:min-w-[132px] max-sm:gap-2 max-sm:px-2 max-sm:py-4',
        active ? 'text-[color:var(--text-strong)]' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]',
      )}
    >
      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full border transition max-sm:h-12 max-sm:w-12',
          active
            ? 'border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] text-[color:var(--theme-action-text)]'
            : 'border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)]',
        )}
      >
        <Icon className="h-6 w-6 max-sm:h-5 max-sm:w-5" />
      </span>
      <span className="text-sm font-bold">{title}</span>
      <span
        className={cn(
          'absolute inset-x-4 bottom-0 h-[2px] transition',
          active ? 'bg-[color:var(--theme-action-border)]' : 'bg-transparent group-hover:bg-[color:var(--border-color)]',
        )}
      />
    </button>
  );
}

