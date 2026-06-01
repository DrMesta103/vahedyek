'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ElementType, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  CalendarRange,
  ChevronLeft,
  ClipboardList,
  Copy,
  FileText,
  Grid2X2,
  Home,
  Layers3,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Square,
  Table2,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { ChoicePillsField } from '@repo/ui';
import { FieldGroup, FormTextInput, InlineSelect, TagPill, TagPills } from '../../contracts/new/_components/ContractFormPrimitives';
import { buildValidationSummary } from '../../contracts/new/_components/validationPresentation';
import { fetchProfilePayload } from '../profile/_components/profileStorage';
import { type ReferenceDataResponse } from '../../../lib/contractDraftClient';

type BlockDto = {
  id: string;
  name: string;
  mainPlate: string;
  subPlate: string;
  usageCounts?: UsageCounts;
  unitCount?: number;
  floorCount?: number;
};

type ProjectPlateDto = {
  id: string;
  mainPlate: string;
  subPlates: string[];
};

const REQUIRED_MESSAGE = 'این فیلد الزامی است';
const BLOCK_BULK_WARNING_THRESHOLD = 50;

type BlockSubmitResult = {
  mode: 'single' | 'bulk';
  count: number;
  entityId?: string;
};

type FloorDto = {
  id: string;
  name: string;
  unitCount: number;
  usageCounts?: UsageCounts;
};

type UnitDto = {
  id: string;
  name: string;
  floorName?: string;
  category?: string;
  unitType?: string | null;
  usage?: string | null;
  saleEnabled?: boolean | null;
  deliveryStatus?: string | null;
  area?: number | null;
  balconyCount?: number | null;
  bedroomCount?: number | null;
  postalCode?: string | null;
  amenities?: Array<{ title: string; count: number }> | null;
  baseInfo?: string | null;
  direction?: string | null;
  areaPricingMode?: string | null;
};

type AssignmentOption = {
  id: string;
  name: string;
  assignedToUnitId?: string | null;
};

type AmenityItem = {
  title: string;
  count: number;
};

type UnitFormDraft = {
  unitCategory: UnitCategory;
  activeTab: 'single' | 'bulk';
  unitType: string;
  usage: (typeof unitUsageOptions)[number]['value'] | '';
  name: string;
  prefix: string;
  from: string;
  to: string;
  saleEnabled: boolean;
  deliveryStatus: 'ready' | 'presale';
  area: string;
  balconyCount: string;
  bedroomCount: string;
  postalCode: string;
  direction: (typeof directionOptions)[number]['value'];
  areaPricingMode: (typeof unitAreaPricingOptions)[number]['value'];
  amenities: AmenityItem[];
  baseInfo: string;
  baseInfoDraft: string;
  selectedParkingIds: string[];
  selectedStorageIds: string[];
};

type UnitCategory = 'unit' | 'storage' | 'parking' | 'amenity';
type UsageCounts = {
  residential: number;
  commercial: number;
  office: number;
  parking: number;
  storage: number;
  amenity: number;
};

const DEFAULT_USAGE_COUNTS: UsageCounts = {
  residential: 0,
  commercial: 0,
  office: 0,
  parking: 0,
  storage: 0,
  amenity: 0,
};

const ownershipOptions = [
  {
    value: 'registered',
    label: 'ملکی',
    tooltip: 'نوع مالکیت زمین یا عرصه پروژه را مشخص می‌کند. این انتخاب می‌تواند روی قراردادها، انتقال سند و برخی محدودیت‌های حقوقی اثر بگذارد.',
  },
  {
    value: 'endowment',
    label: 'اوقافی',
    tooltip: 'برای پروژه‌هایی است که عرصه یا بخشی از حقوق زمین آنها موقوفه است و نیاز به دقت حقوقی بیشتری دارند.',
  },
  {
    value: 'rental',
    label: 'استیجاری',
    tooltip: 'وقتی استفاده از زمین یا ملک بر پایه اجاره یا حق بهره‌برداری تعریف شده باشد.',
  },
  {
    value: 'partnership',
    label: 'مشارکتی',
    tooltip: 'برای پروژه‌هایی که بین چند شریک یا بین مالک و سازنده به‌صورت مشارکتی اجرا می‌شوند.',
  },
  {
    value: 'governmental-transfer',
    label: 'واگذاری دولتی',
    tooltip: 'وقتی زمین یا حق بهره‌برداری پروژه از مسیر واگذاری یا مجوزهای دولتی تامین شده باشد.',
  },
  {
    value: 'other',
    label: 'سایر',
    tooltip: 'برای شرایطی که در گزینه‌های استاندارد قرار نمی‌گیرد و باید به‌صورت دستی تفسیر شود.',
  },
] as const;

const executionModelOptions = [
  {
    value: 'personal',
    label: 'شخصی‌ساز',
    tooltip: 'پروژه‌ای که توسط مالک یا توسعه‌دهنده خصوصی به‌صورت مستقل اجرا می‌شود و معمولاً کنترل عملیاتی بالاتری دارد.',
  },
  {
    value: 'cooperative',
    label: 'تعاونی',
    tooltip: 'پروژه‌ای که توسط تعاونی و برای اعضا یا ذی‌نفعان مشخص اجرا می‌شود.',
  },
  {
    value: 'national-housing',
    label: 'مسکن ملی',
    tooltip: 'پروژه‌ای در چارچوب طرح‌های حمایتی مسکن که می‌تواند روی قراردادها و سیاست‌های فروش اثر بگذارد.',
  },
  {
    value: 'mehr',
    label: 'مسکن مهر',
    tooltip: 'پروژه‌ای که در چارچوب مسکن مهر یا قواعد عملیاتی مشابه آن تعریف شده است.',
  },
  {
    value: 'partnership',
    label: 'مشارکتی',
    tooltip: 'پروژه‌ای که بین چند شریک، مالک و سازنده یا به‌صورت مشارکت در ساخت اجرا می‌شود.',
  },
  {
    value: 'governmental-public',
    label: 'دولتی / عمومی',
    tooltip: 'پروژه‌هایی که توسط نهادهای عمومی یا دولتی اجرا یا مدیریت می‌شوند و ممکن است قواعد اجرایی متفاوتی داشته باشند.',
  },
  {
    value: 'other',
    label: 'سایر',
    tooltip: 'برای مدل‌های اجرایی خاص که در گزینه‌های استاندارد قرار نمی‌گیرند.',
  },
] as const;

type ProjectNavItem = {
  title: string;
  description: string;
  icon: ElementType;
  href: string;
  kind: 'settings' | 'report' | 'view';
};

type ProjectNavGroup = {
  title: string;
  description: string;
  items: ProjectNavItem[];
};

const projectNavGroups: ProjectNavGroup[] = [
  {
    title: 'اطلاعات پایه پروژه',
    description: 'از این بخش نام، آدرس و خلاصه وضعیت پروژه را مدیریت یا مشاهده کنید.',
    items: [
      {
        title: 'اطلاعات پروژه',
        description: 'ویرایش نام، شناسه، آیکون و وضعیت اصلی پروژه',
        icon: Building2,
        href: '/business-settings/profile',
        kind: 'settings',
      },
      {
        title: 'آدرس پروژه',
        description: 'ثبت موقعیت، آدرس رسمی و جزئیات مکانی پروژه',
        icon: MapPin,
        href: '/business-settings/project/address',
        kind: 'settings',
      },
      {
        title: 'خلاصه اطلاعات پروژه',
        description: 'مشاهده خلاصه مشخصات ثبت‌شده، شمارش‌ها و وضعیت‌های اصلی پروژه',
        icon: ClipboardList,
        href: '/business-settings/project/summary',
        kind: 'view',
      },
    ],
  },
  {
    title: 'ساختار پروژه',
    description: 'ساختار داخلی پروژه، بلوک‌ها، طبقات و الگوی واحدها در این بخش قرار دارند.',
    items: [
      {
        title: 'بلوک‌ها / برج‌ها',
        description: 'مدیریت بلوک‌ها و برج‌های پروژه و ورود به جزئیات هر بلوک',
        icon: Home,
        href: '/business-settings/project/blocks',
        kind: 'settings',
      },
      {
        title: 'طبقات و واحدها',
        description: 'مدیریت طبقات، واحدها و ساختار داخلی هر بلوک',
        icon: Layers3,
        href: '/business-settings/project/blocks',
        kind: 'settings',
      },
      {
        title: 'تیپ‌های واحد',
        description: 'تعریف الگوهای استاندارد واحدها برای استفاده در پروژه',
        icon: Building2,
        href: '/business-settings/project/unit-types',
        kind: 'settings',
      },
      {
        title: 'پلان‌ها و نقشه‌ها',
        description: 'مدیریت پلان‌ها، نقشه‌ها و داده‌های ثبتی مرتبط با پروژه',
        icon: Grid2X2,
        href: '/business-settings/project/plates',
        kind: 'settings',
      },
    ],
  },
  {
    title: 'فنی و اجرایی',
    description: 'مشخصات فنی و برنامه زمان‌بندی در این بخش نگهداری می‌شود.',
    items: [
      {
        title: 'مشخصات فنی پروژه',
        description: 'ثبت مصالح، تجهیزات، سیستم‌ها و استانداردهای فنی پروژه',
        icon: Wrench,
        href: '/business-settings/project/technical-specs',
        kind: 'settings',
      },
      {
        title: 'برنامه زمان‌بندی پیشرفت',
        description: 'تعریف برنامه مراحل ساخت و پیگیری پیشرفت پروژه',
        icon: CalendarRange,
        href: '/business-settings/project/physical-progress-schedules',
        kind: 'settings',
      },
    ],
  },
  {
    title: 'اسناد و مدارک',
    description: 'اسناد، فایل‌ها و ضمایم رسمی پروژه از اینجا مدیریت می‌شوند.',
    items: [
      {
        title: 'اسناد و فایل‌های پروژه',
        description: 'بارگذاری و مدیریت نقشه‌ها، مجوزها، گزارش‌ها و فایل‌های رسمی',
        icon: FileText,
        href: '/business-settings/project/files',
        kind: 'settings',
      },
    ],
  },
  {
    title: 'گزارش‌ها',
    description: 'بخش نمایش و استخراج گزارش‌های پروژه بدون مخلوط شدن با تنظیمات اصلی.',
    items: [
      {
        title: 'گزارش‌های پروژه',
        description: 'مشاهده گزارش‌ها، آمار و وضعیت تجمیعی پروژه',
        icon: ClipboardList,
        href: '/business-settings/project/reports',
        kind: 'report',
      },
    ],
  },
];

const usageFilterOptions = [
  { value: 'residential', label: '\u0645\u0633\u06a9\u0648\u0646\u06cc' },
  { value: 'commercial', label: '\u062a\u062c\u0627\u0631\u06cc' },
  { value: 'office', label: '\u0627\u062f\u0627\u0631\u06cc' },
  { value: 'parking', label: '\u067e\u0627\u0631\u06a9\u06cc\u0646\u06af' },
  { value: 'storage', label: '\u0627\u0646\u0628\u0627\u0631\u06cc' },
  { value: 'welfare', label: '\u0631\u0641\u0627\u0647\u06cc' },
] as const;

const unitTypeTabs = [
  { value: 'unit', label: 'واحد', count: 7, icon: Home },
  { value: 'storage', label: 'انباری', count: 3, icon: Square },
  { value: 'parking', label: 'پارکینگ', count: 5, icon: Grid2X2 },
  { value: 'amenity', label: 'رفاهی', count: 5, icon: Layers3 },
] as const satisfies ReadonlyArray<{ value: UnitCategory; label: string; count: number; icon: ElementType }>;

const unitCategoryLabels: Record<UnitCategory, string> = {
  unit: 'واحد',
  storage: 'انباری',
  parking: 'پارکینگ',
  amenity: 'واحد رفاهی',
};

const usageTagMeta: ReadonlyArray<{ key: keyof UsageCounts; label: string }> = [
  { key: 'amenity', label: '\u0631\u0641\u0627\u0647\u06cc' },
  { key: 'parking', label: '\u067e\u0627\u0631\u06a9\u06cc\u0646\u06af' },
  { key: 'storage', label: '\u0627\u0646\u0628\u0627\u0631\u06cc' },
  { key: 'office', label: '\u0627\u062f\u0627\u0631\u06cc' },
  { key: 'commercial', label: '\u062a\u062c\u0627\u0631\u06cc' },
  { key: 'residential', label: '\u0645\u0633\u06a9\u0648\u0646\u06cc' },
];

function getUsageKey(value: string): keyof UsageCounts {
  return value === 'welfare' ? 'amenity' : (value as keyof UsageCounts);
}

function getUsageDisplayLabel(value: string) {
  const key = getUsageKey(value);
  return usageTagMeta.find((item) => item.key === key)?.label ?? value;
}

function formatCountLabel(count: number, label: string) {
  return `${count} ${label}`;
}

function getUsageCounts(input?: Partial<UsageCounts>) {
  return { ...DEFAULT_USAGE_COUNTS, ...input };
}

function countUnitsByUsage(units: UnitDto[]) {
  return units.reduce<UsageCounts>((acc, unit) => {
    const category = unit.category ?? 'unit';
    if (category === 'parking') acc.parking += 1;
    else if (category === 'storage') acc.storage += 1;
    else if (category === 'amenity') acc.amenity += 1;
    else if (unit.usage === 'commercial') acc.commercial += 1;
    else if (unit.usage === 'office') acc.office += 1;
    else acc.residential += 1;
    return acc;
  }, { ...DEFAULT_USAGE_COUNTS });
}

function getUnitStatTags(unit: UnitDto, display: ReturnType<typeof getUnitDisplayData>) {
  const category = unit.category ?? 'unit';
  if (category === 'parking') {
    return [];
  }
  if (category === 'storage') {
    return [];
  }
  if (category === 'amenity') {
    return [];
  }

  return [
    { className: 'is-orange', label: `اتاق خواب ${display.bedrooms}` },
    { className: 'is-blue', label: `بالکن ${display.balconies}` },
    { className: 'is-sky', label: `پارکینگ ${display.parking}` },
    { className: 'is-blue', label: `انباری ${display.storage}` },
  ];
}

const unitAreaPricingOptions = [
  {
    value: 'unit-plus-parking',
    label: 'واحد + پارکینگ',
    hint: 'متراژ واحد و پارکینگ با هم در متراژ قابل قیمت‌گذاری لحاظ می‌شوند.',
  },
  {
    value: 'unit-plus-storage-parking',
    label: 'واحد + انباری + پارکینگ',
    hint: 'متراژ واحد، انباری و پارکینگ یکجا در مبنای قیمت‌گذاری استفاده می‌شوند.',
  },
  {
    value: 'unit-plus-storage',
    label: 'واحد + انباری',
    hint: 'متراژ واحد و انباری با هم در متراژ قابل قیمت‌گذاری منظور می‌شوند.',
  },
  {
    value: 'unit-only',
    label: 'تفکیک کامل',
    hint: 'متراژ واحد، انباری و پارکینگ جدا نگه داشته می‌شوند و در قیمت‌گذاری مستقل عمل می‌کنند.',
  },
] as const;

const unitUsageFilters = [
  { value: 'residential', label: '۵ مسکونی' },
  { value: 'commercial', label: '۱ تجاری' },
  { value: 'office', label: '۱ اداری' },
] as const;

const unitUsageLabels = ['مسکونی', 'مسکونی', 'مسکونی', 'اداری', 'تجاری', 'مسکونی'];
const unitTypeOptions = ['تیپ A', 'تیپ B', 'تیپ C', 'بدون تیپ'];
const amenitySpaceTypeOptions = [
  'فضای سبز',
  'سالن ورزشی',
  'استخر',
  'باشگاه',
  'نگار خانه هنر',
  'سوئیت مهمان',
  'سینما',
  'اتاق بازی',
  'سالن اجتماعات',
  'کارگاه هنری',
  'سالن اسپا',
  'کتاب خانه',
  'کافی شاپ',
  'سرویس بهداشتی عمومی',
] as const;
const unitUsageOptions = [
  { value: 'residential', label: 'مسکونی' },
  { value: 'commercial', label: 'تجاری' },
  { value: 'office', label: 'اداری' },
] as const;

const unitUsageLabelMap: Record<string, string> = {
  residential: 'مسکونی',
  commercial: 'تجاری',
  office: 'اداری',
};

const deliveryStatusLabelMap: Record<string, string> = {
  ready: 'آماده تحویل',
  presale: 'پیش فروش',
};

const directionOptions = [
  { value: 'unknown', label: 'نامشخص' },
  { value: 'north', label: 'شمالی' },
  { value: 'south', label: 'جنوبی' },
  { value: 'east', label: 'شرقی' },
  { value: 'west', label: 'غربی' },
  { value: 'north-east', label: 'شمال شرقی' },
  { value: 'north-west', label: 'شمال غربی' },
  { value: 'south-east', label: 'جنوب شرقی' },
  { value: 'south-west', label: 'جنوب غربی' },
] as const;

function getPlateText(block: Pick<BlockDto, 'mainPlate' | 'subPlate'>) {
  const parts = [];
  if (block.mainPlate) parts.push(`پلاک اصلی ${block.mainPlate}`);
  if (block.subPlate) parts.push(`پلاک فرعی ${block.subPlate}`);
  return parts.length ? parts.join(' ') : 'پلاک ثبت نشده';
}

function normalizeNameForComparison(value: string) {
  return value.trim().toLocaleLowerCase('fa-IR');
}

function parseLocalizedInteger(value: string) {
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
  return Number.parseInt(normalized.trim(), 10);
}

function getUnitDisplayData(unit: UnitDto, index: number) {
  const usage = unit.usage ? unitUsageLabelMap[unit.usage] ?? unit.usage : unitUsageLabels[index % unitUsageLabels.length];
  const isLarge = usage !== 'مسکونی';
  const code = unit.name.replace(/^.*واحد\s*/, '').replace(/^.*-\s*/, '').trim() || unit.name;

  return {
    code,
    usage,
    area: unit.area ?? (isLarge ? 300 : 100),
    bedrooms: unit.bedroomCount ?? (isLarge ? 3 : 2),
    balconies: unit.balconyCount ?? (isLarge ? 3 : 1),
    parking: usage === 'اداری' ? '۱' : '۰',
    storage: usage === 'اداری' ? '۱' : '۰',
    saleStatus: unit.saleEnabled === false ? 'غیر فروشی' : 'فروشی',
    deliveryStatus: deliveryStatusLabelMap[unit.deliveryStatus ?? 'ready'] ?? 'آماده تحویل',
  };
}

export function BusinessProjectPanel() {
  const [ownership, setOwnership] = useState<(typeof ownershipOptions)[number]['value']>('registered');
  const [structure, setStructure] = useState<(typeof executionModelOptions)[number]['value']>('cooperative');
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchProfilePayload().then(({ store, meta }) => {
      if (cancelled) return;
      setBusinessName(meta.businessName || store.legal.companyName || '');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="business-project-page" aria-label="پروفایل مجتمع">
      <div className="business-project-card">
        <div className="business-project-avatar" aria-hidden="true">
          <Building2 />
        </div>

        <div className="business-project-title-row">
          <h1>{businessName || '---'}</h1>
          <button type="button" className="business-project-edit" aria-label="ویرایش" title="ویرایش">
            <Pencil />
          </button>
        </div>

        <div className="business-project-section">
          <ChoicePillsField<(typeof ownershipOptions)[number]['value']>
            label="نوع مالکیت عرصه"
            options={ownershipOptions}
            value={ownership}
            onChange={(value) => setOwnership(value as (typeof ownershipOptions)[number]['value'])}
            wrap
            pillsClassName="business-project-tags"
          />
          <p>وضعیت مالکیت زمین یا بنا را مشخص کنید. این مورد در قراردادها و اسناد رسمی لحاظ می‌شود.</p>
        </div>

        <div className="business-project-section">
          <ChoicePillsField<(typeof executionModelOptions)[number]['value']>
            label="نوع ساخت"
            options={executionModelOptions}
            value={structure}
            onChange={(value) => setStructure(value as (typeof executionModelOptions)[number]['value'])}
            wrap
            pillsClassName="business-project-tags"
          />
          <p>شیوه یا نهاد اصلی سازنده پروژه را مشخص کنید.</p>
        </div>

        <div className="business-project-info-grid" aria-label="بخش‌های اطلاعاتی">
          {projectNavGroups.flatMap((group) => group.items).map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <div className="business-project-info-content">
                  <div className="business-project-info-title">
                    <Icon />
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.description}</p>
                </div>
                <span className="business-project-chevron">‹</span>
              </>
            );

            return (
              <Link href={item.href} key={item.title} className="business-project-info-item">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BusinessBlocksPanel() {
  const [query, setQuery] = useState('');
  const [activeUsage, setActiveUsage] = useState('');
  const [blocks, setBlocks] = useState<BlockDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState('');
  const [copySource, setCopySource] = useState<BlockDto | null>(null);
  const [copyName, setCopyName] = useState('');
  const [copyDialogError, setCopyDialogError] = useState('');
  const [showCopyValidation, setShowCopyValidation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadBlocks() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/business-settings/project/blocks', { cache: 'no-store' });
        const data = (await response.json()) as { blocks?: BlockDto[]; message?: string };
        if (!response.ok) throw new Error(data.message ?? 'دریافت فهرست بلوک‌ها ناموفق بود.');
        if (!cancelled) setBlocks(data.blocks ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'دریافت فهرست بلوک‌ها ناموفق بود.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBlocks();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedQuery = query.trim();
  const blockFilterCounts = blocks.reduce<UsageCounts>((acc, block) => {
    const counts = getUsageCounts(block.usageCounts);
    acc.residential += counts.residential;
    acc.commercial += counts.commercial;
    acc.office += counts.office;
    acc.parking += counts.parking;
    acc.storage += counts.storage;
    acc.amenity += counts.amenity;
    return acc;
  }, { ...DEFAULT_USAGE_COUNTS });
  const filteredBlocks = blocks.filter((block) => {
    const matchesQuery = normalizedQuery ? block.name.includes(normalizedQuery) || getPlateText(block).includes(normalizedQuery) : true;
    const matchesUsage = activeUsage ? getUsageCounts(block.usageCounts)[getUsageKey(activeUsage)] > 0 : true;
    return matchesQuery && matchesUsage;
  });

  const reloadBlocks = async () => {
    const response = await fetch('/api/business-settings/project/blocks', { cache: 'no-store' });
    const data = (await response.json()) as { blocks?: BlockDto[]; message?: string };
    if (!response.ok) throw new Error(data.message ?? 'دریافت فهرست بلوک‌ها ناموفق بود.');
    setBlocks(data.blocks ?? []);
  };

  const copyBlock = async () => {
    if (!copySource) return;
    if (!copyName.trim()) {
      setShowCopyValidation(true);
      setCopyDialogError(buildValidationSummary({ copyName: REQUIRED_MESSAGE }, { copyName: 'نام/مشخصه/شماره' }, 'اطلاعات کپی بلوک کامل نیست.'));
      return;
    }
    const response = await fetch(`/api/business-settings/project/blocks/${copySource.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'copy', name: copyName }),
    });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) {
      setError(data.message ?? 'کپی بلوک ناموفق بود.');
      return;
    }
    setCopySource(null);
    setCopyName('');
    setCopyDialogError('');
    setShowCopyValidation(false);
    await reloadBlocks();
  };

  const deleteBlock = async (block: BlockDto) => {
    const confirmed = window.confirm(`بلوک «${block.name}» حذف شود؟`);
    if (!confirmed) return;

    const response = await fetch(`/api/business-settings/project/blocks/${block.id}`, { method: 'DELETE' });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) {
      setError(data.message ?? 'حذف بلوک ناموفق بود.');
      return;
    }
    await reloadBlocks();
  };

  return (
    <section className="business-blocks-page" aria-label="فهرست بلوک‌ها">
      <div className="business-blocks-shell">
        <div className="business-blocks-filter-card">
          <h2>فیلتر بر اساس نوع کاربری طبقات</h2>
          <div className="business-blocks-filter-pills" aria-label="فیلتر نوع کاربری">
            {usageFilterOptions.map((option) => (
              (() => {
                const count = blockFilterCounts[getUsageKey(option.value)];
                return (
                  <button
                    type="button"
                    key={option.value}
                    aria-pressed={activeUsage === option.value}
                    aria-disabled={count === 0}
                    className={count === 0 ? 'is-disabled' : undefined}
                    disabled={count === 0}
                    onClick={() => setActiveUsage((current) => (current === option.value ? '' : option.value))}
                  >
                    {formatCountLabel(count, getUsageDisplayLabel(option.value))}
                  </button>
                );
              })()
            ))}
          </div>
          <p>با انتخاب نوع کاربری، بلوک‌هایی که با این نوع کاربری مطابقت دارند نمایش داده می‌شوند. اعداد نشان‌دهنده تعداد واحدهای ثبت شده برای هر نوع کاربری هستند.</p>
        </div>

        <div className="business-blocks-toolbar">
          <Link href="/business-settings/project/blocks/new" className="business-blocks-add">
            <Plus />
            افزودن بلوک
          </Link>

          <label className="business-blocks-search">
            <Search />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو..." />
          </label>
        </div>

        <div className="business-blocks-grid">
          {loading ? <div className="business-blocks-state">در حال دریافت بلوک‌ها...</div> : null}
          {error ? <div className="business-blocks-state is-error">{error}</div> : null}
          {!loading && !error && filteredBlocks.length === 0 ? <div className="business-blocks-state">بلوک مطابق این فیلتر ثبت نشده است.</div> : null}
          {!loading && !error && filteredBlocks.map((block) => (
            <article
              className="business-block-card"
              key={block.id}
              onClick={() => router.push(`/business-settings/project/blocks/${block.id}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  router.push(`/business-settings/project/blocks/${block.id}`);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <header className="business-block-card-cover">
                <span>{block.name}</span>
              </header>

              <div className="business-block-card-body">
                <div className="business-block-card-meta">
                  <span>{getPlateText(block)}</span>
                  <button
                    type="button"
                    className="business-block-card-menu"
                    aria-label={`گزینه‌های ${block.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuId((current) => (current === block.id ? '' : block.id));
                    }}
                  >
                    <MoreVertical />
                  </button>
                  {openMenuId === block.id ? (
                    <div className="business-block-menu-popover" onClick={(event) => event.stopPropagation()}>
                      <Link href={`/business-settings/project/blocks/${block.id}/edit`}>
                        <Pencil /> ویرایش
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setCopySource(block);
                          setCopyName(`${block.name} - کپی`);
                          setOpenMenuId('');
                        }}
                      >
                        <Copy /> کپی
                      </button>
                      <button type="button" onClick={() => deleteBlock(block)}>
                        <Trash2 /> حذف
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="business-block-card-stats">
                  {usageTagMeta.map((tag) => {
                    const count = getUsageCounts(block.usageCounts)[tag.key];
                    return (
                      <span key={tag.key} aria-disabled={count === 0} className={count === 0 ? 'is-disabled' : undefined}>
                        {formatCountLabel(count, tag.label)}
                      </span>
                    );
                  })}
                </div>

                <div className="business-block-report">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 text-right"
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(`/business-settings/project/physical-progress-schedules?blockId=${encodeURIComponent(block.id)}`);
                    }}
                  >
                    <div>
                      <h4>گزارش مالی و پیشرفت فیزیکی پروژه</h4>
                      <p>برای همین بلوک، برنامه زمان‌بندی و مبنای گزارش پیشرفت فیزیکی را مدیریت کنید.</p>
                      <span className="business-block-report-status">
                        <i>i</i>
                        ورود به گزارش بلوک
                      </span>
                    </div>
                    <ChevronLeft aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      {copySource ? (
        <Dialog title="کپی بلوک" subtitle="یک مشخصه جدید برای نسخه کپی‌شده وارد کنید." onClose={() => setCopySource(null)}>
          {copyDialogError ? <div className="business-blocks-state is-error">{copyDialogError}</div> : null}
          <FormField label="نام/مشخصه/شماره" required invalid={showCopyValidation && !copyName.trim()}>
            <input value={copyName} onChange={(event) => setCopyName(event.target.value.slice(0, 30))} />
          </FormField>
          <div className="business-dialog-actions">
            <button type="button" className="business-dialog-secondary" onClick={() => setCopySource(null)}>
              انصراف
            </button>
            <button type="button" className="business-block-form-submit" onClick={copyBlock}>
              کپی
            </button>
          </div>
        </Dialog>
      ) : null}
    </section>
  );
}

export function BusinessBlockForm({ blockId }: { blockId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(blockId);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mainPlate, setMainPlate] = useState('');
  const [subPlate, setSubPlate] = useState('');
  const [plates, setPlates] = useState<ProjectPlateDto[]>([]);
  const [existingBlocks, setExistingBlocks] = useState<Array<{ id: string; name: string }>>([]);
  const [plateDialogOpen, setPlateDialogOpen] = useState(false);
  const [newMainPlate, setNewMainPlate] = useState('');
  const [newSubPlate, setNewSubPlate] = useState('');
  const [newSubPlates, setNewSubPlates] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [showPlateValidation, setShowPlateValidation] = useState(false);
  const [submitResult, setSubmitResult] = useState<BlockSubmitResult | null>(null);

  const selectedPlate = plates.find((plate) => plate.mainPlate === mainPlate);
  const availableSubPlates = selectedPlate?.subPlates ?? [];
  const parsedFrom = parseLocalizedInteger(from);
  const parsedTo = parseLocalizedInteger(to);
  const bulkRangeIsValid = Number.isFinite(parsedFrom) && Number.isFinite(parsedTo) && parsedFrom <= parsedTo;
  const bulkCount = bulkRangeIsValid ? parsedTo - parsedFrom + 1 : 0;
  const bulkPrefix = prefix.trim();
  const bulkPreviewNames =
    bulkRangeIsValid && bulkPrefix
      ? Array.from({ length: Math.min(bulkCount, 3) }, (_, index) => `${bulkPrefix}-${parsedFrom + index}`)
      : [];
  const bulkPreviewLast = bulkRangeIsValid && bulkPrefix && bulkCount > 4 ? `${bulkPrefix}-${parsedTo}` : '';
  const returnTarget = searchParams.get('returnTo');

  const loadPlates = async () => {
    const response = await fetch('/api/business-settings/project/plates', { cache: 'no-store' });
    const data = (await response.json()) as { plates?: ProjectPlateDto[]; message?: string };
    if (!response.ok) throw new Error(data.message ?? 'دریافت پلاک‌ها ناموفق بود.');
    setPlates(data.plates ?? []);
  };

  useEffect(() => {
    loadPlates().catch((err) => setMessage(err instanceof Error ? err.message : 'دریافت پلاک‌ها ناموفق بود.'));
  }, []);

  const loadBlocks = async () => {
    const response = await fetch('/api/business-settings/project/blocks', { cache: 'no-store' });
    const data = (await response.json()) as { blocks?: BlockDto[]; message?: string };
    if (!response.ok) throw new Error(data.message ?? 'دریافت فهرست بلوک‌ها ناموفق بود.');
    const blocks = (data.blocks ?? []).map((block) => ({ id: block.id, name: block.name }));
    setExistingBlocks(blocks);
    return blocks;
  };

  useEffect(() => {
    loadBlocks().catch((err) => setMessage(err instanceof Error ? err.message : 'دریافت فهرست بلوک‌ها ناموفق بود.'));
  }, []);

  useEffect(() => {
    if (!blockId) return;
    let cancelled = false;

    async function loadBlock() {
      setLoading(true);
      setMessage('');

      try {
        const response = await fetch(`/api/business-settings/project/blocks/${blockId}`, { cache: 'no-store' });
        const data = (await response.json()) as { block?: BlockDto; message?: string };
        if (!response.ok || !data.block) throw new Error(data.message ?? 'دریافت اطلاعات بلوک ناموفق بود.');

        if (!cancelled) {
          setName(data.block.name);
          setMainPlate(data.block.mainPlate);
          setSubPlate(data.block.subPlate);
        }
      } catch (err) {
        if (!cancelled) setMessage(err instanceof Error ? err.message : 'دریافت اطلاعات بلوک ناموفق بود.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBlock();

    return () => {
      cancelled = true;
    };
  }, [blockId]);

  const blockNameExists = (candidate: string) =>
    existingBlocks.some((block) => block.id !== blockId && normalizeNameForComparison(block.name) === normalizeNameForComparison(candidate));

  const submit = async () => {
    const errors: Record<string, string> = {};
    if (activeTab === 'bulk' && !isEdit) {
      if (!prefix.trim()) errors.prefix = REQUIRED_MESSAGE;
      if (!from.trim()) errors.from = REQUIRED_MESSAGE;
      if (!to.trim()) errors.to = REQUIRED_MESSAGE;
      if (from.trim() && to.trim() && !bulkRangeIsValid) errors.to = 'شماره پایان باید بزرگ‌تر یا مساوی شماره شروع باشد.';
      if (bulkPrefix && bulkRangeIsValid) {
        const duplicateCandidate = Array.from({ length: bulkCount }, (_, index) => `${bulkPrefix}-${parsedFrom + index}`).find((candidate) => blockNameExists(candidate));
        if (duplicateCandidate) errors.prefix = `این نام برای بلوک دیگری در همین پروژه ثبت شده است: ${duplicateCandidate}`;
      }
    } else if (!name.trim()) {
      errors.name = REQUIRED_MESSAGE;
    } else if (blockNameExists(name)) {
      errors.name = 'این نام برای بلوک دیگری در همین پروژه ثبت شده است.';
    }
    if (Object.keys(errors).length > 0) {
      setShowValidation(true);
      setMessage(
        buildValidationSummary(
          errors,
          {
            name: 'نام یا شماره بلوک',
            prefix: 'پیشوند نام‌گذاری',
            from: 'از شماره',
            to: 'تا شماره',
          },
          'اطلاعات بلوک کامل نیست.',
        ),
      );
      return;
    }

    setSaving(true);
    setMessage('');
    setShowValidation(false);

    const payload =
      activeTab === 'bulk' && !isEdit
        ? { mode: 'bulk', prefix, from, to, mainPlate, subPlate }
        : { mode: 'single', name, mainPlate, subPlate };

    try {
      const response = await fetch(isEdit ? `/api/business-settings/project/blocks/${blockId}` : '/api/business-settings/project/blocks', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { message?: string; createdCount?: number; createdBlockId?: string; mode?: 'single' | 'bulk' };
      if (!response.ok) throw new Error(data.message ?? 'ثبت اطلاعات بلوک ناموفق بود.');

      const blocks = await loadBlocks();
      if (isEdit) {
        router.push('/business-settings/project/blocks');
        router.refresh();
      } else {
        const createdBlock = activeTab === 'single' ? blocks.find((block) => normalizeNameForComparison(block.name) === normalizeNameForComparison(name)) : undefined;
        const createdBlockId = data.createdBlockId ?? createdBlock?.id;
        if (activeTab === 'single' && returnTarget && createdBlockId) {
          const url = new URL(returnTarget, window.location.origin);
          url.searchParams.set('selectedBlock', createdBlockId);
          router.push(`${url.pathname}${url.search}${url.hash}`);
          router.refresh();
          return;
        }
        setSubmitResult({
          mode: data.mode ?? activeTab,
          count: data.createdCount ?? (activeTab === 'bulk' ? bulkCount : 1),
          entityId: createdBlockId,
        });
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ثبت اطلاعات بلوک ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const submitPlate = async () => {
    setMessage('');
    const subPlates = newSubPlate.trim() ? [...newSubPlates, newSubPlate.trim()] : newSubPlates;
    const plateErrors: Record<string, string> = {};
    if (!newMainPlate.trim()) plateErrors.newMainPlate = REQUIRED_MESSAGE;
    if (subPlates.length === 0) plateErrors.newSubPlate = REQUIRED_MESSAGE;
    if (Object.keys(plateErrors).length > 0) {
      setShowPlateValidation(true);
      setMessage(buildValidationSummary(plateErrors, { newMainPlate: 'پلاک اصلی', newSubPlate: 'پلاک فرعی' }, 'اطلاعات پلاک کامل نیست.'));
      return;
    }
    const response = await fetch('/api/business-settings/project/plates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mainPlate: newMainPlate, subPlates }),
    });
    const data = (await response.json()) as { plates?: ProjectPlateDto[]; message?: string };
    if (!response.ok) {
      setMessage(data.message ?? 'ثبت پلاک ناموفق بود.');
      return;
    }
    setPlates(data.plates ?? []);
    setMainPlate(newMainPlate);
    setSubPlate(subPlates[0] ?? '');
    setNewMainPlate('');
    setNewSubPlate('');
    setNewSubPlates([]);
    setShowPlateValidation(false);
    setPlateDialogOpen(false);
  };

  const addSubPlateTag = () => {
    const value = newSubPlate.trim();
    if (!value || newSubPlates.includes(value)) return;
    setNewSubPlates((current) => [...current, value]);
    setNewSubPlate('');
  };

  return (
    <section className="business-block-form-page" aria-label={isEdit ? 'ویرایش بلوک' : 'ثبت بلوک'}>
      <div className="business-block-form-card">
        {!isEdit && submitResult ? (
          <div className="business-block-form-success">
            <h2>{submitResult.mode === 'bulk' ? `${submitResult.count} بلوک با موفقیت ایجاد شد.` : 'بلوک با موفقیت ثبت شد.'}</h2>
            <p>
              {submitResult.mode === 'bulk'
                ? 'برای بررسی نتیجه، فهرست بلوک‌ها را ببینید یا یک ثبت جدید انجام دهید.'
                : 'اکنون می‌توانید طبقات این بلوک را مدیریت کنید یا به فهرست بلوک‌ها برگردید.'}
            </p>
            <div className="business-block-form-actions">
              {submitResult.mode === 'single' && submitResult.entityId ? (
                <Link href={`/business-settings/project/blocks/${submitResult.entityId}`} className="business-block-form-submit">
                  مدیریت طبقات
                </Link>
              ) : null}
              <button type="button" className="business-dialog-secondary" onClick={() => router.push('/business-settings/project/blocks')}>
                مشاهده فهرست بلوک‌ها
              </button>
              {submitResult.mode === 'bulk' ? (
                <button
                  type="button"
                  className="business-dialog-secondary"
                  onClick={() => {
                    setSubmitResult(null);
                    setPrefix('');
                    setFrom('');
                    setTo('');
                    setMessage('');
                    setShowValidation(false);
                  }}
                >
                  افزودن بلوک جدید
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="business-block-form-tabs">
          <button type="button" className={activeTab === 'single' ? 'active' : ''} onClick={() => setActiveTab('single')} disabled={isEdit}>
            <Square />
            افزودن تکی
          </button>
          <button type="button" className={activeTab === 'bulk' ? 'active' : ''} onClick={() => setActiveTab('bulk')} disabled={isEdit}>
            <Table2 />
            افزودن تجمیعی
          </button>
        </div>

        {loading ? <div className="business-blocks-state">در حال دریافت اطلاعات بلوک...</div> : null}
        {message ? <div className="business-blocks-state is-error">{message}</div> : null}

        {!loading ? (
          <>
            {!submitResult ? (
              <div className="business-block-form-section">
                <p className="business-block-form-help">
                  در این بخش می‌توانید یک بلوک را به‌صورت تکی ثبت کنید یا چند بلوک مشابه را با نام‌گذاری پیوسته ایجاد کنید. پس از ثبت بلوک،
                  امکان مدیریت طبقات و واحدهای آن فعال می‌شود.
                </p>
              </div>
            ) : null}
            {!submitResult && (activeTab === 'single' || isEdit) ? (
              <div className="business-block-form-section">
                <p className="business-block-form-help">{isEdit ? 'اطلاعات بلوک را ویرایش کنید.' : 'برای ثبت یک بلوک مستقل از این بخش استفاده کنید.'}</p>
                <FormField label="نام یا شماره بلوک" required hint="نام، شماره یا مشخصه‌ای را وارد کنید که این بلوک با آن در پروژه شناخته می‌شود؛ مانند بلوک A، برج 1 یا فاز 2." invalid={showValidation && !name.trim()}>
                  <input value={name} onChange={(event) => setName(event.target.value.slice(0, 30))} placeholder="مثلاً بلوک A یا برج 1" />
                  <span className="business-block-form-counter">{name.length} / ۳۰</span>
                </FormField>
              </div>
            ) : !submitResult ? (
              <div className="business-block-form-section">
                <p className="business-block-form-help">اگر هر بلوک پلاک یا مشخصات ثبتی متفاوت دارد، از افزودن تکی استفاده کنید.</p>
                <div className="business-block-form-row">
                <FormField label="پیشوند نام‌گذاری" required hint="عبارت ثابت قبل از شماره طبقات." invalid={showValidation && !prefix.trim()}>
                  <input value={prefix} onChange={(event) => setPrefix(event.target.value.slice(0, 30))} placeholder="مثلاً بلوک" />
                  <span className="business-block-form-counter">{prefix.length} / ۳۰</span>
                </FormField>
                  <FormField label="از شماره" required hint="شماره شروع را وارد کنید." invalid={showValidation && !from.trim()}>
                    <input value={from} onChange={(event) => setFrom(event.target.value)} placeholder="مثلاً 1" />
                  </FormField>
                  <FormField label="تا شماره" required hint="شماره پایان باید بزرگ‌تر یا مساوی شروع باشد." invalid={showValidation && !to.trim()}>
                    <input value={to} onChange={(event) => setTo(event.target.value)} placeholder="مثلاً 5" />
                  </FormField>
                </div>
                <div className="business-block-form-preview">
                  {bulkRangeIsValid && bulkPrefix ? (
                    <>
                      <strong>پیش‌نمایش بلوک‌های ایجادشونده</strong>
                      <p>
                        {bulkPreviewNames.join('، ')}
                        {bulkPreviewLast ? `، ...، ${bulkPreviewLast}` : ''}
                      </p>
                      <span>{bulkCount} بلوک ایجاد خواهد شد.</span>
                    </>
                  ) : (
                    <p>برای مشاهده پیش‌نمایش، پیشوند و بازه شماره‌گذاری معتبر را وارد کنید.</p>
                  )}
                  {from.trim() && to.trim() && !bulkRangeIsValid ? (
                    <p className="business-block-form-warning">شماره پایان باید بزرگ‌تر یا مساوی شماره شروع باشد.</p>
                  ) : null}
                  {bulkCount > BLOCK_BULK_WARNING_THRESHOLD ? (
                    <p className="business-block-form-warning">تعداد زیادی بلوک ایجاد خواهد شد. قبل از ادامه، اطلاعات را بررسی کنید.</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {!submitResult ? <div className="business-block-form-section">
              <div className="business-block-form-section-title">
                <h2>پلاک اصلی و فرعی</h2>
                <button type="button" className="business-block-form-soft-button" onClick={() => setPlateDialogOpen(true)}>
                  <Plus />
                  افزودن پلاک
                </button>
              </div>
              <p className="business-block-form-help">شماره پلاک اصلی و فرعی مربوط به این بلوک را در صورت وجود انتخاب کنید.</p>
              <div className="business-block-form-pills">
                {plates.map((plate) => (
                  <button
                    type="button"
                    key={plate.id}
                    aria-pressed={mainPlate === plate.mainPlate}
                    onClick={() => {
                      setMainPlate(plate.mainPlate);
                      setSubPlate('');
                    }}
                  >
                    {plate.mainPlate}
                  </button>
                ))}
                {plates.length === 0 ? <p className="business-block-form-empty">هنوز پلاکی ثبت نشده است.</p> : null}
              </div>

              <div className="business-block-form-subplates">
                <h3>پلاک فرعی، در صورت وجود</h3>
                <p>اگر این بلوک چند پلاک فرعی در سطح پروژه دارد، می‌توانید موارد بیشتری را از دکمه «افزودن پلاک» ثبت کنید.</p>
                {availableSubPlates.length ? (
                  <div className="business-block-form-pills">
                    {availableSubPlates.map((plate) => (
                      <button type="button" key={plate} aria-pressed={subPlate === plate} onClick={() => setSubPlate(plate)}>
                        {plate}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>ابتدا یک پلاک اصلی انتخاب کنید.</p>
                )}
              </div>
            </div> : null}

            {!submitResult ? <div className="business-block-form-actions">
              <button type="button" className="business-block-form-submit" onClick={submit} disabled={saving}>
                {saving ? 'در حال ذخیره...' : isEdit ? 'ذخیره تغییرات' : activeTab === 'bulk' ? 'ایجاد بلوک‌ها' : 'افزودن بلوک'}
              </button>
            </div> : null}
          </>
        ) : null}
      </div>
      {plateDialogOpen ? (
        <Dialog title="پلاک‌های اصلی و فرعی" subtitle="برای هر پلاک اصلی می‌توانید چند پلاک فرعی ثبت کنید." onClose={() => setPlateDialogOpen(false)}>
          <div className="business-plate-dialog-fields">
            <FormField label="پلاک اصلی" required hint="شماره پلاک اصلی ثبتی مربوط به زمین یا بلوک را در صورت وجود وارد کنید." invalid={showPlateValidation && !newMainPlate.trim()}>
              <input value={newMainPlate} onChange={(event) => setNewMainPlate(event.target.value)} inputMode="numeric" placeholder="مثلا ۴۳" />
              {plates.length ? (
                <div className="business-plate-suggestions" aria-label="پلاک‌های اصلی قبلی">
                  {plates.map((plate) => (
                    <button type="button" key={plate.id} onClick={() => setNewMainPlate(plate.mainPlate)}>
                      {plate.mainPlate}
                    </button>
                  ))}
                </div>
              ) : null}
            </FormField>
            <FormField label="پلاک فرعی" required hint="شماره پلاک فرعی مربوط به این بلوک را در صورت وجود وارد کنید." invalid={showPlateValidation && !(newSubPlate.trim() || newSubPlates.length)}>
              <div className="business-tag-input">
                <input
                  value={newSubPlate}
                  onChange={(event) => setNewSubPlate(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addSubPlateTag();
                    }
                  }}
                  inputMode="numeric"
                  placeholder="مثلا ۱"
                />
                <button type="button" onClick={addSubPlateTag} aria-label="افزودن پلاک فرعی">
                  <Plus />
                </button>
              </div>
              <div className="business-tag-list">
                {newSubPlates.map((plate) => (
                  <span key={plate}>
                    {plate}
                    <button type="button" onClick={() => setNewSubPlates((current) => current.filter((item) => item !== plate))}>
                      <X />
                    </button>
                  </span>
                ))}
              </div>
            </FormField>
          </div>
          <div className="business-dialog-actions">
            <button type="button" className="business-dialog-plain-action" onClick={submitPlate}>
              افزودن
            </button>
            <button type="button" className="business-dialog-plain-action" onClick={() => setPlateDialogOpen(false)}>
              لغو
            </button>
          </div>
        </Dialog>
      ) : null}
    </section>
  );
}

export function BusinessBlockDetail({ blockId }: { blockId: string }) {
  const [businessName, setBusinessName] = useState('');
  const [block, setBlock] = useState<{ name: string; mainPlate?: string | null; subPlate?: string | null; unitCount?: number; floorCount?: number } | null>(null);
  const [floors, setFloors] = useState<FloorDto[]>([]);
  const [blockUnits, setBlockUnits] = useState<Array<ReferenceDataResponse['blocks'][number]['units'][number]>>([]);
  const [query, setQuery] = useState('');
  const [activeUsage, setActiveUsage] = useState('');
  const [loading, setLoading] = useState(true);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadFloors = async () => {
    const response = await fetch(`/api/business-settings/project/blocks/${blockId}/floors`, { cache: 'no-store' });
    const data = (await response.json()) as {
      block?: { name: string; mainPlate?: string | null; subPlate?: string | null; unitCount?: number; floorCount?: number };
      floors?: FloorDto[];
      message?: string;
    };
    if (!response.ok) throw new Error(data.message ?? 'دریافت طبقات ناموفق بود.');
    setBlock(data.block ?? null);
    setFloors(data.floors ?? []);
  };

  useEffect(() => {
    let cancelled = false;
    fetchProfilePayload().then(({ store, meta }) => setBusinessName(meta.businessName || store.legal.companyName || ''));
    loadFloors()
      .catch((err) => setMessage(err instanceof Error ? err.message : 'دریافت طبقات ناموفق بود.'))
      .finally(() => setLoading(false));
    fetch('/api/contracts/reference-data', { cache: 'no-store' })
      .then(async (response) => {
        const data = (await response.json()) as ReferenceDataResponse & { message?: string };
        if (!response.ok) throw new Error(data.message ?? 'دریافت جزئیات واحدها ناموفق بود.');
        if (cancelled) return;
        setBlockUnits(data.blocks.find((item) => item.id === blockId)?.units ?? []);
      })
      .catch(() => {
        if (!cancelled) setBlockUnits([]);
      })
      .finally(() => {
        if (!cancelled) setUnitsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [blockId]);

  const normalizedQuery = query.trim();
  const floorFilterCounts = floors.reduce<UsageCounts>((acc, floor) => {
    const counts = getUsageCounts(floor.usageCounts);
    acc.residential += counts.residential;
    acc.commercial += counts.commercial;
    acc.office += counts.office;
    acc.parking += counts.parking;
    acc.storage += counts.storage;
    acc.amenity += counts.amenity;
    return acc;
  }, { ...DEFAULT_USAGE_COUNTS });
  const filteredFloors = floors.filter((floor) => {
    const matchesQuery = normalizedQuery ? floor.name.includes(normalizedQuery) : true;
    const matchesUsage = activeUsage ? getUsageCounts(floor.usageCounts)[getUsageKey(activeUsage)] > 0 : true;
    return matchesQuery && matchesUsage;
  });
  const groupedFloorUnits = useMemo(
    () =>
      filteredFloors.map((floor) => ({
        floor,
        units: blockUnits
          .filter((unit) => unit.floorName === floor.name)
          .slice()
          .sort((left, right) => left.name.localeCompare(right.name, 'fa-IR')),
      })),
    [blockUnits, filteredFloors],
  );

  return (
    <section className="business-blocks-page business-blocks-page-yellow" aria-label="مدیریت طبقات">
      <div className="business-blocks-shell">
        <div className="business-page-breadcrumb" aria-label="مسیر صفحه">
          <span>خانه</span>
          <i>/</i>
          <span>تنظیمات کسب‌وکار</span>
          <i>/</i>
          <span>تعریف پروژه</span>
          <i>/</i>
          <span>{block?.name ? `بلوک ${block.name}` : 'بلوک'}</span>
          <i>/</i>
          <strong>مدیریت طبقات</strong>
        </div>

        <div className="business-context-card">
          <div className="business-context-card-header">
            <div>
              <h2>مدیریت طبقات</h2>
              <p>{block?.name ? `بلوک ${block.name}` : 'در حال دریافت اطلاعات بلوک...'} {businessName ? `| پروژه ${businessName}` : ''}</p>
            </div>
            <Link href={`/business-settings/project/blocks/${blockId}/floors/new`} className="business-blocks-add">
              <Plus />
              افزودن طبقه
            </Link>
          </div>
          <div className="business-context-card-grid">
            <span>پلاک اصلی: {block?.mainPlate || 'ثبت نشده'}</span>
            <span>پلاک فرعی: {block?.subPlate || 'ثبت نشده'}</span>
            <span>تعداد طبقات: {block?.floorCount ?? floors.length}</span>
            <span>تعداد واحدها: {block?.unitCount ?? 0}</span>
          </div>
        </div>

        <div className="business-blocks-filter-card">
          <h2>فیلتر طبقات بر اساس نوع کاربری</h2>
          <div className="business-blocks-filter-pills" aria-label="فیلتر طبقات بر اساس نوع کاربری">
            {usageFilterOptions.map((option) => (
              (() => {
                const count = floorFilterCounts[getUsageKey(option.value)];
                return (
                  <button
                    type="button"
                    key={option.value}
                    aria-pressed={activeUsage === option.value}
                    aria-disabled={count === 0}
                    className={count === 0 ? 'is-disabled' : undefined}
                    disabled={count === 0}
                    onClick={() => setActiveUsage((current) => (current === option.value ? '' : option.value))}
                  >
                    {formatCountLabel(count, getUsageDisplayLabel(option.value))}
                  </button>
                );
              })()
            ))}
          </div>
          <p>نمایش طبقات بر اساس نوع کاربری واحدهای ثبت‌شده در هر طبقه انجام می‌شود.</p>
        </div>

        <div className="business-blocks-toolbar">
          <label className="business-blocks-search">
            <Search />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو بر اساس نام یا شماره طبقه..." />
          </label>
        </div>
      </div>

      <div className="business-floor-grid">
        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت طبقات...</div> : null}
        {!loading && floors.length === 0 ? (
          <div className="business-empty-state">
            <Layers3 />
            <h3>هنوز طبقه‌ای ثبت نشده است</h3>
            <p>برای شروع، اولین طبقه این بلوک را ثبت کنید.</p>
            <Link href={`/business-settings/project/blocks/${blockId}/floors/new`} className="business-block-form-submit">
              افزودن طبقه
            </Link>
          </div>
        ) : null}
        {!loading && floors.length > 0 && filteredFloors.length === 0 ? <div className="business-blocks-state">طبقه مطابق جستجو پیدا نشد.</div> : null}
        {filteredFloors.map((floor) => (
          <Link href={`/business-settings/project/blocks/${blockId}/floors/${floor.id}`} key={floor.id} className="business-block-card business-floor-list-card">
            <header className="business-block-card-cover">
              <span>{floor.name}</span>
            </header>

            <div className="business-block-card-body">
              <div className="business-block-card-meta">
                <span>{block?.name ? `بلوک ${block.name} - ${floor.unitCount} واحد ثبت شده` : `${floor.unitCount} واحد ثبت شده`}</span>
                <span className="business-block-card-menu" aria-hidden="true">
                  <MoreVertical />
                </span>
              </div>

              <h3>نوع کاربری</h3>
              <div className="business-block-card-stats">
                {usageTagMeta.map((tag) => {
                  const count = getUsageCounts(floor.usageCounts)[tag.key];
                  return (
                    <span key={tag.key} aria-disabled={count === 0} className={count === 0 ? 'is-disabled' : undefined}>
                      {formatCountLabel(count, tag.label)}
                    </span>
                  );
                })}
              </div>

              <div className="business-block-report">
                <div>
                  <h4>جزئیات و لیست واحدها</h4>
                  <p>برای مشاهده جزئیات طبقه و مدیریت واحدهای آن وارد شوید.</p>
                  <span className="business-block-report-status">
                    <i>i</i>
                    مدیریت واحدها
                  </span>
                </div>
                <ChevronLeft aria-hidden="true" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="business-floor-units-board">
        <div className="business-floor-units-board-head">
          <div>
            <span className="business-floor-units-kicker">نمای تجمیعی</span>
            <h2>همه واحدها به تفکیک طبقه</h2>
            <p>برای هر طبقه، واحدها با کارت‌های جداگانه و اطلاعات کلیدی نمایش داده شده‌اند تا مرور پروژه سریع و دقیق باشد.</p>
          </div>
          <div className="business-floor-units-board-chip">
            <Sparkles className="h-4 w-4" />
            حالت گلس و انیمیشن‌دار
          </div>
        </div>

        {unitsLoading ? <div className="business-blocks-state">در حال دریافت جزئیات واحدها...</div> : null}

        {!unitsLoading && groupedFloorUnits.length === 0 ? (
          <div className="business-empty-state">
            <Layers3 />
            <h3>واحدی برای نمایش وجود ندارد</h3>
            <p>بعد از ثبت واحدها، این بخش آن‌ها را به تفکیک طبقه نمایش می‌دهد.</p>
          </div>
        ) : null}

        <div className="business-floor-units-stack">
          {groupedFloorUnits.map(({ floor, units: floorUnits }) => {
            const floorCounts = getUsageCounts(floor.usageCounts);
            const floorKey = `${floor.id}-${floor.name}`;
            return (
              <article className="business-floor-units-card" key={floorKey}>
                <div className="business-floor-units-card-head">
                  <div>
                    <h3>{floor.name}</h3>
                    <p>{block?.name ? `بلوک ${block.name}` : 'بلوک'} · {floorUnits.length.toLocaleString('fa-IR')} واحد</p>
                  </div>
                  <Link href={`/business-settings/project/blocks/${blockId}/floors/${floor.id}`} className="business-floor-units-card-link">
                    ورود به طبقه
                  </Link>
                </div>
                <div className="business-floor-units-badges">
                  {usageTagMeta.map((tag) => {
                    const count = floorCounts[tag.key];
                    return (
                      <span key={tag.key} className={count === 0 ? 'is-disabled' : undefined}>
                        {formatCountLabel(count, tag.label)}
                      </span>
                    );
                  })}
                </div>
                <div className="business-floor-units-grid">
                  {floorUnits.length ? (
                    floorUnits.map((unit, index) => {
                      const display = getUnitDisplayData({ ...unit, usage: unit.category === 'unit' ? 'residential' : 'commercial' } as UnitDto, index);
                      const unitLink = `/business-settings/project/blocks/${blockId}/floors/${floor.id}/units/${unit.id}`;
                      return (
                        <Link key={unit.id} href={unitLink} className="business-floor-unit-mini-card">
                          <div className="business-floor-unit-mini-head">
                            <strong>{unit.name}</strong>
                            <span>{unit.category === 'unit' ? 'واحد' : unit.category === 'parking' ? 'پارکینگ' : unit.category === 'storage' ? 'انباری' : 'رفاهی'}</span>
                          </div>
                          <div className="business-floor-unit-mini-meta">
                            <span>{unit.floorName}</span>
                            <span>{unit.area ? `${unit.area.toLocaleString('fa-IR')} متر` : 'متراژ ثبت نشده'}</span>
                          </div>
                          <div className="business-floor-unit-mini-tags">
                            <span>{display.saleStatus}</span>
                            <span>{display.deliveryStatus}</span>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="business-floor-unit-mini-empty">برای این طبقه هنوز واحدی ثبت نشده است.</div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BusinessFloorForm({ blockId }: { blockId: string }) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [block, setBlock] = useState<{ name: string; mainPlate?: string | null; subPlate?: string | null; unitCount?: number; floorCount?: number } | null>(null);
  const [existingFloorNames, setExistingFloorNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [submitResult, setSubmitResult] = useState<BlockSubmitResult | null>(null);
  const parsedFrom = parseLocalizedInteger(from);
  const parsedTo = parseLocalizedInteger(to);
  const bulkRangeIsValid = Number.isFinite(parsedFrom) && Number.isFinite(parsedTo) && parsedFrom <= parsedTo;
  const floorPrefix = prefix.trim();
  const bulkCount = bulkRangeIsValid ? parsedTo - parsedFrom + 1 : 0;
  const previewNames =
    bulkRangeIsValid && floorPrefix ? Array.from({ length: Math.min(bulkCount, 3) }, (_, index) => `${floorPrefix}-${parsedFrom + index}`) : [];
  const previewLast = bulkRangeIsValid && floorPrefix && bulkCount > 4 ? `${floorPrefix}-${parsedTo}` : '';

  useEffect(() => {
    fetchProfilePayload().then(({ store, meta }) => setBusinessName(meta.businessName || store.legal.companyName || ''));
    fetch(`/api/business-settings/project/blocks/${blockId}/floors`, { cache: 'no-store' })
      .then(async (response) => {
        const data = (await response.json()) as {
          block?: { name: string; mainPlate?: string | null; subPlate?: string | null; unitCount?: number; floorCount?: number };
          floors?: FloorDto[];
          message?: string;
        };
        if (!response.ok) throw new Error(data.message ?? 'دریافت اطلاعات طبقات ناموفق بود.');
        setBlock(data.block ?? null);
        setExistingFloorNames((data.floors ?? []).map((floor) => floor.name));
      })
      .catch((err) => setMessage(err instanceof Error ? err.message : 'دریافت اطلاعات طبقات ناموفق بود.'));
  }, [blockId]);

  const floorNameExists = (candidate: string) => existingFloorNames.some((item) => normalizeNameForComparison(item) === normalizeNameForComparison(candidate));

  const submitFloor = async () => {
    const errors: Record<string, string> = {};
    if (activeTab === 'bulk') {
      if (!prefix.trim()) errors.prefix = REQUIRED_MESSAGE;
      if (!from.trim()) errors.from = REQUIRED_MESSAGE;
      if (!to.trim()) errors.to = REQUIRED_MESSAGE;
      if (from.trim() && to.trim() && !bulkRangeIsValid) errors.to = 'شماره پایان باید بزرگ‌تر یا مساوی شماره شروع باشد.';
      if (floorPrefix && bulkRangeIsValid) {
        const duplicateCandidate = Array.from({ length: bulkCount }, (_, index) => `${floorPrefix}-${parsedFrom + index}`).find((candidate) => floorNameExists(candidate));
        if (duplicateCandidate) errors.prefix = `این نام برای طبقه دیگری در همین بلوک ثبت شده است: ${duplicateCandidate}`;
      }
    } else if (!name.trim()) {
      errors.name = REQUIRED_MESSAGE;
    } else if (floorNameExists(name)) {
      errors.name = 'این نام برای طبقه دیگری در همین بلوک ثبت شده است.';
    }
    if (Object.keys(errors).length > 0) {
      setShowValidation(true);
      setMessage(buildValidationSummary(errors, { name: 'نام یا شماره طبقه', prefix: 'پیشوند نام‌گذاری', from: 'از شماره', to: 'تا شماره' }, 'اطلاعات طبقه کامل نیست.'));
      return;
    }

    setSaving(true);
    setMessage('');
    setShowValidation(false);
    const payload = activeTab === 'bulk' ? { mode: 'bulk', prefix, from, to } : { mode: 'single', name };

    try {
      const response = await fetch(`/api/business-settings/project/blocks/${blockId}/floors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        message?: string;
        createdCount?: number;
        createdFloorId?: string;
        mode?: 'single' | 'bulk';
        floors?: FloorDto[];
        block?: { name: string; mainPlate?: string | null; subPlate?: string | null; unitCount?: number; floorCount?: number };
      };
      if (!response.ok) throw new Error(data.message ?? 'ثبت طبقه ناموفق بود.');
      setExistingFloorNames((data.floors ?? []).map((floor) => floor.name));
      setBlock(data.block ?? block);
      setSubmitResult({
        mode: data.mode ?? activeTab,
        count: data.createdCount ?? (activeTab === 'bulk' ? bulkCount : 1),
        entityId: data.createdFloorId,
      });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ثبت طبقه ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="business-block-form-page" aria-label="ثبت طبقه">
      <div className="business-block-form-card">
        <div className="business-page-breadcrumb" aria-label="مسیر صفحه">
          <span>خانه</span>
          <i>/</i>
          <span>تنظیمات کسب‌وکار</span>
          <i>/</i>
          <span>تعریف پروژه</span>
          <i>/</i>
          <span>{block?.name ? `بلوک ${block.name}` : 'بلوک'}</span>
          <i>/</i>
          <strong>افزودن طبقه</strong>
        </div>

        <div className="business-context-card">
          <div className="business-context-card-header">
            <div>
              <h2>افزودن طبقه</h2>
              <p>{block?.name ? `بلوک ${block.name}` : 'در حال دریافت اطلاعات بلوک...'} {businessName ? `| پروژه ${businessName}` : ''}</p>
            </div>
          </div>
          <div className="business-context-card-grid">
            <span>پلاک اصلی: {block?.mainPlate || 'ثبت نشده'}</span>
            <span>پلاک فرعی: {block?.subPlate || 'ثبت نشده'}</span>
            <span>تعداد طبقات: {block?.floorCount ?? 0}</span>
            <span>تعداد واحدها: {block?.unitCount ?? 0}</span>
          </div>
        </div>

        {!submitResult ? (
        <div className="business-block-form-tabs">
          <button type="button" className={activeTab === 'single' ? 'active' : ''} onClick={() => setActiveTab('single')}>
            <Square />
            افزودن تکی طبقه
          </button>
          <button type="button" className={activeTab === 'bulk' ? 'active' : ''} onClick={() => setActiveTab('bulk')}>
            <Table2 />
            افزودن تجمیعی طبقه
          </button>
        </div>
        ) : null}

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}

        {!submitResult && activeTab === 'single' ? (
          <div className="business-block-form-section">
            <FormField label="نام یا شماره طبقه" required hint="نام یا شماره‌ای را وارد کنید که طبقه با آن در پروژه شناخته می‌شود؛ مانند طبقه اول، همکف یا B2." invalid={showValidation && !name.trim()}>
              <input value={name} onChange={(event) => setName(event.target.value.slice(0, 30))} placeholder="مثلاً طبقه اول یا B2" />
            </FormField>
            <div className="business-block-form-pills">
              {['همکف', 'لابی', 'پارکینگ', 'زیرزمین'].map((preset) => (
                <button type="button" key={preset} aria-pressed={name === preset} onClick={() => setName(preset)}>
                  {preset}
                </button>
              ))}
            </div>
          </div>
        ) : !submitResult ? (
          <div className="business-block-form-section">
            <p className="business-block-form-help">Bulk برای طبقات تکراری مناسب است. برای نام‌های خاص مثل همکف یا لابی از حالت تکی استفاده کنید.</p>
            <div className="business-block-form-row">
              <FormField label="پیشوند نام‌گذاری" required hint="عبارت ثابت قبل از شماره طبقات." invalid={showValidation && !prefix.trim()}>
                <input value={prefix} onChange={(event) => setPrefix(event.target.value.slice(0, 30))} placeholder="مثلاً طبقه" />
              </FormField>
              <FormField label="از شماره" required hint="شماره شروع را وارد کنید." invalid={showValidation && !from.trim()}>
                <input value={from} onChange={(event) => setFrom(event.target.value)} placeholder="مثلاً 1" />
              </FormField>
              <FormField label="تا شماره" required hint="شماره پایان باید بزرگ‌تر یا مساوی شروع باشد." invalid={showValidation && !to.trim()}>
                <input value={to} onChange={(event) => setTo(event.target.value)} placeholder="مثلاً 12" />
              </FormField>
            </div>
            <div className="business-block-form-preview">
              {bulkRangeIsValid && floorPrefix ? (
                <>
                  <strong>پیش‌نمایش طبقات ایجادشونده</strong>
                  <p>
                    {previewNames.join('، ')}
                    {previewLast ? `، ...، ${previewLast}` : ''}
                  </p>
                  <span>{bulkCount} طبقه ایجاد خواهد شد.</span>
                </>
              ) : (
                <p>برای مشاهده پیش‌نمایش، پیشوند و بازه شماره‌گذاری معتبر را وارد کنید.</p>
              )}
            </div>
          </div>
        ) : null}

        {submitResult ? (
          <div className="business-block-form-success">
            <h2>{submitResult.mode === 'bulk' ? `${submitResult.count} طبقه ایجاد شد.` : 'طبقه با موفقیت ثبت شد.'}</h2>
            <p>{submitResult.mode === 'bulk' ? 'برای ادامه، لیست طبقات را بررسی کنید.' : 'اکنون می‌توانید واحدهای این طبقه را مدیریت کنید یا به لیست طبقات برگردید.'}</p>
            <div className="business-block-form-actions">
              <button type="button" className="business-dialog-secondary" onClick={() => router.push(`/business-settings/project/blocks/${blockId}`)}>
                مشاهده لیست طبقات
              </button>
              {submitResult.mode === 'single' && submitResult.entityId ? (
                <button type="button" className="business-dialog-secondary" onClick={() => router.push(`/business-settings/project/blocks/${blockId}/floors/${submitResult.entityId}`)}>
                  مدیریت واحدها
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {!submitResult ? <div className="business-block-form-actions">
          <button type="button" className="business-block-form-submit" onClick={submitFloor} disabled={saving}>
            {saving ? 'در حال ذخیره...' : activeTab === 'bulk' ? 'ایجاد طبقات' : 'افزودن طبقه'}
          </button>
        </div> : null}
      </div>
    </section>
  );
}

export function BusinessFloorDetail({ blockId, floorId }: { blockId: string; floorId: string }) {
  const searchParams = useSearchParams();
  const [floor, setFloor] = useState<{ name: string; blockName: string; mainPlate?: string | null; subPlate?: string | null } | null>(null);
  const [units, setUnits] = useState<UnitDto[]>([]);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [activeUnitType, setActiveUnitType] = useState<(typeof unitTypeTabs)[number]['value']>('unit');
  const [activeUsage, setActiveUsage] = useState('residential');
  const [openMenuId, setOpenMenuId] = useState('');

  useEffect(() => {
    fetch(`/api/business-settings/project/blocks/${blockId}/floors/${floorId}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = (await response.json()) as {
          floor?: { name: string; blockName: string; mainPlate?: string | null; subPlate?: string | null };
          units?: UnitDto[];
          message?: string;
        };
        if (!response.ok) throw new Error(data.message ?? 'دریافت جزئیات طبقه ناموفق بود.');
        setFloor(data.floor ?? null);
        setUnits(data.units ?? []);
      })
      .catch((err) => setMessage(err instanceof Error ? err.message : 'دریافت جزئیات طبقه ناموفق بود.'));
  }, [blockId, floorId]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (requestedTab === 'unit' || requestedTab === 'parking' || requestedTab === 'storage' || requestedTab === 'amenity') {
      setActiveUnitType(requestedTab);
    }
  }, [searchParams]);

  const normalizedQuery = query.trim();
  const floorUsageCounts = countUnitsByUsage(units);
  const unitTypeCounts = {
    unit: units.filter((unit) => (unit.category ?? 'unit') === 'unit').length,
    storage: units.filter((unit) => unit.category === 'storage').length,
    parking: units.filter((unit) => unit.category === 'parking').length,
    amenity: units.filter((unit) => unit.category === 'amenity').length,
  } satisfies Record<UnitCategory, number>;
  const categoryUnits = units.filter((unit) => (unit.category ?? 'unit') === activeUnitType);
  const usageFilteredUnits =
    activeUnitType === 'unit' && activeUsage ? categoryUnits.filter((unit) => (unit.usage ?? 'residential') === activeUsage) : categoryUnits;
  const filteredUnits = normalizedQuery ? usageFilteredUnits.filter((unit) => unit.name.includes(normalizedQuery)) : usageFilteredUnits;
  const plateText = [floor?.mainPlate ? `پلاک اصلی ${floor.mainPlate}` : null, floor?.subPlate ? `پلاک فرعی ${floor.subPlate}` : null].filter(Boolean).join(' | ');

  return (
    <section className="business-units-page" aria-label="لیست واحدها">
      <div className="business-units-topbar">
        <div className="business-units-panel">
          <div className="business-units-heading">
            <h1>{floor ? `${floor.blockName} | ${floor.name}` : 'لیست واحدها'}</h1>
            <span>{plateText || 'پلاک ثبت نشده'}</span>
          </div>
        </div>

        <div className="business-units-panel business-units-tabs-panel">
          <div className="business-units-type-tabs">
            {unitTypeTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button type="button" key={tab.value} className={activeUnitType === tab.value ? 'active' : ''} onClick={() => setActiveUnitType(tab.value)}>
                  <span className="business-units-type-icon">
                    <b>{unitTypeCounts[tab.value]}</b>
                    <Icon />
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="business-units-helper">این بخش برای ثبت واحدهای تجاری، اداری و مسکونی هر بلوک است. می‌توانید واحد جدید اضافه کنید و لیست تمام واحدهای ثبت‌شده را ببینید.</p>

        <div className="business-units-filter-head">
          <h2>فیلتر بر اساس نوع کاربری واحدها</h2>
          <div className="business-units-filter-tags" aria-label="فیلتر نوع کاربری">
            {unitUsageFilters.map((option) => (
              (() => {
                const count = floorUsageCounts[getUsageKey(option.value)];
                return (
                  <button
                    type="button"
                    key={option.value}
                    aria-pressed={activeUsage === option.value}
                    aria-disabled={count === 0}
                    className={count === 0 ? 'is-disabled' : undefined}
                    disabled={count === 0}
                    onClick={() => setActiveUsage((current) => (current === option.value ? '' : option.value))}
                  >
                    {formatCountLabel(count, getUsageDisplayLabel(option.value))}
                  </button>
                );
              })()
            ))}
          </div>
        </div>

        <div className="business-units-toolbar">
          <Link href={`/business-settings/project/blocks/${blockId}/floors/${floorId}/units/new?category=${activeUnitType}`} className="business-units-add">
            <Plus />
            افزودن {unitCategoryLabels[activeUnitType]}
          </Link>
          <label className="business-units-search">
            <Search />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو..." aria-label="جستجو در واحدها" />
          </label>
        </div>
      </div>

      {message ? <div className="business-blocks-state is-error">{message}</div> : null}

      <div className="business-units-cards">
        {categoryUnits.length === 0 ? <div className="business-blocks-state">هنوز {unitCategoryLabels[activeUnitType]} برای این طبقه ثبت نشده است.</div> : null}
        {categoryUnits.length > 0 && filteredUnits.length === 0 ? <div className="business-blocks-state">مورد مطابق جستجو پیدا نشد.</div> : null}
        {filteredUnits.map((unit, index) => {
          const display = getUnitDisplayData(unit, index);
          const statTags = getUnitStatTags(unit, display);
          return (
            <article className="business-unit-card" key={unit.id}>
              <div className="business-unit-card-cover">
                <span>{display.code}</span>
              </div>
              <div className="business-unit-card-body">
                <div className="business-unit-card-head">
                  <div>
                    <h3>نوع کاربری {display.usage}</h3>
                    <p>متراژ {display.area} متر مربع</p>
                  </div>
                  <div className="business-unit-card-actions">
                    <button
                      type="button"
                      className="business-unit-card-menu"
                      aria-label={`گزینه‌های ${unit.name}`}
                      onClick={() => setOpenMenuId((current) => (current === unit.id ? '' : unit.id))}
                    >
                      <MoreVertical />
                    </button>
                    {openMenuId === unit.id ? (
                      <div className="business-block-menu-popover business-unit-menu-popover">
                        <Link href={`/business-settings/project/blocks/${blockId}/floors/${floorId}/units/${unit.id}/edit`}>
                          <Pencil /> ویرایش
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="business-unit-tags">
                  {statTags.map((tag) => (
                    <span key={tag.label} className={tag.className}>
                      {tag.label}
                    </span>
                  ))}
                </div>
                <div className="business-unit-status-tags">
                  <span className="is-red">{display.saleStatus} ×</span>
                  <span className="is-peach">{display.deliveryStatus}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function BusinessUnitForm({ blockId, floorId, category, unitId }: { blockId: string; floorId: string; category?: string; unitId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEdit = Boolean(unitId);
  const initialCategory: UnitCategory = category === 'storage' || category === 'parking' || category === 'amenity' ? category : 'unit';
  const [unitCategory, setUnitCategory] = useState<UnitCategory>(initialCategory);
  const categoryLabel = unitCategoryLabels[unitCategory];
  const isMainUnit = unitCategory === 'unit';
  const isSimpleAsset = unitCategory === 'storage' || unitCategory === 'parking';
  const isAmenityUnit = unitCategory === 'amenity';
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [unitType, setUnitType] = useState(initialCategory === 'unit' ? unitTypeOptions[0] : '');
  const [usage, setUsage] = useState<(typeof unitUsageOptions)[number]['value'] | ''>('');
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [saleEnabled, setSaleEnabled] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState<'ready' | 'presale'>('ready');
  const [area, setArea] = useState('');
  const [balconyCount, setBalconyCount] = useState('0');
  const [bedroomCount, setBedroomCount] = useState('0');
  const [postalCode, setPostalCode] = useState('');
  const [direction, setDirection] = useState<(typeof directionOptions)[number]['value']>('unknown');
  const [areaPricingMode, setAreaPricingMode] = useState<(typeof unitAreaPricingOptions)[number]['value']>('unit-only');
  const [amenities, setAmenities] = useState<AmenityItem[]>([]);
  const [amenityDialogOpen, setAmenityDialogOpen] = useState(false);
  const [amenityTitle, setAmenityTitle] = useState('');
  const [amenityCount, setAmenityCount] = useState('1');
  const [baseInfo, setBaseInfo] = useState('');
  const [baseInfoDialogOpen, setBaseInfoDialogOpen] = useState(false);
  const [baseInfoDraft, setBaseInfoDraft] = useState('');
  const [parkingOptions, setParkingOptions] = useState<AssignmentOption[]>([]);
  const [storageOptions, setStorageOptions] = useState<AssignmentOption[]>([]);
  const [selectedParkingIds, setSelectedParkingIds] = useState<string[]>([]);
  const [selectedStorageIds, setSelectedStorageIds] = useState<string[]>([]);
  const [assignmentDialog, setAssignmentDialog] = useState<'parking' | 'storage' | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [showValidation, setShowValidation] = useState(false);
  const [amenityDialogError, setAmenityDialogError] = useState('');
  const [showAmenityValidation, setShowAmenityValidation] = useState(false);
  const usageSelected = !isMainUnit || Boolean(usage);
  const amenityTypeSelected = !isAmenityUnit || Boolean(unitType);
  const pendingAssignmentDialog = searchParams.get('assignment');
  const returnTarget = searchParams.get('returnTo');
  const draftStorageKey = `business-unit-form-draft:${blockId}:${floorId}:${unitId ?? 'new'}:${searchParams.get('category') ?? 'unit'}`;
  const draftRestoredRef = useRef(false);

  const resetQuickAssetForm = () => {
    return;
  };

  const persistDraft = () => {
    if (typeof window === 'undefined') return;
    const draft: UnitFormDraft = {
      unitCategory,
      activeTab,
      unitType,
      usage,
      name,
      prefix,
      from,
      to,
      saleEnabled,
      deliveryStatus,
      area,
      balconyCount,
      bedroomCount,
      postalCode,
      direction,
      areaPricingMode,
      amenities,
      baseInfo,
      baseInfoDraft,
      selectedParkingIds,
      selectedStorageIds,
    };
    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
  };

  const clearDraft = () => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(draftStorageKey);
  };

  const loadAssignmentOptions = async (selectedUnitId?: string) => {
    const response = await fetch(`/api/business-settings/project/blocks/${blockId}/floors/${floorId}/units`, { cache: 'no-store' });
    const data = (await response.json()) as {
      options?: { parking?: AssignmentOption[]; storage?: AssignmentOption[] };
      message?: string;
    };
    if (!response.ok) throw new Error(data.message ?? 'دریافت لیست پارکینگ و انباری ناموفق بود.');

    const nextParking = data.options?.parking ?? [];
    const nextStorage = data.options?.storage ?? [];
    setParkingOptions(nextParking);
    setStorageOptions(nextStorage);

    if (selectedUnitId) {
      setSelectedParkingIds(nextParking.filter((item) => item.assignedToUnitId === selectedUnitId).map((item) => item.id));
      setSelectedStorageIds(nextStorage.filter((item) => item.assignedToUnitId === selectedUnitId).map((item) => item.id));
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadFormData() {
      setLoading(isEdit);
      try {
        const response = await fetch(
          isEdit
            ? `/api/business-settings/project/blocks/${blockId}/floors/${floorId}/units/${unitId}`
            : `/api/business-settings/project/blocks/${blockId}/floors/${floorId}/units`,
          { cache: 'no-store' },
        );
        const data = (await response.json()) as {
          unit?: UnitDto;
          options?: { unitTypes?: string[]; parking?: AssignmentOption[]; storage?: AssignmentOption[] };
          message?: string;
        };
        if (!response.ok) throw new Error(data.message ?? 'دریافت اطلاعات ثبت واحد ناموفق بود.');
        if (cancelled) return;

        const parking = data.options?.parking ?? [];
        const storage = data.options?.storage ?? [];
        setParkingOptions(parking);
        setStorageOptions(storage);

        if (data.unit) {
          const nextCategory = (data.unit.category ?? 'unit') as UnitCategory;
          setUnitCategory(nextCategory);
          setUnitType(data.unit.unitType ?? (nextCategory === 'unit' ? unitTypeOptions[0] : ''));
          setUsage((data.unit.usage as (typeof unitUsageOptions)[number]['value'] | '') ?? '');
          setName(data.unit.name ?? '');
          setSaleEnabled(data.unit.saleEnabled !== false);
          setDeliveryStatus(data.unit.deliveryStatus === 'presale' ? 'presale' : 'ready');
          setArea(data.unit.area ? String(data.unit.area) : '');
          setBalconyCount(String(data.unit.balconyCount ?? 0));
          setBedroomCount(String(data.unit.bedroomCount ?? 0));
          setPostalCode(data.unit.postalCode ?? '');
          setDirection((data.unit.direction as (typeof directionOptions)[number]['value']) ?? 'unknown');
          setAreaPricingMode((data.unit.areaPricingMode as (typeof unitAreaPricingOptions)[number]['value']) ?? 'unit-only');
          setAmenities(Array.isArray(data.unit.amenities) ? data.unit.amenities : []);
          setBaseInfo(data.unit.baseInfo ?? '');
          setBaseInfoDraft(data.unit.baseInfo ?? '');
          setSelectedParkingIds(parking.filter((item) => item.assignedToUnitId === data.unit?.id).map((item) => item.id));
          setSelectedStorageIds(storage.filter((item) => item.assignedToUnitId === data.unit?.id).map((item) => item.id));
        }
      } catch (err) {
        if (!cancelled) setMessage(err instanceof Error ? err.message : 'دریافت اطلاعات ثبت واحد ناموفق بود.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFormData();

    return () => {
      cancelled = true;
    };
  }, [blockId, floorId, isEdit, unitId]);

  useEffect(() => {
    if (assignmentDialog) resetQuickAssetForm();
  }, [assignmentDialog]);

  useEffect(() => {
    if (pendingAssignmentDialog !== 'parking' && pendingAssignmentDialog !== 'storage') return;
    setAssignmentDialog(pendingAssignmentDialog);
    loadAssignmentOptions(isEdit ? unitId : undefined).catch((err) => {
      setMessage(err instanceof Error ? err.message : 'دریافت لیست پارکینگ و انباری ناموفق بود.');
    });
  }, [pendingAssignmentDialog]);

  useEffect(() => {
    if (loading || draftRestoredRef.current || !pendingAssignmentDialog) return;
    if (typeof window === 'undefined') return;
    const raw = window.sessionStorage.getItem(draftStorageKey);
    if (!raw) return;

    try {
      const draft = JSON.parse(raw) as UnitFormDraft;
      setUnitCategory(draft.unitCategory);
      setActiveTab(draft.activeTab);
      setUnitType(draft.unitType);
      setUsage(draft.usage);
      setName(draft.name);
      setPrefix(draft.prefix);
      setFrom(draft.from);
      setTo(draft.to);
      setSaleEnabled(draft.saleEnabled);
      setDeliveryStatus(draft.deliveryStatus);
      setArea(draft.area);
      setBalconyCount(draft.balconyCount);
      setBedroomCount(draft.bedroomCount);
      setPostalCode(draft.postalCode);
      setDirection(draft.direction);
      setAreaPricingMode(draft.areaPricingMode);
      setAmenities(Array.isArray(draft.amenities) ? draft.amenities : []);
      setBaseInfo(draft.baseInfo);
      setBaseInfoDraft(draft.baseInfoDraft);
      setSelectedParkingIds(Array.isArray(draft.selectedParkingIds) ? draft.selectedParkingIds : []);
      setSelectedStorageIds(Array.isArray(draft.selectedStorageIds) ? draft.selectedStorageIds : []);
      draftRestoredRef.current = true;
    } catch {
      window.sessionStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey, loading, pendingAssignmentDialog]);

  useEffect(() => {
    if (isEdit || draftRestoredRef.current || Boolean(pendingAssignmentDialog)) return;
    setUnitCategory(initialCategory);
    setUnitType(initialCategory === 'unit' ? unitTypeOptions[0] : '');
    setUsage('');
    setName('');
    setPrefix('');
    setFrom('');
    setTo('');
    setSaleEnabled(true);
    setDeliveryStatus('ready');
    setArea('');
    setBalconyCount('0');
    setBedroomCount('0');
    setPostalCode('');
    setDirection('unknown');
    setAreaPricingMode('unit-only');
    setAmenities([]);
    setBaseInfo('');
    setBaseInfoDraft('');
    setSelectedParkingIds([]);
    setSelectedStorageIds([]);
    setMessage('');
  }, [initialCategory, isEdit, pendingAssignmentDialog]);

  const applyUnitType = (value: string) => {
    setUnitType(value);
    if (value === 'تیپ A') {
      setArea('100');
      setBedroomCount('2');
      setBalconyCount('1');
    }
    if (value === 'تیپ B') {
      setArea('120');
      setBedroomCount('3');
      setBalconyCount('1');
    }
    if (value === 'تیپ C') {
      setArea('80');
      setBedroomCount('1');
      setBalconyCount('0');
    }
  };

  const addAmenity = () => {
    const title = amenityTitle.trim();
    const count = Math.max(1, Math.floor(Number(amenityCount) || 1));
    const errors: Record<string, string> = {};
    if (!title) errors.amenityTitle = REQUIRED_MESSAGE;
    if (!amenityCount.trim()) errors.amenityCount = REQUIRED_MESSAGE;
    if (Object.keys(errors).length > 0) {
      setShowAmenityValidation(true);
      setAmenityDialogError(buildValidationSummary(errors, { amenityTitle: 'عنوان امکانات', amenityCount: 'تعداد' }, 'اطلاعات امکانات واحد کامل نیست.'));
      return;
    }
    setAmenities((current) => [...current, { title, count }]);
    setAmenityTitle('');
    setAmenityCount('1');
    setAmenityDialogError('');
    setShowAmenityValidation(false);
    setAmenityDialogOpen(false);
  };

  const toggleAssignment = (kind: 'parking' | 'storage', option: AssignmentOption) => {
    if (option.assignedToUnitId) return;
    const setter = kind === 'parking' ? setSelectedParkingIds : setSelectedStorageIds;
    setter((current) => (current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id]));
  };

  const submitQuickAsset = async () => {
    return;
  };

  const submitUnit = async () => {
    const errors: Record<string, string> = {};
    if (activeTab === 'single') {
      if (!name.trim()) errors.name = REQUIRED_MESSAGE;
      if (!area.trim()) errors.area = REQUIRED_MESSAGE;
      if (isMainUnit && !unitType.trim()) errors.unitType = REQUIRED_MESSAGE;
      if (isMainUnit && !usage.trim()) errors.usage = REQUIRED_MESSAGE;
      if (isAmenityUnit && !unitType.trim()) errors.amenityType = REQUIRED_MESSAGE;
    } else {
      if (!prefix.trim()) errors.prefix = REQUIRED_MESSAGE;
      if (!from.trim()) errors.from = REQUIRED_MESSAGE;
      if (!to.trim()) errors.to = REQUIRED_MESSAGE;
    }
    if (Object.keys(errors).length > 0) {
      setShowValidation(true);
      setMessage(buildValidationSummary(errors, { name: 'نام/مشخصه/شماره', area: `متراژ ${categoryLabel}`, unitType: 'تیپ واحد', usage: 'نوع کاربری', amenityType: 'نوع فضا', prefix: 'پیشوند نام‌گذاری', from: 'از', to: 'تا' }, 'اطلاعات واحد کامل نیست.'));
      return;
    }

    setSaving(true);
    setMessage('');
    setShowValidation(false);

    const payload = {
      mode: activeTab,
      category: unitCategory,
      unitType,
      usage: usage || 'residential',
      name,
      prefix,
      from,
      to,
      saleEnabled,
      deliveryStatus,
      area,
      balconyCount,
      bedroomCount,
      postalCode,
      amenities,
      baseInfo,
      direction,
      areaPricingMode,
      parkingIds: activeTab === 'single' && (isMainUnit || isAmenityUnit) ? selectedParkingIds : [],
      storageIds: activeTab === 'single' && (isMainUnit || isAmenityUnit) ? selectedStorageIds : [],
    };

    try {
      const response = await fetch(isEdit ? `/api/business-settings/project/blocks/${blockId}/floors/${floorId}/units/${unitId}` : `/api/business-settings/project/blocks/${blockId}/floors/${floorId}/units`, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { message?: string; createdIds?: string[] };
      if (!response.ok) throw new Error(data.message ?? (isEdit ? 'ویرایش واحد ناموفق بود.' : 'ثبت واحد ناموفق بود.'));
      clearDraft();
      const nextReturnTarget = (() => {
        if (!returnTarget) return null;
        const url = new URL(returnTarget, window.location.origin);
        url.searchParams.set('selectedBlock', blockId);
        if (!isEdit && data.createdIds?.[0]) url.searchParams.set('selectedUnit', data.createdIds[0]);
        return `${url.pathname}${url.search}${url.hash}`;
      })();
      router.push(
        nextReturnTarget
          ? nextReturnTarget
          : `/business-settings/project/blocks/${blockId}/floors/${floorId}?tab=${unitCategory}`,
      );
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : isEdit ? 'ویرایش واحد ناموفق بود.' : 'ثبت واحد ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const assignmentOptions = assignmentDialog === 'parking' ? parkingOptions : storageOptions;
  const selectedAssignmentIds = assignmentDialog === 'parking' ? selectedParkingIds : selectedStorageIds;
  const selectedParkingItems = parkingOptions
    .filter((item) => selectedParkingIds.includes(item.id))
    .map((item) => ({ id: item.id, name: item.name }));
  const selectedStorageItems = storageOptions
    .filter((item) => selectedStorageIds.includes(item.id))
    .map((item) => ({ id: item.id, name: item.name }));
  const returnToAssignmentUrl = (kind: 'parking' | 'storage') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('assignment', kind);
    return `${pathname}?${params.toString()}`;
  };
  const hideAssignmentDialog = () => {
    setAssignmentDialog(null);
  };
  const closeAssignmentDialog = () => {
    setAssignmentDialog(null);
    if (!searchParams.get('assignment')) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('assignment');
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  return (
    <section className="business-unit-form-page" aria-label={`${isEdit ? 'ویرایش' : 'ثبت'} ${categoryLabel}`}>
      <div className="business-block-form-card business-unit-form-card">
        <div className="business-block-form-tabs">
          <button type="button" className={activeTab === 'single' ? 'active' : ''} onClick={() => setActiveTab('single')}>
            <Square />
            {isEdit ? 'ویرایش تکی' : 'افزودن تکی'}
          </button>
          <button type="button" className={activeTab === 'bulk' ? 'active' : ''} onClick={() => setActiveTab('bulk')} disabled={isEdit}>
            <Table2 />
            افزودن تجمیعی
          </button>
        </div>

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت اطلاعات واحد...</div> : null}

        <div className="business-unit-form-grid">
          {isMainUnit ? (
            <FieldGroup label="تیپ واحد" required invalid={showValidation && isMainUnit && !unitType.trim()}>
              <InlineSelect
                value={unitType}
                onSelect={applyUnitType}
                options={unitTypeOptions.map((option) => ({ value: option, label: option }))}
                placeholder="انتخاب تیپ واحد"
                searchPlaceholder="جستجو در تیپ‌ها..."
                emptyText="تیپی پیدا نشد"
              />
            </FieldGroup>
          ) : null}

          {isMainUnit ? (
            <div className={`business-unit-form-fieldset ${showValidation && isMainUnit && !usage.trim() ? 'rounded-xl border border-rose-300 bg-rose-50/30 p-2' : ''}`}>
              <span>نوع کاربری</span>
              <div className="business-unit-choice-tags">
                {unitUsageOptions.map((option) => (
                  <TagPill key={option.value} label={option.label} active={usage === option.value} onClick={() => setUsage(option.value)} />
                ))}
              </div>
            </div>
          ) : null}

          {isAmenityUnit ? (
            <div className={`business-unit-form-fieldset ${showValidation && isAmenityUnit && !unitType.trim() ? 'rounded-xl border border-rose-300 bg-rose-50/30 p-2' : ''}`}>
              <span>نوع فضا</span>
              <div className="business-unit-choice-tags">
                {amenitySpaceTypeOptions.map((option) => (
                  <TagPill key={option} label={option} active={unitType === option} onClick={() => setUnitType(option)} />
                ))}
              </div>
            </div>
          ) : null}

          {isMainUnit && !usageSelected ? <p className="business-unit-form-hint">برای نمایش ادامه فرم، نوع کاربری واحد را انتخاب کنید.</p> : null}
          {isAmenityUnit && !amenityTypeSelected ? <p className="business-unit-form-hint">برای ثبت واحد رفاهی، نوع فضا را انتخاب کنید.</p> : null}

          {usageSelected ? (
            <>
              {activeTab === 'single' ? (
                <FieldGroup label="نام/مشخصه/شماره" required invalid={showValidation && !name.trim()}>
                  <FormTextInput
                    invalid={showValidation && !name.trim()}
                    value={name}
                    onChange={(value) => setName(value.slice(0, 30))}
                    placeholder={unitCategory === 'unit' ? 'مثلا A1 یا ۱۰۱' : `نام، مشخصه یا شماره ${categoryLabel}`}
                  />
                </FieldGroup>
              ) : (
                <div className="business-unit-bulk-row">
                  <FieldGroup label="پیشوند نام گذاری" required invalid={showValidation && !prefix.trim()}>
                    <FormTextInput value={prefix} onChange={(value) => setPrefix(value.slice(0, 30))} placeholder="مثلا A" invalid={showValidation && !prefix.trim()} />
                  </FieldGroup>
                  <FieldGroup label="از" required invalid={showValidation && !from.trim()}>
                    <FormTextInput value={from} onChange={setFrom} placeholder="1" invalid={showValidation && !from.trim()} />
                  </FieldGroup>
                  <FieldGroup label="تا" required invalid={showValidation && !to.trim()}>
                    <FormTextInput value={to} onChange={setTo} placeholder="10" invalid={showValidation && !to.trim()} />
                  </FieldGroup>
                </div>
              )}

              {isSimpleAsset ? (
                <>
                  <FieldGroup label={`متراژ ${categoryLabel}`} required invalid={showValidation && !area.trim()}>
                    <FormTextInput value={area} onChange={setArea} placeholder="مثلا 12" invalid={showValidation && !area.trim()} />
                  </FieldGroup>
                  <BusinessSwitch label={`این ${categoryLabel} فروشی است؟`} checked={saleEnabled} onChange={setSaleEnabled} onText="فروش" offText="غیر قابل فروش" />
                </>
              ) : null}

              {isMainUnit ? (
                <>
                  <BusinessSwitch label="این واحد فروشی است؟" checked={saleEnabled} onChange={setSaleEnabled} onText="فروش" offText="غیر فروش" />
                  <BusinessSwitch
                    label="وضعیت تحویل"
                    checked={deliveryStatus === 'ready'}
                    onChange={(checked) => setDeliveryStatus(checked ? 'ready' : 'presale')}
                    onText="آماده تحویل"
                    offText="پیش فروش"
                  />

                  <FieldGroup label="متراژ" required invalid={showValidation && !area.trim()}>
                    <FormTextInput value={area} onChange={setArea} placeholder="مثلا 100" invalid={showValidation && !area.trim()} />
                  </FieldGroup>

                  <div className="business-unit-form-fieldset">
                    <span>نحوه اثرگذاری متراژ در قیمت‌گذاری</span>
                    <TagPills
                      options={unitAreaPricingOptions.map((option) => ({ value: option.value, label: option.label }))}
                      value={areaPricingMode}
                      onChange={(value) => setAreaPricingMode(value)}
                      className="business-unit-choice-tags business-unit-choice-tags-radio"
                    />
                    <p className="business-unit-assignment-summary">
                      {unitAreaPricingOptions.find((option) => option.value === areaPricingMode)?.hint}
                    </p>
                    <p className="business-unit-form-hint">
                      این تنظیم مشخص می‌کند در مرحله قیمت‌گذاری پیش‌نویس، متراژ واحد به‌تنهایی یا به‌همراه انباری و پارکینگ در مبنای محاسبه مبلغ هر متر لحاظ شود.
                    </p>
                  </div>

                  <div className="business-unit-bulk-row">
                    <FieldGroup label="تعداد بالکن">
                      <FormTextInput value={balconyCount} onChange={setBalconyCount} />
                    </FieldGroup>
                    <FieldGroup label="تعداد خواب">
                      <FormTextInput value={bedroomCount} onChange={setBedroomCount} />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="کد پستی">
                    <FormTextInput value={postalCode} onChange={(value) => setPostalCode(value.slice(0, 20))} placeholder="کد پستی واحد" />
                  </FieldGroup>

                  <div className="business-unit-form-fieldset">
                    <button type="button" className="business-unit-next-action" onClick={() => setAmenityDialogOpen(true)}>
                      افزودن امکانات واحد
                      <ChevronLeft />
                    </button>
                    <div className="business-unit-selected-tags">
                      {amenities.map((item) => (
                        <span key={`${item.title}-${item.count}`}>
                          {item.title} {item.count}
                          <button type="button" onClick={() => setAmenities((current) => current.filter((entry) => entry !== item))}>
                            <X />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="business-unit-form-fieldset">
                    <span>جهت واحد</span>
                    <div className="business-unit-choice-tags">
                      {directionOptions.map((option) => (
                        <TagPill key={option.value} label={option.label} active={direction === option.value} onClick={() => setDirection(option.value)} />
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              {isAmenityUnit ? (
                <>
                  <BusinessSwitch label="این واحد فروشی است؟" checked={saleEnabled} onChange={setSaleEnabled} onText="فروش" offText="غیر قابل فروش" />
                  <BusinessSwitch
                    label="وضعیت تحویل"
                    checked={deliveryStatus === 'ready'}
                    onChange={(checked) => setDeliveryStatus(checked ? 'ready' : 'presale')}
                    onText="آماده تحویل"
                    offText="پیش فروش"
                  />
                  <div className="business-unit-form-fieldset">
                    <button
                      type="button"
                      className="business-unit-next-action"
                      onClick={() => {
                        setBaseInfoDraft(baseInfo);
                        setBaseInfoDialogOpen(true);
                      }}
                    >
                      افزودن اطلاعات پایه
                      <ChevronLeft />
                    </button>
                    {baseInfo ? (
                      <div className="business-unit-selected-tags">
                        <span>
                          {baseInfo}
                          <button type="button" onClick={() => setBaseInfo('')}>
                            <X />
                          </button>
                        </span>
                      </div>
                    ) : (
                      <p className="business-unit-assignment-summary">توضیحاتی ثبت نشده است.</p>
                    )}
                  </div>
                </>
              ) : null}

              {activeTab === 'single' && (isMainUnit || isAmenityUnit) ? (
                <>
                  <AssignmentSelector
                    title={`انتخاب پارکینگ ${categoryLabel}`}
                    items={selectedParkingItems}
                    onOpen={() => setAssignmentDialog('parking')}
                    onRemove={(id) => setSelectedParkingIds((current) => current.filter((item) => item !== id))}
                  />
                  <AssignmentSelector
                    title={`انتخاب انباری ${categoryLabel}`}
                    items={selectedStorageItems}
                    onOpen={() => setAssignmentDialog('storage')}
                    onRemove={(id) => setSelectedStorageIds((current) => current.filter((item) => item !== id))}
                  />
                </>
              ) : null}
            </>
          ) : null}
        </div>

        {usageSelected && amenityTypeSelected && !loading ? <div className="business-block-form-actions">
          <button type="button" className="business-block-form-submit" onClick={submitUnit} disabled={saving}>
            {saving ? (isEdit ? 'در حال ذخیره...' : 'در حال افزودن...') : isEdit ? `ذخیره ${categoryLabel}` : activeTab === 'bulk' ? `افزودن تجمیعی ${categoryLabel}` : `افزودن ${categoryLabel}`}
          </button>
        </div> : null}
      </div>

      {amenityDialogOpen ? (
        <Dialog title="ثبت امکانات واحد" onClose={() => setAmenityDialogOpen(false)}>
          {amenityDialogError ? <div className="business-blocks-state is-error">{amenityDialogError}</div> : null}
          <FieldGroup label="عنوان امکانات" required invalid={showAmenityValidation && !amenityTitle.trim()}>
            <FormTextInput value={amenityTitle} onChange={(value) => setAmenityTitle(value.slice(0, 40))} placeholder="مثلا آسانسور اختصاصی" invalid={showAmenityValidation && !amenityTitle.trim()} />
          </FieldGroup>
          <FieldGroup label="تعداد" required invalid={showAmenityValidation && !amenityCount.trim()}>
            <FormTextInput value={amenityCount} onChange={setAmenityCount} invalid={showAmenityValidation && !amenityCount.trim()} />
          </FieldGroup>
          <div className="business-dialog-actions">
            <button type="button" className="business-block-form-submit" onClick={addAmenity}>
              افزودن
            </button>
          </div>
        </Dialog>
      ) : null}

      {assignmentDialog ? (
        <Dialog title={assignmentDialog === 'parking' ? 'انتخاب پارکینگ واحد' : 'انتخاب انباری واحد'} onClose={closeAssignmentDialog}>
          <div className="business-unit-form-fieldset">
            <Link
              href={`/business-settings/project/blocks/${blockId}/floors/${floorId}/units/new?category=${assignmentDialog}&returnTo=${encodeURIComponent(returnToAssignmentUrl(assignmentDialog))}`}
              className="business-unit-next-action"
              onClick={() => {
                persistDraft();
                draftRestoredRef.current = false;
                hideAssignmentDialog();
              }}
            >
              {assignmentDialog === 'parking' ? 'افزودن پارکینگ جدید' : 'افزودن انباری جدید'}
              <ChevronLeft />
            </Link>
            <p className="business-unit-assignment-summary">
              {assignmentDialog === 'parking'
                ? 'اگر پارکینگ موردنظر در لیست نیست، به صفحه ثبت بروید و بعد از ذخیره به همین فرم برگردید.'
                : 'اگر انباری موردنظر در لیست نیست، به صفحه ثبت بروید و بعد از ذخیره به همین فرم برگردید.'}
            </p>
          </div>
          <div className="business-unit-assignment-tags">
            {assignmentOptions.length ? (
              assignmentOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  aria-pressed={selectedAssignmentIds.includes(option.id)}
                  disabled={Boolean(option.assignedToUnitId)}
                  onClick={() => toggleAssignment(assignmentDialog, option)}
                >
                  {option.name}
                </button>
              ))
            ) : (
              <p>موردی برای انتخاب ثبت نشده است.</p>
            )}
          </div>
          <div className="business-dialog-actions">
            <button type="button" className="business-block-form-submit" onClick={closeAssignmentDialog}>
              تایید
            </button>
          </div>
        </Dialog>
      ) : null}

      {baseInfoDialogOpen ? (
        <Dialog title="اطلاعات پایه" onClose={() => setBaseInfoDialogOpen(false)}>
          <label className="business-block-form-field">
            <span>توضیحات</span>
            <textarea value={baseInfoDraft} onChange={(event) => setBaseInfoDraft(event.target.value.slice(0, 500))} placeholder="توضیحات اطلاعات پایه را وارد کنید." />
          </label>
          <div className="business-dialog-actions">
            <button
              type="button"
              className="business-block-form-submit"
              onClick={() => {
                setBaseInfo(baseInfoDraft.trim());
                setBaseInfoDialogOpen(false);
              }}
            >
              افزودن
            </button>
          </div>
        </Dialog>
      ) : null}
    </section>
  );
}

function BusinessSwitch({
  label,
  checked,
  onChange,
  onText,
  offText,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onText: string;
  offText: string;
}) {
  return (
    <div className="business-unit-switch-row">
      <span>{label}</span>
      <button type="button" className="business-switch" aria-pressed={checked} onClick={() => onChange(!checked)}>
        <span className="business-switch-option is-on">{onText}</span>
        <span className="business-switch-option is-off">{offText}</span>
      </button>
    </div>
  );
}

function AssignmentSelector({
  title,
  items,
  onOpen,
  onRemove,
}: {
  title: string;
  items: Array<{ id: string; name: string }>;
  onOpen: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="business-unit-form-fieldset">
      <button type="button" className="business-unit-next-action" onClick={onOpen}>
        {title}
        <ChevronLeft />
      </button>
      {items.length ? (
        <div className="business-unit-selected-tags">
          {items.map((item) => (
            <span key={item.id}>
              {item.name}
              <button type="button" onClick={() => onRemove(item.id)} aria-label={`حذف ${item.name}`}>
                <X />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="business-unit-assignment-summary">موردی انتخاب نشده است.</p>
      )}
    </div>
  );
}
function FormField({
  label,
  required,
  hint,
  children,
  invalid = false,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  invalid?: boolean;
}) {
  return (
    <label className={`business-block-form-field ${invalid ? 'rounded-xl border border-rose-300 bg-rose-50/30 p-2' : ''}`}>
      <span>
        {label}
        {required ? <i>*</i> : null}
      </span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function Dialog({ title, subtitle, children, onClose }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="business-dialog-backdrop" role="dialog" aria-modal="true">
      <div className="business-dialog">
        <button type="button" className="business-dialog-close" onClick={onClose} aria-label="بستن">
          <X />
        </button>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
}

