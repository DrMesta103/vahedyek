'use client';

import Link from 'next/link';
import { useEffect, useState, type ElementType, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
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
  Square,
  Table2,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { FieldGroup, FormTextInput, InlineSelect, TagPill } from '../../contracts/new/_components/ContractFormPrimitives';

type BlockDto = {
  id: string;
  name: string;
  mainPlate: string;
  subPlate: string;
  unitCount?: number;
  floorCount?: number;
};

type ProjectPlateDto = {
  id: string;
  mainPlate: string;
  subPlates: string[];
};

type FloorDto = {
  id: string;
  name: string;
  unitCount: number;
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

type UnitCategory = 'unit' | 'storage' | 'parking' | 'amenity';

const ownershipOptions = [
  { value: 'rental', label: 'استیجاری' },
  { value: 'endowment', label: 'اوقافی' },
  { value: 'registered', label: 'ثبتی ملکی' },
] as const;

const structureOptions = [
  { value: 'housing-foundation', label: 'بنیاد مسکن' },
  { value: 'public-private-company', label: 'شرکت‌های خصوصی سهامی عام' },
  { value: 'other', label: 'سایر' },
  { value: 'national-housing', label: 'مسکن ملی' },
  { value: 'private-company', label: 'شرکت‌های خصوصی سهامی خاص' },
  { value: 'personal', label: 'شخصی ساز' },
  { value: 'mehr', label: 'مسکن مهر' },
  { value: 'cooperative', label: 'تعاونی' },
] as const;

const infoItems: {
  title: string;
  description: string;
  icon: ElementType;
  href?: string;
}[] = [
  {
    title: 'گزارشات اطلاعات مجتمع',
    description: 'نمایش کلی از اطلاعات مجتمع مانند ثبت واحدها و طبقات مجتمع',
    icon: ClipboardList,
  },
  {
    title: 'مشخصات فنی پروژه',
    description: 'کابینت، سرامیک، سیستم سرمایش و گرمایش',
    icon: Wrench,
  },
  {
    title: 'فهرست بلوک‌ها',
    description: 'نمایش لیست بلوک‌های مجتمع',
    icon: Home,
    href: '/business-settings/project/blocks',
  },
  {
    title: 'فایل‌ها',
    description: 'بارگذاری اسناد تکمیلی مانند نقشه‌ها، پروانه ساخت، گزارش‌های فنی و عکس‌های رسمی',
    icon: FileText,
  },
  {
    title: 'پلاک اصلی / پلاک فرعی',
    description: 'پلاک اصلی: ۱۲۵ (پلاک فرعی ۱۰)، پلاک اصلی: ۱ ... بیشتر',
    icon: Grid2X2,
  },
  {
    title: 'آدرس',
    description: 'پونک گلزار سوم',
    icon: MapPin,
  },
  {
    title: 'تیپ‌های واحد',
    description: 'فهرست تیپ‌های واحد مجتمع',
    icon: Building2,
  },
] as const;

const usageFilterOptions = [
  { value: 'residential', label: '۹ مسکونی' },
  { value: 'commercial', label: '۱ تجاری' },
  { value: 'office', label: '۰ اداری' },
  { value: 'parking', label: '۸ پارکینگ' },
  { value: 'storage', label: '۶ انباری' },
  { value: 'welfare', label: '۸ رفاهی' },
] as const;

const blockUsageTags = ['رفاهی', 'پارکینگ', 'اداری', 'تجاری', 'مسکونی'];
const floorUsageTags = ['مسکونی', 'تجاری', 'اداری', 'پارکینگ', 'انباری', 'رفاهی'];

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

const unitUsageFilters = [
  { value: 'residential', label: '۵ مسکونی' },
  { value: 'commercial', label: '۱ تجاری' },
  { value: 'office', label: '۱ اداری' },
] as const;

const unitUsageLabels = ['مسکونی', 'مسکونی', 'مسکونی', 'اداری', 'تجاری', 'مسکونی'];
const unitTypeOptions = ['تیپ A', 'تیپ B', 'تیپ C', 'بدون تیپ'];
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
  const [structure, setStructure] = useState<(typeof structureOptions)[number]['value']>('cooperative');

  return (
    <section className="business-project-page" aria-label="پروفایل مجتمع">
      <div className="business-project-card">
        <div className="business-project-avatar" aria-hidden="true">
          <Building2 />
        </div>

        <div className="business-project-title-row">
          <button type="button" className="business-project-edit" aria-label="ویرایش" title="ویرایش">
            <Pencil />
          </button>
          <h1>آسمان شب</h1>
        </div>

        <div className="business-project-section">
          <h2>نوع مالکیت عرضه</h2>
          <div className="business-project-tags" role="radiogroup" aria-label="نوع مالکیت">
            {ownershipOptions.map((option) => (
              <TagPill key={option.value} label={option.label} active={ownership === option.value} onClick={() => setOwnership(option.value)} />
            ))}
          </div>
          <p>وضعیت مالکیت زمین یا بنا را مشخص کنید. این مورد در قراردادها و اسناد رسمی لحاظ می‌شود</p>
        </div>

        <div className="business-project-section">
          <h2>نوع ساخت</h2>
          <div className="business-project-tags" role="radiogroup" aria-label="نوع ساخت">
            {structureOptions.map((option) => (
              <TagPill key={option.value} label={option.label} active={structure === option.value} onClick={() => setStructure(option.value)} />
            ))}
          </div>
          <p>شیوه یا نهاد اصلی سازنده پروژه را مشخص کنید</p>
        </div>

        <div className="business-project-info-grid" aria-label="بخش‌های اطلاعاتی">
          {infoItems.map((item) => {
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

            if (item.href) {
              return (
                <Link href={item.href} key={item.title} className="business-project-info-item">
                  {content}
                </Link>
              );
            }

            return (
              <button type="button" key={item.title} className="business-project-info-item">
                {content}
              </button>
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
  const filteredBlocks = blocks.filter((block) => {
    const matchesQuery = normalizedQuery ? block.name.includes(normalizedQuery) || getPlateText(block).includes(normalizedQuery) : true;
    return matchesQuery;
  });

  const reloadBlocks = async () => {
    const response = await fetch('/api/business-settings/project/blocks', { cache: 'no-store' });
    const data = (await response.json()) as { blocks?: BlockDto[]; message?: string };
    if (!response.ok) throw new Error(data.message ?? 'دریافت فهرست بلوک‌ها ناموفق بود.');
    setBlocks(data.blocks ?? []);
  };

  const copyBlock = async () => {
    if (!copySource) return;
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
              <button
                type="button"
                key={option.value}
                aria-pressed={activeUsage === option.value}
                onClick={() => setActiveUsage((current) => (current === option.value ? '' : option.value))}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p>با انتخاب نوع کاربری، بلوک‌هایی که با این نوع کاربری مطابقت دارند نمایش داده می‌شوند. اعداد نشان‌دهنده تعداد واحدهای ثبت شده برای هر نوع کاربری هستند.</p>
        </div>

        <div className="business-blocks-toolbar">
          <Link href="/business-settings/project/blocks/new" className="business-blocks-add">
            <Plus />
            ثبت بلوک
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
                  {blockUsageTags.map((tag) => (
                    <span key={tag}>o {tag}</span>
                  ))}
                </div>

                <div className="business-block-report">
                  <div>
                    <h4>گزارش مالی و پیشرفت فیزیکی پروژه</h4>
                    <p>برای شروع می‌توانید اطلاعات پیشرفت را ثبت کنید.</p>
                    <span className="business-block-report-status">
                      <i>i</i>
                      تکمیل نشده
                    </span>
                  </div>
                  <ChevronLeft aria-hidden="true" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      {copySource ? (
        <Dialog title="کپی بلوک" subtitle="یک مشخصه جدید برای نسخه کپی‌شده وارد کنید." onClose={() => setCopySource(null)}>
          <FormField label="مشخصه بلوک" required>
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
  const isEdit = Boolean(blockId);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mainPlate, setMainPlate] = useState('');
  const [subPlate, setSubPlate] = useState('');
  const [plates, setPlates] = useState<ProjectPlateDto[]>([]);
  const [plateDialogOpen, setPlateDialogOpen] = useState(false);
  const [newMainPlate, setNewMainPlate] = useState('');
  const [newSubPlate, setNewSubPlate] = useState('');
  const [newSubPlates, setNewSubPlates] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const selectedPlate = plates.find((plate) => plate.mainPlate === mainPlate);
  const availableSubPlates = selectedPlate?.subPlates ?? [];

  const loadPlates = async () => {
    const response = await fetch('/api/business-settings/project/plates', { cache: 'no-store' });
    const data = (await response.json()) as { plates?: ProjectPlateDto[]; message?: string };
    if (!response.ok) throw new Error(data.message ?? 'دریافت پلاک‌ها ناموفق بود.');
    setPlates(data.plates ?? []);
  };

  useEffect(() => {
    loadPlates().catch((err) => setMessage(err instanceof Error ? err.message : 'دریافت پلاک‌ها ناموفق بود.'));
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

  const submit = async () => {
    setSaving(true);
    setMessage('');

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
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? 'ثبت اطلاعات بلوک ناموفق بود.');

      router.push('/business-settings/project/blocks');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ثبت اطلاعات بلوک ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const submitPlate = async () => {
    setMessage('');
    const subPlates = newSubPlate.trim() ? [...newSubPlates, newSubPlate.trim()] : newSubPlates;
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
        <div className="business-block-form-tabs">
          <button type="button" className={activeTab === 'single' ? 'active' : ''} onClick={() => setActiveTab('single')} disabled={isEdit}>
            <Square />
            ثبت تکی
          </button>
          <button type="button" className={activeTab === 'bulk' ? 'active' : ''} onClick={() => setActiveTab('bulk')} disabled={isEdit}>
            <Table2 />
            ثبت تجمیعی
          </button>
        </div>

        {loading ? <div className="business-blocks-state">در حال دریافت اطلاعات بلوک...</div> : null}
        {message ? <div className="business-blocks-state is-error">{message}</div> : null}

        {!loading ? (
          <>
            {activeTab === 'single' || isEdit ? (
              <div className="business-block-form-section">
                <p className="business-block-form-help">{isEdit ? 'اطلاعات بلوک را ویرایش کنید.' : 'برای تعریف یک بلوک به‌صورت جداگانه استفاده کنید.'}</p>
                <FormField label="مشخصه بلوک" required>
                  <input value={name} onChange={(event) => setName(event.target.value.slice(0, 30))} placeholder="مشخصه بلوک را وارد کنید." />
                  <span className="business-block-form-counter">{name.length} / ۳۰</span>
                </FormField>
              </div>
            ) : (
              <div className="business-block-form-section">
                <p className="business-block-form-help">این حالت برای ایجاد و نام‌گذاری چند بلوک به‌صورت همزمان استفاده می‌شود.</p>
                <div className="business-block-form-row">
                  <FormField label="پیشوند نام‌گذاری" required>
                    <input value={prefix} onChange={(event) => setPrefix(event.target.value.slice(0, 30))} placeholder="مانند A" />
                    <span className="business-block-form-counter">{prefix.length} / ۳۰</span>
                  </FormField>
                  <FormField label="از" required hint="شماره‌گذاری مانند از ۲ تا ۵">
                    <input value={from} onChange={(event) => setFrom(event.target.value)} placeholder="مثلا ۲" />
                  </FormField>
                  <FormField label="تا" required>
                    <input value={to} onChange={(event) => setTo(event.target.value)} placeholder="مثلا ۵" />
                  </FormField>
                </div>
              </div>
            )}

            <div className="business-block-form-section">
              <div className="business-block-form-section-title">
                <h2>پلاک اصلی</h2>
                <button type="button" className="business-block-form-soft-button" onClick={() => setPlateDialogOpen(true)}>
                  <Plus />
                  ثبت پلاک
                </button>
              </div>
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
                <h3>پلاک فرعی</h3>
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
            </div>

            <div className="business-block-form-actions">
              <button type="button" className="business-block-form-submit" onClick={submit} disabled={saving}>
                {saving ? 'در حال ثبت...' : 'ثبت'}
              </button>
            </div>
          </>
        ) : null}
      </div>
      {plateDialogOpen ? (
        <Dialog title="پلاک‌های اصلی و فرعی" subtitle="برای هر پلاک اصلی می‌توانید چند پلاک فرعی ثبت کنید." onClose={() => setPlateDialogOpen(false)}>
          <div className="business-plate-dialog-fields">
            <FormField label="پلاک اصلی" required>
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
            <FormField label="پلاک فرعی" required>
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
              ثبت
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
  const [blockName, setBlockName] = useState('');
  const [floors, setFloors] = useState<FloorDto[]>([]);
  const [query, setQuery] = useState('');
  const [activeUsage, setActiveUsage] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadFloors = async () => {
    const response = await fetch(`/api/business-settings/project/blocks/${blockId}/floors`, { cache: 'no-store' });
    const data = (await response.json()) as { block?: { name: string }; floors?: FloorDto[]; message?: string };
    if (!response.ok) throw new Error(data.message ?? 'دریافت طبقات ناموفق بود.');
    setBlockName(data.block?.name ?? '');
    setFloors(data.floors ?? []);
  };

  useEffect(() => {
    loadFloors()
      .catch((err) => setMessage(err instanceof Error ? err.message : 'دریافت طبقات ناموفق بود.'))
      .finally(() => setLoading(false));
  }, [blockId]);

  const normalizedQuery = query.trim();
  const filteredFloors = normalizedQuery ? floors.filter((floor) => floor.name.includes(normalizedQuery)) : floors;

  return (
    <section className="business-blocks-page business-blocks-page-yellow" aria-label="جزئیات بلوک">
      <div className="business-blocks-shell">
        <div className="business-blocks-filter-card">
          <h2>فیلتر بر اساس نوع کاربری طبقات</h2>
          <div className="business-blocks-filter-pills" aria-label="فیلتر نوع کاربری طبقات">
            {usageFilterOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                aria-pressed={activeUsage === option.value}
                onClick={() => setActiveUsage((current) => (current === option.value ? '' : option.value))}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p>با انتخاب نوع کاربری، طبقه‌هایی که با این نوع کاربری مطابقت دارند نمایش داده می‌شوند. اعداد نشان‌دهنده تعداد واحدهای ثبت شده برای هر نوع کاربری هستند.</p>
        </div>

        <div className="business-blocks-toolbar">
          <Link href={`/business-settings/project/blocks/${blockId}/floors/new`} className="business-blocks-add">
            <Plus />
            ثبت طبقه
          </Link>
          <label className="business-blocks-search">
            <Search />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو در طبقه‌ها..." />
          </label>
        </div>
      </div>

      <div className="business-floor-grid">
        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت طبقات...</div> : null}
        {!loading && floors.length === 0 ? <div className="business-blocks-state">هنوز طبقه‌ای برای این بلوک ثبت نشده است.</div> : null}
        {!loading && floors.length > 0 && filteredFloors.length === 0 ? <div className="business-blocks-state">طبقه مطابق جستجو پیدا نشد.</div> : null}
        {filteredFloors.map((floor) => (
          <Link href={`/business-settings/project/blocks/${blockId}/floors/${floor.id}`} key={floor.id} className="business-block-card business-floor-list-card">
            <header className="business-block-card-cover">
              <span>{floor.name}</span>
            </header>

            <div className="business-block-card-body">
              <div className="business-block-card-meta">
                <span>{blockName ? `${blockName} - ${floor.unitCount} واحد ثبت شده` : `${floor.unitCount} واحد ثبت شده`}</span>
                <span className="business-block-card-menu" aria-hidden="true">
                  <MoreVertical />
                </span>
              </div>

              <h3>نوع کاربری</h3>
              <div className="business-block-card-stats">
                {floorUsageTags.map((tag) => (
                  <span key={tag}>o {tag}</span>
                ))}
              </div>

              <div className="business-block-report">
                <div>
                  <h4>جزئیات و لیست واحدها</h4>
                  <p>برای مشاهده جزئیات طبقه و واحدهای آن وارد شوید.</p>
                  <span className="business-block-report-status">
                    <i>i</i>
                    تکمیل نشده
                  </span>
                </div>
                <ChevronLeft aria-hidden="true" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BusinessFloorForm({ blockId }: { blockId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const submitFloor = async () => {
    setSaving(true);
    setMessage('');
    const payload = activeTab === 'bulk' ? { mode: 'bulk', prefix, from, to } : { mode: 'single', name };

    try {
      const response = await fetch(`/api/business-settings/project/blocks/${blockId}/floors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? 'ثبت طبقه ناموفق بود.');
      router.push(`/business-settings/project/blocks/${blockId}`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ثبت طبقه ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="business-block-form-page" aria-label="ثبت طبقه">
      <div className="business-block-form-card">
        <div className="business-block-form-tabs">
          <button type="button" className={activeTab === 'single' ? 'active' : ''} onClick={() => setActiveTab('single')}>
            <Square />
            ثبت تکی طبقه
          </button>
          <button type="button" className={activeTab === 'bulk' ? 'active' : ''} onClick={() => setActiveTab('bulk')}>
            <Table2 />
            ثبت تجمیعی طبقه
          </button>
        </div>

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}

        {activeTab === 'single' ? (
          <div className="business-block-form-section">
            <FormField label="مشخصه طبقه" required>
              <input value={name} onChange={(event) => setName(event.target.value.slice(0, 30))} placeholder="مثلا طبقه اول" />
            </FormField>
          </div>
        ) : (
          <div className="business-block-form-section">
            <div className="business-block-form-row">
              <FormField label="پیشوند نام‌گذاری" required>
                <input value={prefix} onChange={(event) => setPrefix(event.target.value.slice(0, 30))} placeholder="مثلا طبقه" />
              </FormField>
              <FormField label="از" required>
                <input value={from} onChange={(event) => setFrom(event.target.value)} placeholder="مثلا ۱" />
              </FormField>
              <FormField label="تا" required>
                <input value={to} onChange={(event) => setTo(event.target.value)} placeholder="مثلا ۵" />
              </FormField>
            </div>
          </div>
        )}

        <div className="business-block-form-actions">
          <button type="button" className="business-block-form-submit" onClick={submitFloor} disabled={saving}>
            {saving ? 'در حال ثبت...' : 'ثبت طبقه'}
          </button>
        </div>
      </div>
    </section>
  );
}

export function BusinessFloorDetail({ blockId, floorId }: { blockId: string; floorId: string }) {
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

  const normalizedQuery = query.trim();
  const categoryUnits = units.filter((unit) => (unit.category ?? 'unit') === activeUnitType);
  const filteredUnits = normalizedQuery ? categoryUnits.filter((unit) => unit.name.includes(normalizedQuery)) : categoryUnits;
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
                    <b>{tab.count}</b>
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
              <button
                type="button"
                key={option.value}
                aria-pressed={activeUsage === option.value}
                onClick={() => setActiveUsage((current) => (current === option.value ? '' : option.value))}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="business-units-toolbar">
          <Link href={`/business-settings/project/blocks/${blockId}/floors/${floorId}/units/new?category=${activeUnitType}`} className="business-units-add">
            <Plus />
            ثبت {unitCategoryLabels[activeUnitType]}
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
                  <span className="is-orange">اتاق خواب {display.bedrooms}</span>
                  <span className="is-blue">بالکن {display.balconies}</span>
                  <span className="is-sky">پارکینگ {display.parking}</span>
                  <span className="is-blue">انباری {display.storage}</span>
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
  const isEdit = Boolean(unitId);
  const initialCategory: UnitCategory = category === 'storage' || category === 'parking' || category === 'amenity' ? category : 'unit';
  const [unitCategory, setUnitCategory] = useState<UnitCategory>(initialCategory);
  const categoryLabel = unitCategoryLabels[unitCategory];
  const isMainUnit = unitCategory === 'unit';
  const isSimpleAsset = unitCategory === 'storage' || unitCategory === 'parking';
  const isAmenityUnit = unitCategory === 'amenity';
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [unitType, setUnitType] = useState(unitTypeOptions[0]);
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
  const usageSelected = !isMainUnit || Boolean(usage);

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
          setUnitType(data.unit.unitType ?? unitTypeOptions[0]);
          setUsage((data.unit.usage as (typeof unitUsageOptions)[number]['value'] | '') ?? '');
          setName(data.unit.name ?? '');
          setSaleEnabled(data.unit.saleEnabled !== false);
          setDeliveryStatus(data.unit.deliveryStatus === 'presale' ? 'presale' : 'ready');
          setArea(data.unit.area ? String(data.unit.area) : '');
          setBalconyCount(String(data.unit.balconyCount ?? 0));
          setBedroomCount(String(data.unit.bedroomCount ?? 0));
          setPostalCode(data.unit.postalCode ?? '');
          setDirection((data.unit.direction as (typeof directionOptions)[number]['value']) ?? 'unknown');
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
    if (!title) return;
    setAmenities((current) => [...current, { title, count }]);
    setAmenityTitle('');
    setAmenityCount('1');
    setAmenityDialogOpen(false);
  };

  const toggleAssignment = (kind: 'parking' | 'storage', option: AssignmentOption) => {
    if (option.assignedToUnitId) return;
    const setter = kind === 'parking' ? setSelectedParkingIds : setSelectedStorageIds;
    setter((current) => (current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id]));
  };

  const submitUnit = async () => {
    setSaving(true);
    setMessage('');

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
      parkingIds: activeTab === 'single' && (isMainUnit || isAmenityUnit) ? selectedParkingIds : [],
      storageIds: activeTab === 'single' && (isMainUnit || isAmenityUnit) ? selectedStorageIds : [],
    };

    try {
      const response = await fetch(isEdit ? `/api/business-settings/project/blocks/${blockId}/floors/${floorId}/units/${unitId}` : `/api/business-settings/project/blocks/${blockId}/floors/${floorId}/units`, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? (isEdit ? 'ویرایش واحد ناموفق بود.' : 'ثبت واحد ناموفق بود.'));
      router.push(`/business-settings/project/blocks/${blockId}/floors/${floorId}`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : isEdit ? 'ویرایش واحد ناموفق بود.' : 'ثبت واحد ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const assignmentOptions = assignmentDialog === 'parking' ? parkingOptions : storageOptions;
  const selectedAssignmentIds = assignmentDialog === 'parking' ? selectedParkingIds : selectedStorageIds;
  const selectedParkingNames = parkingOptions.filter((item) => selectedParkingIds.includes(item.id)).map((item) => item.name);
  const selectedStorageNames = storageOptions.filter((item) => selectedStorageIds.includes(item.id)).map((item) => item.name);

  return (
    <section className="business-unit-form-page" aria-label={`${isEdit ? 'ویرایش' : 'ثبت'} ${categoryLabel}`}>
      <div className="business-block-form-card business-unit-form-card">
        <div className="business-block-form-tabs">
          <button type="button" className={activeTab === 'single' ? 'active' : ''} onClick={() => setActiveTab('single')}>
            <Square />
            {isEdit ? 'ویرایش تکی' : 'ثبت تکی'}
          </button>
          <button type="button" className={activeTab === 'bulk' ? 'active' : ''} onClick={() => setActiveTab('bulk')} disabled={isEdit}>
            <Table2 />
            ثبت تجمیعی
          </button>
        </div>

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت اطلاعات واحد...</div> : null}

        <div className="business-unit-form-grid">
          {isMainUnit ? (
            <FieldGroup label="تیپ واحد">
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

          {isMainUnit || isAmenityUnit ? (
            <div className="business-unit-form-fieldset">
              <span>نوع کاربری</span>
              <div className="business-unit-choice-tags">
                {unitUsageOptions.map((option) => (
                  <TagPill key={option.value} label={option.label} active={usage === option.value} onClick={() => setUsage(option.value)} />
                ))}
              </div>
            </div>
          ) : null}

          {isMainUnit && !usageSelected ? <p className="business-unit-form-hint">برای نمایش ادامه فرم، نوع کاربری واحد را انتخاب کنید.</p> : null}

          {usageSelected ? (
            <>
              {activeTab === 'single' ? (
                <FieldGroup label={`مشخصه ${categoryLabel}`} required>
                  <FormTextInput value={name} onChange={(value) => setName(value.slice(0, 30))} placeholder={unitCategory === 'unit' ? 'مثلا A1' : `مشخصه ${categoryLabel}`} />
                </FieldGroup>
              ) : (
                <div className="business-unit-bulk-row">
                  <FieldGroup label="پیشوند نام گذاری" required>
                    <FormTextInput value={prefix} onChange={(value) => setPrefix(value.slice(0, 30))} placeholder="مثلا A" />
                  </FieldGroup>
                  <FieldGroup label="از" required>
                    <FormTextInput value={from} onChange={setFrom} placeholder="1" />
                  </FieldGroup>
                  <FieldGroup label="تا" required>
                    <FormTextInput value={to} onChange={setTo} placeholder="10" />
                  </FieldGroup>
                </div>
              )}

              {isSimpleAsset ? (
                <>
                  <FieldGroup label={`متراژ ${categoryLabel}`} required>
                    <FormTextInput value={area} onChange={setArea} placeholder="مثلا 12" />
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

                  <FieldGroup label="متراژ" required>
                    <FormTextInput value={area} onChange={setArea} placeholder="مثلا 100" />
                  </FieldGroup>

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
                      ثبت امکانات واحد
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
                    <p className="business-unit-assignment-summary">{baseInfo || 'توضیحاتی ثبت نشده است.'}</p>
                  </div>
                </>
              ) : null}

              {activeTab === 'single' && (isMainUnit || isAmenityUnit) ? (
                <>
                  <AssignmentSelector title={`انتخاب پارکینگ ${categoryLabel}`} names={selectedParkingNames} onOpen={() => setAssignmentDialog('parking')} />
                  <AssignmentSelector title={`انتخاب انباری ${categoryLabel}`} names={selectedStorageNames} onOpen={() => setAssignmentDialog('storage')} />
                </>
              ) : null}
            </>
          ) : null}
        </div>

        {usageSelected && !loading ? <div className="business-block-form-actions">
          <button type="button" className="business-block-form-submit" onClick={submitUnit} disabled={saving}>
            {saving ? (isEdit ? 'در حال ذخیره...' : 'در حال ثبت...') : isEdit ? `ذخیره ${categoryLabel}` : activeTab === 'bulk' ? `ثبت تجمیعی ${categoryLabel}` : `ثبت ${categoryLabel}`}
          </button>
        </div> : null}
      </div>

      {amenityDialogOpen ? (
        <Dialog title="ثبت امکانات واحد" onClose={() => setAmenityDialogOpen(false)}>
          <FieldGroup label="عنوان امکانات" required>
            <FormTextInput value={amenityTitle} onChange={(value) => setAmenityTitle(value.slice(0, 40))} placeholder="مثلا آسانسور اختصاصی" />
          </FieldGroup>
          <FieldGroup label="تعداد" required>
            <FormTextInput value={amenityCount} onChange={setAmenityCount} />
          </FieldGroup>
          <div className="business-dialog-actions">
            <button type="button" className="business-block-form-submit" onClick={addAmenity}>
              ثبت
            </button>
          </div>
        </Dialog>
      ) : null}

      {assignmentDialog ? (
        <Dialog title={assignmentDialog === 'parking' ? 'انتخاب پارکینگ واحد' : 'انتخاب انباری واحد'} onClose={() => setAssignmentDialog(null)}>
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
            <button type="button" className="business-block-form-submit" onClick={() => setAssignmentDialog(null)}>
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
              ثبت
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

function AssignmentSelector({ title, names, onOpen }: { title: string; names: string[]; onOpen: () => void }) {
  return (
    <div className="business-unit-form-fieldset">
      <button type="button" className="business-unit-next-action" onClick={onOpen}>
        {title}
        <ChevronLeft />
      </button>
      <p className="business-unit-assignment-summary">{names.length ? names.join('، ') : 'موردی انتخاب نشده است.'}</p>
    </div>
  );
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="business-block-form-field">
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
