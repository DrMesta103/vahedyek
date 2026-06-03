'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { getDiscountEntry, getDiscountGroup } from '../(panel)/contracts/new/_components/discountsConfig';
import { getPenaltyItem } from '../(panel)/contracts/new/_components/penaltiesConfig';
import { currentAppConfig } from '../config/current';
import { MenuIcon } from './MenuIcon';
import OrbitMenu from './OrbitMenu';
import PageDocsWidget from './PageDocsWidget';
import ReminderWidget from './ReminderWidget';
import Sidebar from './Sidebar';

interface PanelLayoutProps {
  children: ReactNode;
}

type Crumb = {
  label: string;
  href?: string;
};

function pathnameMatchesHref(pathname: string, href: string) {
  return href !== '#' && (pathname === href || pathname.startsWith(`${href}/`));
}

function resolveActiveItem(pathname: string) {
  if (pathname === '/') return 'home';

  const matchedMenuItem = currentAppConfig.menuItems
    .filter((item) => pathnameMatchesHref(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (matchedMenuItem) return matchedMenuItem.id;

  const matchedModule = currentAppConfig.modules.find((module) => pathname.startsWith(module.routePrefix));
  return matchedModule?.id ?? 'home';
}

const STEP_LABELS: Record<string, string> = {
  subject: 'اطلاعات پایه',
  parties: 'طرفین',
  financial: 'اطلاعات مالی قرارداد',
  penalties: 'جرایم',
  discounts: 'تخفیف‌ها',
  interest: 'سود دریافتی',
  forgiveness: 'بخشودگی',
  termination: 'شرایط فسخ',
  review: 'نمایش کلی جزئیات',
  final: 'تایید نهایی قرارداد',
};

function buildContractsBreadcrumb(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const trail: Crumb[] = [{ label: 'فهرست قراردادها', href: '/contracts' }];

  if (segments[0] === 'contracts' && segments[1] && segments[1] !== 'new' && segments[2] === 'preview') {
    const contractId = segments[1];
    trail.push({ label: 'جزئیات قرارداد', href: `/contracts/${contractId}` });
    trail.push({ label: 'مشاهده پیش‌نویس' });
    return trail;
  }

  if (segments[0] === 'contracts' && segments[1] && segments[1] !== 'new' && segments[2] === 'reports') {
    const contractId = segments[1];
    trail.push({ label: 'جزئیات قرارداد', href: `/contracts/${contractId}` });
    trail.push({ label: 'گزارشات قرارداد' });
    return trail;
  }

  if (segments[0] === 'contracts' && segments[1] && segments[1] !== 'new' && segments[2] === 'history') {
    const contractId = segments[1];
    trail.push({ label: 'جزئیات قرارداد', href: `/contracts/${contractId}` });
    trail.push({ label: 'تاریخچه قرارداد' });
    return trail;
  }

  if (segments[0] === 'contracts' && segments[1] && segments[1] !== 'new' && segments[2] === 'appendices') {
    const contractId = segments[1];
    trail.push({ label: 'جزئیات قرارداد', href: `/contracts/${contractId}` });
    trail.push({
      label: 'فهرست الحاقیه‌ها',
      href: segments[3] === 'new' ? `/contracts/${contractId}/appendices` : undefined,
    });
    if (segments[3] === 'new') {
      trail.push({ label: 'ثبت الحاقیه' });
    }
    return trail;
  }

  if (segments[0] === 'contracts' && segments[1] && segments[1] !== 'new' && segments.length === 2) {
    trail.push({ label: 'جزئیات قرارداد' });
    return trail;
  }

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
    if (pathname.startsWith('/business-settings/profile/buyers')) {
      trail.push({
        label: 'خریداران',
        href: pathname === '/business-settings/profile/buyers' ? undefined : '/business-settings/profile/buyers',
      });
    }
    if (pathname.startsWith('/business-settings/profile/buyers/new')) {
      trail.push({ label: 'افزودن خریدار' });
    }
    if (
      pathname.startsWith('/business-settings/profile/buyers/') &&
      !pathname.startsWith('/business-settings/profile/buyers/new')
    ) {
      trail.push({ label: 'ویرایش خریدار حقوقی' });
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
      label: 'تنظیمات جریمه خریدار',
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
        penalty: 'تنظیمات جریمه خریدار',
        'builder-penalty': 'تنظیمات جریمه سازنده',
        'builder-cancellation': 'تنظیمات فسخ سازنده',
        'buyer-cancellation': 'تنظیمات فسخ خریدار',
        forgiveness: 'تنظیمات بخشودگی',
        interest: 'سود دریافتی',
      };

      if (ruleSegment && ruleTitleMap[ruleSegment]) {
        const rulePath = `/business-settings/contract-rules/${ruleSegment}`;
        const isDeeperThanRuleRoot = pathname !== rulePath;

        trail.push({
          label: ruleTitleMap[ruleSegment],
          href: isDeeperThanRuleRoot ? rulePath : undefined,
        });

        if (ruleSegment === 'builder-penalty') {
          const builderPenaltySection = pathname.split('/')[4];
          const builderPenaltyMap: Record<string, string> = {
            'unit-delivery-delay': 'تاخیر در تحویل واحد',
            'material-specs-change': 'تغییرات مهم مصالح و مشخصات واحد',
          };

          if (builderPenaltySection && builderPenaltyMap[builderPenaltySection]) {
            trail.push({ label: builderPenaltyMap[builderPenaltySection] });
          }
        }

        if (ruleSegment === 'builder-cancellation') {
          const builderCancellationSection = pathname.split('/')[4];
          const builderCancellationMap: Record<string, string> = {
            'late-installment': 'تاخیر در پرداخت اقساط',
            'financial-obligations': 'عدم انجام تعهدات مالی',
            'document-deficiencies': 'نقص مدارک / تعهدات',
            'other-breach': 'نقض سایر تعهدات قراردادی',
            notifications: 'اطلاع رسانی',
          };

          if (builderCancellationSection && builderCancellationMap[builderCancellationSection]) {
            trail.push({ label: builderCancellationMap[builderCancellationSection] });
          }
        }

        if (ruleSegment === 'buyer-cancellation') {
          const buyerCancellationSection = pathname.split('/')[4];
          const buyerCancellationMap: Record<string, string> = {
            'late-delivery': 'تاخیر در تحویل',
            'specification-changes': 'تغییر مشخصات',
            'breach-of-obligations': 'نقض تعهدات',
            'area-discrepancy': 'حق فسخ ناشی از اختلاف متراژ واحد',
            notification: 'اطلاع رسانی',
            'draft-template-usage': 'استفاده در پیش نویس',
          };

          if (buyerCancellationSection && buyerCancellationMap[buyerCancellationSection]) {
            trail.push({ label: buyerCancellationMap[buyerCancellationSection] });
          }
        }
      }
    }
  }

  if (pathname.startsWith('/business-settings/project')) {
    trail.push({
      label: 'تنظیمات پروژه / مجتمع',
      href: pathname.startsWith('/business-settings/project/') ? '/business-settings/project' : undefined,
    });

    if (pathname.startsWith('/business-settings/project/reports')) {
      trail.push({ label: 'گزارش‌های پروژه' });
    }

    if (pathname.startsWith('/business-settings/project/summary')) {
      trail.push({ label: 'خلاصه اطلاعات پروژه' });
    }

    if (pathname.startsWith('/business-settings/project/technical-specs')) {
      trail.push({ label: 'مشخصات فنی پروژه' });
    }

    if (pathname.startsWith('/business-settings/project/files')) {
      trail.push({ label: 'اسناد و فایل‌های پروژه' });
    }

    if (pathname.startsWith('/business-settings/project/plates')) {
      trail.push({ label: 'پلان‌ها و نقشه‌ها' });
    }

    if (pathname.startsWith('/business-settings/project/address')) {
      trail.push({ label: 'آدرس پروژه' });
    }

    if (pathname.startsWith('/business-settings/project/unit-types')) {
      const isUnitTypesRoot = pathname === '/business-settings/project/unit-types';
      trail.push({
        label: 'تیپ‌های واحد',
        href: isUnitTypesRoot ? undefined : '/business-settings/project/unit-types',
      });

      if (pathname === '/business-settings/project/unit-types/new') {
        trail.push({ label: 'افزودن تیپ واحد' });
      } else if (pathname.endsWith('/edit')) {
        trail.push({ label: 'ویرایش تیپ واحد' });
      }
    }
  }

  if (pathname.startsWith('/business-settings/approval-process')) {
    trail.push({
      label: 'فرآیند تایید',
      href: pathname === '/business-settings/approval-process' ? undefined : '/business-settings/approval-process',
    });

    const usageSegment = pathname.split('/')[3];
    const usageTitleMap: Record<string, string> = {
      residential: 'نوع کاربری مسکونی',
      commercial: 'نوع کاربری تجاری',
      office: 'نوع کاربری اداری',
      parking: 'نوع کاربری پارکینگ',
      storage: 'نوع کاربری انباری',
    };

    if (usageSegment && usageTitleMap[usageSegment]) {
      trail.push({ label: usageTitleMap[usageSegment] });
    } else if (usageSegment === 'new') {
      trail.push({ label: 'ثبت فرایند جدید' });
    } else if (usageSegment) {
      trail.push({ label: 'مدیریت فرایند تأیید' });
    }
  }

  if (pathname.startsWith('/business-settings/project/blocks')) {
    trail.push({
      label: 'بلوک‌ها / برج‌ها',
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const showOrbitMenu = pathname === '/';
  const isContractsNewHub = pathname === '/contracts/new';
  const isContractsListPage = pathname === '/contracts';
  const isContractReportsPage = /^\/contracts\/[^/]+\/reports(?:\/|$)/.test(pathname);
  const isAuditLogsPage = pathname === '/audit-logs';

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const { activeItem, trail } = useMemo(() => {
    const resolvedActiveItem = resolveActiveItem(pathname);

    if (pathname === '/') {
      return {
        activeItem: resolvedActiveItem,
        trail: [{ label: 'خانه اپ' }],
      };
    }

    if (pathname.startsWith('/draft-templates')) {
      return {
        activeItem: resolvedActiveItem,
        trail: buildDraftTemplateBreadcrumb(pathname),
      };
    }

    if (pathname.startsWith('/contracts')) {
      return {
        activeItem: resolvedActiveItem,
        trail: buildContractsBreadcrumb(pathname),
      };
    }

    if (pathname.startsWith('/complex')) {
      return {
        activeItem: resolvedActiveItem,
        trail: [{ label: 'جزئیات مجتمع' }],
      };
    }

    if (pathname.startsWith('/business-settings')) {
      return {
        activeItem: resolvedActiveItem,
        trail: buildBusinessSettingsBreadcrumb(pathname),
      };
    }

    if (pathname.startsWith('/settings')) {
      return {
        activeItem: resolvedActiveItem,
        trail: [{ label: 'تنظیمات کلی' }],
      };
    }

    if (pathname.startsWith('/dev-doc-threads')) {
      return {
        activeItem: resolvedActiveItem,
        trail: [{ label: 'برد گفت‌وگوهای مستندات' }],
      };
    }

    const matchedModule = currentAppConfig.modules.find((module) => pathname.startsWith(module.routePrefix));
    if (matchedModule) {
      return {
        activeItem: resolvedActiveItem,
        trail: [{ label: matchedModule.label, href: matchedModule.routePrefix }],
      };
    }

    return {
      activeItem: resolvedActiveItem,
      trail: [{ label: 'خانه اپ' }],
    };
  }, [pathname]);

  return (
    <div className="app-shell">
      <PageDocsWidget />
      <ReminderWidget />
      <button
        type="button"
        className="mobile-sidebar-trigger"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="باز کردن منوی اصلی"
        aria-controls="app-sidebar"
        aria-expanded={mobileSidebarOpen}
      >
        <MenuIcon name="fa-bars" />
      </button>
      <button
        type="button"
        className={`mobile-sidebar-backdrop${mobileSidebarOpen ? ' is-open' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-label="بستن منوی اصلی"
        tabIndex={mobileSidebarOpen ? 0 : -1}
      />
      <Sidebar
        activeItem={activeItem}
        forceCollapsed={isContractsNewHub || isContractReportsPage}
        lockCollapsed={isContractsNewHub}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      {showOrbitMenu ? (
        <main className="main-content home-main-content">
          <OrbitMenu activeItem={activeItem} />
          {children}
        </main>
      ) : (
        <main
          className={`main-content${isContractsListPage ? ' contracts-page-main' : ''}${isContractReportsPage ? ' reports-page-shell' : ''}${isAuditLogsPage ? ' audit-page-shell' : ''}`}
        >
          <div className={`main-stage${isContractsListPage || isContractReportsPage || isAuditLogsPage ? ' main-stage-wide' : ''}`}>
            <div
              className={`main-stage-content${isContractsNewHub ? ' contract-flow-stage-content' : ''}${isContractsListPage || isAuditLogsPage ? ' main-stage-content-wide' : ''}${isContractReportsPage ? ' reports-stage-content' : ''}${isAuditLogsPage ? ' audit-stage-content' : ''}`}
            >
              {!isContractsNewHub ? (
                <div
                  className={`top-header${isContractsListPage || isAuditLogsPage ? ' top-header-compact' : ''}${isContractReportsPage ? ' top-header-reports-dense' : ''}${isAuditLogsPage ? ' top-header-audit-dense' : ''}`}
                >
                  <div className="breadcrumb">
                    {[{ label: 'خانه', href: '/' }, ...trail].reverse().map((item, index, items) => (
                      <span key={`${item.label}-${index}`} className="breadcrumb-item">
                        {item.href && index < items.length - 1 ? (
                          <Link href={item.href} className="breadcrumb-link">
                            {item.label}
                          </Link>
                        ) : (
                          <span>{item.label}</span>
                        )}
                        {index < items.length - 1 ? <MenuIcon name="fa-chevron-left" className="breadcrumb-separator" /> : null}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {isContractsListPage ? (
                children
              ) : (
                <div
                  className={`content-body${isContractsNewHub || isContractReportsPage || isAuditLogsPage ? ' content-body-wide' : ''}${isContractReportsPage ? ' content-body-contract-reports' : ''}${isAuditLogsPage ? ' content-body-audit' : ''}`}
                >
                  {children}
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
