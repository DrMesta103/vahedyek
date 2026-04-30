'use client';

export function BusinessSwitch({
  checked,
  onChange,
  activeLabel = 'فعال',
  inactiveLabel = 'غیرفعال',
  className = 'business-switch',
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
}) {
  return (
    <button type="button" className={className} aria-pressed={checked} onClick={() => onChange(!checked)}>
      <span className="business-switch-option is-on">{activeLabel}</span>
      <span className="business-switch-option is-off">{inactiveLabel}</span>
    </button>
  );
}

