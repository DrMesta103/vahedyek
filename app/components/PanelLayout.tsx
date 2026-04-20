'use client';

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { getDiscountEntry, getDiscountGroup } from '../(panel)/contracts/new/_components/discountsConfig';
import { getPenaltyItem } from '../(panel)/contracts/new/_components/penaltiesConfig';
import OrbitMenu from './OrbitMenu';
import Sidebar from './Sidebar';

interface PanelLayoutProps {
  children: ReactNode;
}

type Crumb = {
  label: string;
  href?: string;
};

const STEP_LABELS: Record<string, string> = {
  subject: 'اطلاعات پایه',
  parties: 'طرفین',
  financial: 'اطلاعات مالی قرارداد',
  penalties: 'جرایم',
  discounts: 'تخفیف‌ها',
  termination: 'شرایط فسخ',
  review: 'نمایش کلی جزئیات',
  final: 'تایید نهایی قرارداد',
};

function buildContractsBreadcrumb(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const trail: Crumb[] = [{ label: 'فهرست قراردادها', href: '/contracts' }];

  if (segments[1] !== 'new') return trail;

  trail.push({ label: 'قرارداد جدید', href: '/contracts/new' });

  if (!segments[2]) return trail;

  const section = segments[2];
  if (STEP_LABELS[section]) {
    trail.push({ label: STEP_LABELS[section], href: `/contracts/new/${section}` });
  }

  if (section === 'penalties' && segments[3]) {
    trail.push({ label: getPenaltyItem(segments[3])?.title ?? 'جزئیات جریمه' });
  }

  if (section === 'discounts' && segments[3]) {
    trail.push({
      label: getDiscountGroup(segments[3])?.title ?? 'جزئیات تخفیف',
      href: `/contracts/new/discounts/${segments[3]}`,
    });

    if (segments[4] && segments[5]) {
      trail.push({
        label: segments[4] === 'whole' ? 'روی کل قرارداد' : 'تخفیف موردی',
        href: `/contracts/new/discounts/${segments[3]}`,
      });
      trail.push({
        label: getDiscountEntry(segments[4] as 'whole' | 'itemized', segments[5])?.title ?? 'جزئیات تخفیف',
      });
    }
  }

  return trail;
}

function buildDraftTemplateBreadcrumb(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const trail: Crumb[] = [{ label: 'فهرست قالب‌های پیش‌نویس', href: '/draft-templates' }];

  if (segments[1] !== 'new') return trail;

  trail.push({ label: 'قالب پیش‌نویس جدید', href: '/draft-templates/new' });

  if (!segments[2]) return trail;

  const section = segments[2];
  if (STEP_LABELS[section]) {
    trail.push({ label: STEP_LABELS[section], href: `/draft-templates/new/${section}` });
  }

  if (section === 'penalties' && segments[3]) {
    trail.push({ label: getPenaltyItem(segments[3])?.title ?? 'جزئیات جریمه' });
  }

  if (section === 'discounts' && segments[3]) {
    trail.push({
      label: getDiscountGroup(segments[3])?.title ?? 'جزئیات تخفیف',
      href: `/draft-templates/new/discounts/${segments[3]}`,
    });

    if (segments[4] && segments[5]) {
      trail.push({
        label: segments[4] === 'whole' ? 'روی کل قرارداد' : 'تخفیف موردی',
        href: `/draft-templates/new/discounts/${segments[3]}`,
      });
      trail.push({
        label: getDiscountEntry(segments[4] as 'whole' | 'itemized', segments[5])?.title ?? 'جزئیات تخفیف',
      });
    }
  }

  return trail;
}

export default function PanelLayout({ children }: PanelLayoutProps) {
  const pathname = usePathname();
  const showOrbitMenu = pathname === '/';

  const { activeItem, trail } = useMemo(() => {
    if (pathname === '/') {
      return {
        activeItem: 'home',
        trail: [{ label: 'خانه اپ' }],
      };
    }

    if (pathname.startsWith('/draft-templates')) {
      return {
        activeItem: 'draft-templates',
        trail: buildDraftTemplateBreadcrumb(pathname),
      };
    }

    if (pathname.startsWith('/contracts')) {
      return {
        activeItem: 'contracts',
        trail: buildContractsBreadcrumb(pathname),
      };
    }

    if (pathname.startsWith('/complex')) {
      return {
        activeItem: 'complex',
        trail: [{ label: 'جزئیات مجتمع' }],
      };
    }

    return {
      activeItem: 'home',
      trail: [{ label: 'خانه اپ' }],
    };
  }, [pathname]);

  return (
    <div className="app-shell">
      <Sidebar activeItem={activeItem} />
      {showOrbitMenu ? (
        <main className="main-content home-main-content">
          <OrbitMenu activeItem={activeItem} />
          {children}
        </main>
      ) : (
        <main className="main-content">
          <div className="main-stage">
            <div className="main-stage-content">
              <div className="top-header">
                <div className="breadcrumb">
                  <Link href="/" className="breadcrumb-link">
                    خانه
                  </Link>
                  {trail.map((item, index) => (
                    <span key={`${item.label}-${index}`}>
                      {' '}
                      <i className="fa fa-chevron-left"></i>{' '}
                      {item.href && index < trail.length - 1 ? (
                        <Link href={item.href} className="breadcrumb-link">
                          {item.label}
                        </Link>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <div className="content-body">{children}</div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
