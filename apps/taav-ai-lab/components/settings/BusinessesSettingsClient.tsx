'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, FilterX, Search, Users } from 'lucide-react';
import { TaavSelect } from '@repo/ui/taav/forms';
import type { AdminBusinessRow } from '@/app/lib/data';
import {
  formatOwnerDisplayName,
  getAdminBusinessUsageStatus,
  getUsagePercentage,
} from '@/app/lib/admin-business-utils';
import { formatTokenCount } from '@/app/lib/business-utils';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabTooltipIcon } from '@/components/AiLabTooltip';
import { AdminBusinessCard } from './AdminBusinessCard';
import { IncreaseTokenDialog } from './IncreaseTokenDialog';

const STATUS_FILTER_OPTIONS = [
  { label: 'همه وضعیت‌ها', value: 'all' },
  { label: 'فعال', value: 'active' },
  { label: 'نزدیک به سقف', value: 'near_limit' },
  { label: 'سقف مصرف شده', value: 'exceeded' },
  { label: 'غیرفعال', value: 'inactive' },
];

const USAGE_FILTER_OPTIONS = [
  { label: 'همه بازه‌ها', value: 'all' },
  { label: 'کمتر از ۵۰٪', value: 'lt50' },
  { label: '۵۰٪ تا ۸۰٪', value: '50-80' },
  { label: '۸۰٪ تا ۹۹٪', value: '80-99' },
  { label: '۱۰۰٪ و بیشتر', value: 'gte100' },
];

function matchesUsageRange(percentage: number, tokenLimit: number, range: string) {
  if (range === 'all') return true;
  if (tokenLimit <= 0) return range === 'lt50';
  if (range === 'lt50') return percentage < 50;
  if (range === '50-80') return percentage >= 50 && percentage < 80;
  if (range === '80-99') return percentage >= 80 && percentage < 100;
  if (range === 'gte100') return percentage >= 100;
  return true;
}

type BusinessesSettingsClientProps = {
  businesses: AdminBusinessRow[];
};

export function BusinessesSettingsClient({ businesses }: BusinessesSettingsClientProps) {
  const router = useRouter();
  const [businessRows, setBusinessRows] = useState(businesses);
  const [tokenDialogBusiness, setTokenDialogBusiness] = useState<AdminBusinessRow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [usageFilter, setUsageFilter] = useState('all');

  useEffect(() => {
    setBusinessRows(businesses);
  }, [businesses]);

  const summary = useMemo(() => {
    let activeCount = 0;
    let totalTokenLimit = 0;
    let totalUsedTokens = 0;

    for (const business of businessRows) {
      if (business.isActive) activeCount += 1;
      totalTokenLimit += business.tokenLimit;
      totalUsedTokens += business.usedTokens;
    }

    return { total: businessRows.length, activeCount, totalTokenLimit, totalUsedTokens };
  }, [businessRows]);

  const ownerFilterOptions = useMemo(() => {
    const owners = new Set<string>();
    for (const business of businessRows) {
      owners.add(formatOwnerDisplayName(business));
    }

    return [
      { label: 'همه صاحبان', value: 'all' },
      ...[...owners]
        .sort((left, right) => left.localeCompare(right, 'fa'))
        .map((ownerName) => ({ label: ownerName, value: ownerName })),
    ];
  }, [businessRows]);

  const filteredBusinesses = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return businessRows.filter((business) => {
      if (normalizedSearch && !business.name.toLowerCase().includes(normalizedSearch)) return false;

      const ownerName = formatOwnerDisplayName(business);
      if (ownerFilter !== 'all' && ownerName !== ownerFilter) return false;

      const status = getAdminBusinessUsageStatus(business.isActive, business.usedTokens, business.tokenLimit);
      if (statusFilter !== 'all' && status !== statusFilter) return false;

      const usagePercentage = getUsagePercentage(business.usedTokens, business.tokenLimit);
      if (!matchesUsageRange(usagePercentage, business.tokenLimit, usageFilter)) return false;

      return true;
    });
  }, [businessRows, ownerFilter, searchQuery, statusFilter, usageFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setOwnerFilter('all');
    setStatusFilter('all');
    setUsageFilter('all');
  };

  return (
    <div className="ai-lab-admin-businesses-page" dir="rtl" lang="fa">
      <div className="ai-lab-admin-businesses-hero">
        <div className="ai-lab-admin-businesses-heading">
          <h1>
            فهرست کسب‌وکارها
            <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.settings.businesses} label="راهنمای فهرست کسب‌وکارها" />
          </h1>
          <p>تاو ادمین می‌تواند تمامی کسب‌وکارها و میزان مصرف توکن آن‌ها را مشاهده و مدیریت کند.</p>
        </div>

        <div className="ai-lab-admin-hero-stats">
          <article className="ai-lab-admin-hero-stat ai-lab-admin-hero-stat--blue">
            <div className="ai-lab-admin-hero-stat-icon">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span>تعداد کل کسب‌وکارها</span>
              <strong>{formatTokenCount(summary.total)}</strong>
              <small>کسب‌وکار فعال: {formatTokenCount(summary.activeCount)}</small>
            </div>
          </article>

          <article className="ai-lab-admin-hero-stat ai-lab-admin-hero-stat--teal">
            <div className="ai-lab-admin-hero-stat-icon">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <span>کل توکن مصرف‌شده</span>
              <strong>{formatTokenCount(summary.totalUsedTokens)}</strong>
              <small>از مجموع {formatTokenCount(summary.totalTokenLimit)} توکن</small>
            </div>
          </article>
        </div>
      </div>

      <div className="ai-lab-admin-filters-bar">
        <label className="ai-lab-admin-filter-search">
          <Search className="h-4 w-4" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="جستجو بر اساس نام کسب‌وکار"
            aria-label="جستجو بر اساس نام کسب‌وکار"
          />
        </label>

        <TaavSelect
          id="admin-business-status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={STATUS_FILTER_OPTIONS}
          aria-label="وضعیت"
        />

        <TaavSelect
          id="admin-business-usage"
          value={usageFilter}
          onChange={(event) => setUsageFilter(event.target.value)}
          options={USAGE_FILTER_OPTIONS}
          aria-label="بازه مصرف توکن"
        />

        <TaavSelect
          id="admin-business-owner"
          value={ownerFilter}
          onChange={(event) => setOwnerFilter(event.target.value)}
          options={ownerFilterOptions}
          aria-label="صاحب کسب‌وکار"
        />

        <button type="button" className="ai-lab-admin-clear-filters" onClick={clearFilters}>
          <FilterX className="h-4 w-4" />
          پاک‌سازی فیلترها
        </button>
      </div>

      {filteredBusinesses.length === 0 ? (
        <div className="ai-lab-admin-empty-state">
          <p>کسب‌وکاری با فیلترهای فعلی یافت نشد.</p>
        </div>
      ) : (
        <section className="ai-lab-admin-businesses-grid" aria-label="فهرست کسب‌وکارها">
          {filteredBusinesses.map((business) => (
            <AdminBusinessCard
              key={business.id}
              business={business}
              onIncreaseTokens={setTokenDialogBusiness}
            />
          ))}
        </section>
      )}

      <IncreaseTokenDialog
        business={tokenDialogBusiness}
        open={tokenDialogBusiness !== null}
        onOpenChange={(open) => {
          if (!open) setTokenDialogBusiness(null);
        }}
        onUpdated={(updatedBusiness) => {
          setBusinessRows((current) =>
            current.map((business) => (business.id === updatedBusiness.id ? updatedBusiness : business)),
          );
          setTokenDialogBusiness(null);
          router.refresh();
        }}
      />
    </div>
  );
}
