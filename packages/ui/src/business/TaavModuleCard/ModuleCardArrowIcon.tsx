type ModuleCardArrowIconProps = {
  direction?: 'enter' | 'back';
  className?: string;
};

export function ModuleCardArrowIcon({ direction = 'enter', className }: ModuleCardArrowIconProps) {
  const path = direction === 'back' ? 'M6.5 4.5 10.5 9l-4 4.5' : 'M11.5 4.5 7.5 9l4 4.5';

  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden className={className}>
      <path d={path} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
