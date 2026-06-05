import type { SetupHealthItem } from '../../lib/setup-health';

export function SetupCriticalItemStatusList({ items }: { items: SetupHealthItem[] }) {
  return (
    <ul className="setup-health-status-list">
      {items.map((item) => (
        <li key={item.key} className="setup-health-status-item">
          <span>{item.label}</span>
          <span className={`setup-health-status-pill setup-health-status-pill-${item.status}`}>
            {item.status === 'completed' ? 'تکمیل شده' : 'ناقص'}
          </span>
        </li>
      ))}
    </ul>
  );
}
