import Link from 'next/link';

export type BusinessSettingsCardProps = {
  title: string;
  description: string;
  href?: string;
  className?: string;
  onClick?: () => void;
};

export function BusinessSettingsCard({ title, description, href, className = '', onClick }: BusinessSettingsCardProps) {
  const cardClassName = ['business-settings-card', className].filter(Boolean).join(' ');

  const content = (
    <>
      <div className="business-settings-card-header">
        <div className="business-settings-pattern" />
        <span className="business-settings-card-arrow">‹</span>
        <h2 className="business-settings-card-title">{title}</h2>
      </div>
      <div className="business-settings-card-body">
        <p>{description}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${cardClassName} business-settings-card-link`}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${cardClassName} business-settings-card-link text-right`}>
        {content}
      </button>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}
