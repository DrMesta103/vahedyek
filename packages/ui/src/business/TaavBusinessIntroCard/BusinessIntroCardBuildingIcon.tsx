type BusinessIntroCardBuildingIconProps = {
  className?: string;
};

export function BusinessIntroCardBuildingIcon({ className }: BusinessIntroCardBuildingIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M5 20V10l7-4 7 4v10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 20v-5h6v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 12.5h1.2M13.3 12.5h1.2M9.5 9.5h1.2M13.3 9.5h1.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
