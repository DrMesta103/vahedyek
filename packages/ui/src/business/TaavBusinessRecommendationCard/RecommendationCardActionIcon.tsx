type RecommendationCardActionIconProps = {
  className?: string;
};

export function RecommendationCardActionIcon({ className }: RecommendationCardActionIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M10 4 6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
