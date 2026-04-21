import Link from 'next/link';

export type BusinessSettingsCardProps = {
  title: string;
  description: string;
  href?: string;
  className?: string;
};

export function BusinessSettingsCard({ title, description, href, className = '' }: BusinessSettingsCardProps) {
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

  return <article className={cardClassName}>{content}</article>;
}
