type RecommendationCardDefaultIconProps = {
  className?: string;
};

export function RecommendationCardDefaultIcon({ className }: RecommendationCardDefaultIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M8.5 11.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 14.5c1.2 1.4 2.7 2 4 2s2.8-.6 4-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4.5v2.2M10.2 5.2 9 3.8M13.8 5.2 15 3.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M6.5 18.5h11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8 18.5V16a4 4 0 0 1 8 0v2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.1v2.4M10.8 8.3h2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
