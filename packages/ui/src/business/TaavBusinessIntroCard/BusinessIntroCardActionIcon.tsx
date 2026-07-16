type BusinessIntroCardActionIconProps = {
  className?: string;
};

export function BusinessIntroCardActionIcon({ className }: BusinessIntroCardActionIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
