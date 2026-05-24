import Link from 'next/link';
import { Fragment } from 'react';
import { ChevronLeft } from 'lucide-react';

export type ModuleBreadcrumb = {
  label: string;
  href?: string;
};

type ModulePageHeaderProps = {
  breadcrumbs: ModuleBreadcrumb[];
  title: string;
  subtitle?: string;
  addHref?: string;
  onAddClick?: () => void;
  addLabel?: string;
  titleHref?: string;
  onTitleClick?: () => void;
};

export function ModulePageHeader({
  breadcrumbs,
  title,
  subtitle,
  addHref,
  onAddClick,
  addLabel,
  titleHref,
  onTitleClick,
}: ModulePageHeaderProps) {
  return (
    <header className="module-page-header" dir="rtl" lang="fa">
      <div className="module-page-header-copy">
        <nav className="module-breadcrumb" aria-label="مسیر صفحه">
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <ChevronLeft className="h-3 w-3 shrink-0 opacity-70" aria-hidden /> : null}
              {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
            </Fragment>
          ))}
        </nav>
        {titleHref ? (
          <Link href={titleHref} className="module-page-title module-page-title-link">
            {title}
            <ChevronLeft className="module-page-title-chevron" aria-hidden />
          </Link>
        ) : onTitleClick ? (
          <button type="button" className="module-page-title module-page-title-btn" onClick={onTitleClick}>
            {title}
            <ChevronLeft className="module-page-title-chevron" aria-hidden />
          </button>
        ) : (
          <h1 className="module-page-title">
            {title}
            <ChevronLeft className="module-page-title-chevron" aria-hidden />
          </h1>
        )}
        {subtitle ? <p className="module-page-subtitle">{subtitle}</p> : null}
      </div>
      {addLabel && onAddClick ? (
        <button type="button" className="module-page-add-btn" onClick={onAddClick}>
          <span aria-hidden>+</span>
          {addLabel}
        </button>
      ) : addHref && addLabel ? (
        <Link href={addHref} className="module-page-add-btn">
          <span aria-hidden>+</span>
          {addLabel}
        </Link>
      ) : null}
    </header>
  );
}
