'use client';

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { getDiscountEntry, getDiscountGroup } from '../(panel)/contracts/new/_components/discountsConfig';
import { getPenaltyItem } from '../(panel)/contracts/new/_components/penaltiesConfig';
import { currentAppConfig } from '../config/current';
import OrbitMenu from './OrbitMenu';
import PageDocsWidget from './PageDocsWidget';
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

function buildBusinessSettingsBreadcrumb(pathname: string): Crumb[] {
  const trail: Crumb[] = [{ label: 'تنظیمات کسب و کار', href: '/business-settings' }];

  if (pathname.startsWith('/business-settings/profile')) {
    trail.push({
      label: 'پروفایل کسب‌وکار',
      href: pathname === '/business-settings/profile' ? undefined : '/business-settings/profile',
    });

    if (pathname.startsWith('/business-settings/profile/ownership')) {
      trail.push({ label: 'نوع مالکیت و اطلاعات پایه' });
    }
    if (pathname.startsWith('/business-settings/profile/shareholders')) {
      trail.push({
        label: 'سهامداران اصلی',
        href: pathname === '/business-settings/profile/shareholders' ? undefined : '/business-settings/profile/shareholders',
      });
    }
    if (pathname.startsWith('/business-settings/profile/shareholders/new')) {
      trail.push({ label: 'افزودن سهامدار' });
    }
    if (
      pathname.startsWith('/business-settings/profile/shareholders/') &&
      !pathname.startsWith('/business-settings/profile/shareholders/new')
    ) {
      trail.push({ label: 'ویرایش سهامدار حقوقی' });
    }
    if (pathname.startsWith('/business-settings/profile/bank-accounts')) {
      trail.push({
        label: 'شماره حساب',
        href: pathname === '/business-settings/profile/bank-accounts' ? undefined : '/business-settings/profile/bank-accounts',
      });
    }
    if (pathname.startsWith('/business-settings/profile/bank-accounts/new')) {
      trail.push({ label: 'افزودن حساب بانکی جدید' });
    }
    if (pathname.startsWith('/business-settings/profile/representatives')) {
      trail.push({
        label: 'لیست نماینده قانونی',
        href: pathname === '/business-settings/profile/representatives' ? undefined : '/business-settings/profile/representatives',
      });
    }
    if (pathname.startsWith('/business-settings/profile/representatives/new')) {
      trail.push({ label: 'افزودن نماینده قانونی' });
    }
    if (pathname.startsWith('/business-settings/profile/branding')) {
      trail.push({ label: 'لوگو و مهر' });
    }
    if (pathname.startsWith('/business-settings/profile/languages')) {
      trail.push({ label: 'زبان های فعال' });
    }
    if (pathname.startsWith('/business-settings/profile/currency')) {
      trail.push({ label: 'ارز پایه' });
    }
    if (pathname.startsWith('/business-settings/profile/measurement')) {
      trail.push({ label: 'واحد اندازه گیری' });
    }
    if (pathname.startsWith('/business-settings/profile/calendar')) {
      trail.push({ label: 'تقویم' });
    }
  }

  if (pathname.startsWith('/business-settings/contract-rules')) {
    trail.push({
      label: 'تنظیمات مالی و قواعد قراردادی',
      href: pathname === '/business-settings/contract-rules' ? undefined : '/business-settings/contract-rules',
    });

    if (pathname.startsWith('/business-settings/contract-rules/loan-settings')) {
      trail.push({ label: 'تنظیمات وام' });
    } else {
      const ruleSegment = pathname.split('/')[3];
      const ruleTitleMap: Record<string, string> = {
        installments: 'اقساط',
        prepayment: 'پیش پرداخت',
        adjustment: 'تنظیمات تعدیل',
        'additional-costs': 'هزینه های جانبی',
        discount: 'تنظیمات تخفیف',
        penalty: 'تنظیمات جریمه',
        forgiveness: 'تنظیمات بخشودگی',
        interest: 'سود دریافتی',
      };

      if (ruleSegment && ruleTitleMap[ruleSegment]) {
        trail.push({ label: ruleTitleMap[ruleSegment] });
      }
    }
  }

  if (pathname.startsWith('/business-settings/project')) {
    trail.push({
      label: 'تعریف پروژه / مجتمع',
      href: pathname.startsWith('/business-settings/project/') ? '/business-settings/project' : undefined,
    });
  }

  if (pathname.startsWith('/business-settings/project/blocks')) {
    trail.push({
      label: 'فهرست بلوک',
      href: pathname === '/business-settings/project/blocks' ? undefined : '/business-settings/project/blocks',
    });
  }

  if (pathname.startsWith('/business-settings/project/blocks/new')) {
    trail.push({ label: 'ثبت بلوک' });
  }

  if (pathname.includes('/business-settings/project/blocks/') && pathname.endsWith('/edit')) {
    trail.push({ label: 'ویرایش بلوک' });
  }

  if (
    pathname.includes('/business-settings/project/blocks/') &&
    !pathname.endsWith('/edit') &&
    !pathname.endsWith('/new') &&
    !pathname.includes('/floors/')
  ) {
    trail.push({ label: 'جزئیات بلوک' });
  }

  if (pathname.includes('/business-settings/project/blocks/') && pathname.includes('/floors/')) {
    trail.push({ label: 'جزئیات بلوک', href: pathname.split('/floors/')[0] });
    if (pathname.endsWith('/floors/new')) {
      trail.push({ label: 'ثبت طبقه' });
    } else if (pathname.endsWith('/units/new')) {
      trail.push({ label: 'جزئیات طبقه', href: pathname.split('/units/new')[0] });
      trail.push({ label: 'ثبت واحد' });
    } else {
      trail.push({ label: 'جزئیات طبقه' });
    }
  }

  return trail;
}

export default function PanelLayout({ children }: PanelLayoutProps) {
  const pathname = usePathname();
  const showOrbitMenu = pathname === '/';
  const isContractsNewHub = pathname === '/contracts/new';
  const isContractsListPage = pathname === '/contracts';

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

    if (pathname.startsWith('/business-settings')) {
      return {
        activeItem: 'business',
        trail: buildBusinessSettingsBreadcrumb(pathname),
      };
    }

    if (pathname.startsWith('/settings')) {
      return {
        activeItem: 'settings',
        trail: [{ label: 'تنظیمات کلی' }],
      };
    }

    const matchedModule = currentAppConfig.modules.find((module) => pathname.startsWith(module.routePrefix));
    if (matchedModule) {
      return {
        activeItem: matchedModule.id,
        trail: [{ label: matchedModule.label, href: matchedModule.routePrefix }],
      };
    }

    return {
      activeItem: 'home',
      trail: [{ label: 'خانه اپ' }],
    };
  }, [pathname]);

  return (
    <div className="app-shell">
      <PageDocsWidget />
      <Sidebar activeItem={activeItem} forceCollapsed={isContractsNewHub} lockCollapsed={isContractsNewHub} />
      {showOrbitMenu ? (
        <main className="main-content home-main-content">
          <OrbitMenu activeItem={activeItem} />
          {children}
        </main>
      ) : (
        <main className={`main-content${isContractsListPage ? ' contracts-page-main' : ''}`}>
          <div className={`main-stage${isContractsListPage ? ' main-stage-wide' : ''}`}>
            <div className={`main-stage-content${isContractsNewHub ? ' contract-flow-stage-content' : ''}${isContractsListPage ? ' main-stage-content-wide' : ''}`}>
              {!isContractsNewHub ? (
                <div className={`top-header${isContractsListPage ? ' top-header-compact' : ''}`}>
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
              ) : null}
              {isContractsListPage ? (
                children
              ) : (
                <div className={`content-body${isContractsNewHub ? ' content-body-wide' : ''}`}>{children}</div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
