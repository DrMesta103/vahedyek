type ModuleCardArrowIconProps = {
  direction?: 'enter' | 'back';
  className?: string;
};

export function ModuleCardArrowIcon({ direction = 'enter', className }: ModuleCardArrowIconProps) {
  const path = direction === 'back' ? 'M6 4l4 4-4 4' : 'M10 4 6 8l4 4';

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
