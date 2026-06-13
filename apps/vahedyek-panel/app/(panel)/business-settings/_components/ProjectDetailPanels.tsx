'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Building2,
  ClipboardList,
  FileText,
  Grid2X2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  FieldGroup,
  FormDateInput,
  FormTextInput,
  InlineSelect,
  TagPill,
  TagPills,
} from '../../contracts/new/_components/ContractFormPrimitives';
import { buildValidationSummary } from '../../contracts/new/_components/validationPresentation';

type ProjectUnitTypeRecord = {
  id: string;
  title: string;
  unitCount: number;
  bedroomCount: number;
  balconyCount: number;
  area: number;
  usage: 'residential' | 'commercial' | 'office' | 'parking';
  createdAt: string;
  updatedAt: string;
};

type ProjectPlateDto = {
  id: string;
  mainPlate: string;
  subPlates: string[];
};

type ProjectReportData = {
  projectStatus: string;
  permitStatus: string;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  startDate: string;
  expectedDeliveryDate: string;
  activeWorkers: number;
  soldUnits: number;
  reservedUnits: number;
  reportNotes: string;
};

type ProjectReportSummary = {
  blockCount: number;
  floorCount: number;
  unitCount: number;
  parkingCount: number;
  storageCount: number;
  amenityCount: number;
  plateCount: number;
};

type ProjectTechnicalSpecs = {
  structureSystem: string;
  facadeMaterial: string;
  cabinetType: string;
  floorMaterial: string;
  coolingSystem: string;
  heatingSystem: string;
  windowType: string;
  elevatorCount: number;
  securitySystem: string;
  fireSystem: string;
  internetStatus: string;
  parkingAccess: string;
  technicalNotes: string;
};

type ProjectAddressData = {
  province: string;
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  alley: string;
  plaque: string;
  postalCode: string;
  addressNotes: string;
  latitude: number;
  longitude: number;
};
type AddressDistrictMap = Record<string, readonly string[]>;
type AddressCityMap = Record<string, AddressDistrictMap>;

type MapPointTuple = [number, number];

type ProjectMapInstance = {
  on(event: string, handler: (event: { latlng?: { lat: number; lng: number } }) => void): void;
  setView(center: MapPointTuple, zoom: number): void;
  remove(): void;
  invalidateSize(): void;
};

type ProjectMapMarker = {
  setLatLng(center: MapPointTuple): void;
  addTo(map: ProjectMapInstance): ProjectMapMarker;
  remove(): void;
};

type ProjectMapSdk = {
  map(
    element: HTMLElement,
    options: {
      key: string;
      maptype: 'dreamy' | 'standard-day';
      poi: boolean;
      traffic: boolean;
      center: MapPointTuple;
      zoom: number;
    },
  ): ProjectMapInstance;
  circleMarker(
    center: MapPointTuple,
    options: {
      radius: number;
      weight: number;
      color: string;
      fillColor: string;
      fillOpacity: number;
    },
  ): ProjectMapMarker;
};

const usageOptions = [
  { value: 'residential', label: 'مسکونی' },
  { value: 'office', label: 'اداری' },
  { value: 'commercial', label: 'تجاری' },
  { value: 'parking', label: 'پارکینگ' },
] as const;

const unitCountOptions = Array.from({ length: 13 }, (_, index) => ({
  value: String(index),
  label: index === 0 ? 'تعیین نشده' : `${index} واحد`,
}));

const projectStatusOptions = ['در حال تجهیز کارگاه', 'در حال اجرا', 'در حال نازک کاری', 'در مرحله تحویل', 'متوقف شده'] as const;
const permitStatusOptions = ['پروانه کامل', 'پروانه در حال تمدید', 'در انتظار تایید', 'نیازمند پیگیری'] as const;

export const TECHNICAL_SPEC_NONE_VALUE = 'ندارد';

const structureSystemOptions = ['اسکلت بتنی', 'اسکلت فلزی', 'قاب خمشی', 'دیوار باربر', 'سازه ترکیبی'] as const;
const facadeOptions = ['سنگ', 'آجر نسوز', 'سرامیک خشک', 'کامپوزیت', 'ترکیبی'] as const;
const cabinetOptions = ['MDF', 'های‌گلاس', 'ممبران', 'فلزی', 'سفارشی'] as const;
const floorMaterialOptions = ['سرامیک', 'پارکت', 'سنگ', 'لمینت', 'ترکیبی'] as const;
const coolingOptions = ['اسپلیت', 'چیلر', 'داکت اسپلیت', 'فن کویل', 'بدون سیستم'] as const;
const heatingOptions = ['پکیج', 'موتورخانه', 'گرمایش از کف', 'فن کویل', 'بدون سیستم'] as const;
const windowOptions = ['UPVC دوجداره', 'آلومینیومی', 'ترمال بریک', 'چوبی', 'ترکیبی'] as const;
const securityOptions = ['نگهبانی ۲۴ ساعته', 'دوربین مدار بسته', 'کنترل تردد', 'سیستم هوشمند', 'فاقد سیستم'] as const;
const fireSystemOptions = ['اعلام حریق', 'اعلام و اطفا', 'اسپرینکلر', 'خاموش کننده دستی', 'فاقد سیستم'] as const;
const internetOptions = ['فیبر نوری', 'ADSL', 'وایرلس', 'زیرساخت آماده', 'فاقد زیرساخت'] as const;
const parkingAccessOptions = ['رمپ مستقیم', 'رمپ مارپیچ', 'آسانسور خودرو', 'دسترسی همکف', 'ندارد'] as const;
const projectAddressDirectory = {
  تهران: {
    تهران: {
      'منطقه 1': ['زعفرانیه', 'ولنجک', 'نیاوران'],
      'منطقه 2': ['سعادت آباد', 'شهرک غرب', 'گیشا'],
      'منطقه 5': ['پونک', 'جنت آباد', 'صادقیه'],
    },
    'پردیس': {
      'فاز 1': ['محله گلستان', 'محله بوستان'],
      'فاز 2': ['محله سرو', 'محله باران'],
    },
  },
  'البرز': {
    کرج: {
      'منطقه 1': ['عظیمیه', 'جهانشهر', 'مهرشهر'],
      'منطقه 2': ['گوهردشت', 'حصارک', 'شاهین ویلا'],
    },
  },
  اصفهان: {
    اصفهان: {
      'منطقه 3': ['عباس آباد', 'مرداویج', 'چهارباغ بالا'],
      'منطقه 6': ['خانه اصفهان', 'سپاهان شهر', 'بهارستان'],
    },
  },
} as const;

const defaultReportData: ProjectReportData = {
  projectStatus: '',
  permitStatus: '',
  physicalProgressPercent: 0,
  financialProgressPercent: 0,
  startDate: '',
  expectedDeliveryDate: '',
  activeWorkers: 0,
  soldUnits: 0,
  reservedUnits: 0,
  reportNotes: '',
};

const defaultTechnicalSpecs: ProjectTechnicalSpecs = {
  structureSystem: TECHNICAL_SPEC_NONE_VALUE,
  facadeMaterial: TECHNICAL_SPEC_NONE_VALUE,
  cabinetType: TECHNICAL_SPEC_NONE_VALUE,
  floorMaterial: TECHNICAL_SPEC_NONE_VALUE,
  coolingSystem: TECHNICAL_SPEC_NONE_VALUE,
  heatingSystem: TECHNICAL_SPEC_NONE_VALUE,
  windowType: TECHNICAL_SPEC_NONE_VALUE,
  elevatorCount: 0,
  securitySystem: TECHNICAL_SPEC_NONE_VALUE,
  fireSystem: TECHNICAL_SPEC_NONE_VALUE,
  internetStatus: TECHNICAL_SPEC_NONE_VALUE,
  parkingAccess: TECHNICAL_SPEC_NONE_VALUE,
  technicalNotes: '',
};

const defaultAddressData: ProjectAddressData = {
  province: '',
  city: '',
  district: '',
  neighborhood: '',
  street: '',
  alley: '',
  plaque: '',
  postalCode: '',
  addressNotes: '',
  latitude: 0,
  longitude: 0,
};

const defaultProjectMapCenter: [number, number] = [35.7219, 51.3347];
const neshanMapKey = process.env.NEXT_PUBLIC_NESHAN_MAP_KEY ?? '';
let mapAssetsPromise: Promise<ProjectMapSdk> | null = null;

async function ensureLeafletAssets() {
  if (typeof window === 'undefined') {
    throw new Error('مپ فقط در مرورگر قابل بارگذاری است.');
  }

  if (!neshanMapKey) {
    throw new Error('کلید وب‌سرویس نشان تنظیم نشده است.');
  }

  if (!document.querySelector('link[data-project-neshan="true"]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/neshan-leaflet/leaflet.css';
    stylesheet.dataset.projectNeshan = 'true';
    document.head.appendChild(stylesheet);
  }

  if (!mapAssetsPromise) {
    mapAssetsPromise = import('@neshan-maps-platform/leaflet').then((module) => module.default as unknown as ProjectMapSdk);
  }
  return mapAssetsPromise;
}

function ProjectHero({
  icon: Icon,
  title,
  description,
  actions,
  backHref = '/business-settings/project',
  backLabel = 'بازگشت',
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actions?: ReactNode;
  backHref?: string | null;
  backLabel?: string;
}) {
  return (
    <div className="project-flow-hero">
      <div className="project-flow-hero-icon">
        <Icon />
      </div>
      <div className="project-flow-hero-copy">
        {backHref ? (
          <Link href={backHref} className="project-flow-hero-back" aria-label={backLabel}>
            <ArrowRight />
            <span>{backLabel}</span>
          </Link>
        ) : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="project-flow-hero-actions">{actions}</div> : null}
    </div>
  );
}

function ProjectStatCard({ label, value, accent = 'teal' }: { label: string; value: string; accent?: 'teal' | 'amber' | 'slate' }) {
  return (
    <div className={`project-stat-card is-${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProjectField({
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

const REQUIRED_MESSAGE = 'این فیلد الزامی است';

function ProjectTextarea({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="project-flow-textarea"
    />
  );
}

export function ProjectUnitTypesPanel() {
  const [unitTypes, setUnitTypes] = useState<ProjectUnitTypeRecord[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const filtered = useMemo(() => {
    const text = query.trim();
    return text ? unitTypes.filter((item) => item.title.includes(text)) : unitTypes;
  }, [query, unitTypes]);

  async function loadUnitTypes() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/business-settings/project/unit-types', { cache: 'no-store' });
      const data = (await response.json()) as { unitTypes?: ProjectUnitTypeRecord[]; message?: string };
      if (!response.ok) throw new Error(data.message ?? 'دریافت تیپ‌های واحد ناموفق بود.');
      setUnitTypes(data.unitTypes ?? []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'دریافت تیپ‌های واحد ناموفق بود.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUnitTypes();
  }, []);

  async function removeUnitType(id: string) {
    if (!window.confirm('این تیپ واحد حذف شود؟')) return;
    const response = await fetch(`/api/business-settings/project/unit-types/${id}`, { method: 'DELETE' });
    const data = (await response.json()) as { message?: string; unitTypes?: ProjectUnitTypeRecord[] };
    if (!response.ok) {
      setMessage(data.message ?? 'حذف تیپ واحد ناموفق بود.');
      return;
    }
    setUnitTypes(data.unitTypes ?? []);
  }

  return (
    <section className="business-blocks-page" aria-label="تیپ‌های واحد">
      <div className="business-blocks-shell">
        <ProjectHero
          icon={Building2}
          title="تیپ‌های واحد"
          description="تیپ‌های تکرارشونده مجتمع را یک‌بار ثبت کنید تا در مراحل قیمت‌گذاری و ثبت واحد، ساختار دقیق‌تری داشته باشید."
          actions={
            <Link href="/business-settings/project/unit-types/new" className="business-blocks-add">
              <Plus />
              افزودن تیپ واحد
            </Link>
          }
        />

        <div className="business-blocks-toolbar">
          <label className="business-blocks-search">
            <Search />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو در تیپ‌ها..." />
          </label>
        </div>

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت تیپ‌های واحد...</div> : null}

        <div className="business-blocks-grid">
          {!loading && unitTypes.length === 0 ? <div className="business-blocks-state">هنوز تیپ واحدی ثبت نشده است.</div> : null}
          {!loading && unitTypes.length > 0 && filtered.length === 0 ? <div className="business-blocks-state">مورد مطابق جستجو پیدا نشد.</div> : null}
          {filtered.map((item) => (
            <article className="business-block-card" key={item.id}>
              <div className="business-block-card-cover">
                <span>{item.title}</span>
              </div>
              <div className="business-block-card-body">
                <div className="business-block-card-meta">
                  <span>{usageOptions.find((option) => option.value === item.usage)?.label ?? 'مسکونی'}</span>
                  <div className="project-inline-actions">
                    <button type="button" className="business-block-card-menu" onClick={() => router.push(`/business-settings/project/unit-types/${item.id}/edit`)}>
                      <Pencil />
                    </button>
                    <button type="button" className="business-block-card-menu" onClick={() => removeUnitType(item.id)}>
                      <Trash2 />
                    </button>
                  </div>
                </div>

                <h3>{item.title}</h3>

                <div className="business-block-card-stats">
                  <span>{item.unitCount || 0} واحد</span>
                  <span>{item.bedroomCount} خواب</span>
                  <span>{item.balconyCount} بالکن</span>
                  <span>{item.area} متر مربع</span>
                </div>

                <div className="business-block-report">
                  <div>
                    <h4>ساختار این تیپ</h4>
                    <p>برای واحدهای هم‌الگو با مشخصات یکسان قابل استفاده است و در ثبت واحد سرعت کار را بالا می‌برد.</p>
                  </div>
                  <span className="business-block-report-status">
                    <i>i</i>
                    آماده استفاده
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectUnitTypeForm({ typeId }: { typeId?: string }) {
  const isEdit = Boolean(typeId);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [unitCount, setUnitCount] = useState('0');
  const [bedroomCount, setBedroomCount] = useState('');
  const [balconyCount, setBalconyCount] = useState('');
  const [area, setArea] = useState('');
  const [usage, setUsage] = useState<(typeof usageOptions)[number]['value']>('residential');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (!typeId) return;
    let cancelled = false;

    async function loadUnitType() {
      try {
        const response = await fetch(`/api/business-settings/project/unit-types/${typeId}`, { cache: 'no-store' });
        const data = (await response.json()) as { unitType?: ProjectUnitTypeRecord; message?: string };
        if (!response.ok) throw new Error(data.message ?? 'دریافت تیپ واحد ناموفق بود.');
        if (cancelled || !data.unitType) return;
        setTitle(data.unitType.title);
        setUnitCount(String(data.unitType.unitCount));
        setBedroomCount(String(data.unitType.bedroomCount));
        setBalconyCount(String(data.unitType.balconyCount));
        setArea(String(data.unitType.area));
        setUsage(data.unitType.usage);
      } catch (err) {
        if (!cancelled) setMessage(err instanceof Error ? err.message : 'دریافت تیپ واحد ناموفق بود.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUnitType();
    return () => {
      cancelled = true;
    };
  }, [typeId]);

  async function submit() {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = REQUIRED_MESSAGE;
    if (!unitCount.trim() || unitCount === '0') errors.unitCount = REQUIRED_MESSAGE;
    if (!bedroomCount.trim()) errors.bedroomCount = REQUIRED_MESSAGE;
    if (!balconyCount.trim()) errors.balconyCount = REQUIRED_MESSAGE;
    if (!area.trim()) errors.area = REQUIRED_MESSAGE;
    if (Object.keys(errors).length > 0) {
      setShowValidation(true);
      setMessage(buildValidationSummary(errors, { title: 'عنوان', unitCount: 'چند واحد', bedroomCount: 'تعداد خواب', balconyCount: 'تعداد بالکن', area: 'متراژ' }, 'اطلاعات تیپ واحد کامل نیست.'));
      return;
    }
    setSaving(true);
    setMessage('');
    setShowValidation(false);
    try {
      const response = await fetch(isEdit ? `/api/business-settings/project/unit-types/${typeId}` : '/api/business-settings/project/unit-types', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          unitCount,
          bedroomCount,
          balconyCount,
          area,
          usage,
        }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? 'ذخیره تیپ واحد ناموفق بود.');
      router.push('/business-settings/project/unit-types');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ذخیره تیپ واحد ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="business-block-form-page" aria-label={isEdit ? 'ویرایش تیپ واحد' : 'افزودن تیپ واحد'}>
      <div className="business-block-form-card project-flow-form-card">
        <ProjectHero
          icon={Building2}
          title={isEdit ? 'ویرایش تیپ واحد' : 'افزودن تیپ واحد'}
          description="ساختار تیپ را ثبت کنید تا در تعریف واحدها از آن استفاده شود."
          backHref="/business-settings/project/unit-types"
          backLabel="بازگشت به فهرست تیپ‌ها"
        />

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت اطلاعات تیپ واحد...</div> : null}

        {!loading ? (
          <div className="business-unit-form-grid">
            <ProjectField label="عنوان" required invalid={showValidation && !title.trim()}>
              <input value={title} onChange={(event) => setTitle(event.target.value.slice(0, 60))} placeholder="مثلاً تیپ A شرقی" />
            </ProjectField>

            <FieldGroup label="چند واحد" required invalid={showValidation && (!unitCount.trim() || unitCount === '0')}>
              <InlineSelect
                invalid={showValidation && (!unitCount.trim() || unitCount === '0')}
                value={unitCount}
                onSelect={setUnitCount}
                options={unitCountOptions}
                placeholder="تعداد واحد"
                searchPlaceholder="جستجو در تعدادها..."
                emptyText="موردی پیدا نشد"
              />
            </FieldGroup>

            <ProjectField label="تعداد خواب" required invalid={showValidation && !bedroomCount.trim()}>
              <input value={bedroomCount} onChange={(event) => setBedroomCount(event.target.value)} inputMode="numeric" placeholder="مثلاً 3" />
            </ProjectField>

            <ProjectField label="تعداد بالکن" required invalid={showValidation && !balconyCount.trim()}>
              <input value={balconyCount} onChange={(event) => setBalconyCount(event.target.value)} inputMode="numeric" placeholder="مثلاً 1" />
            </ProjectField>

            <p className="project-flow-hint">متراژ واحد، بدون انباری و پارکینگ و سایر الحاقات ثبت می‌شود.</p>

            <ProjectField label="متراژ" required invalid={showValidation && !area.trim()}>
              <input value={area} onChange={(event) => setArea(event.target.value)} inputMode="decimal" placeholder="مثلاً 120" />
            </ProjectField>

            <div className="business-unit-form-fieldset">
              <span>کاربری تیپ</span>
              <div className="business-unit-choice-tags">
                {usageOptions.map((option) => (
                  <TagPill key={option.value} label={option.label} active={usage === option.value} onClick={() => setUsage(option.value)} />
                ))}
              </div>
            </div>

            <div className="project-flow-actions">
              <button type="button" className="business-dialog-secondary" onClick={() => router.push('/business-settings/project/unit-types')}>
                لغو
              </button>
              <button type="button" className="business-block-form-submit" onClick={submit} disabled={saving}>
                {saving ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ProjectPlatesPanel() {
  const [plates, setPlates] = useState<ProjectPlateDto[]>([]);
  const [mainPlate, setMainPlate] = useState('');
  const [subPlate, setSubPlate] = useState('');
  const [draftSubPlates, setDraftSubPlates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  async function loadPlates() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/business-settings/project/plates', { cache: 'no-store' });
      const data = (await response.json()) as { plates?: ProjectPlateDto[]; message?: string };
      if (!response.ok) throw new Error(data.message ?? 'دریافت پلاک‌ها ناموفق بود.');
      setPlates(data.plates ?? []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'دریافت پلاک‌ها ناموفق بود.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlates();
  }, []);

  function addSubPlate() {
    const value = subPlate.trim();
    if (!value || draftSubPlates.includes(value)) return;
    setDraftSubPlates((current) => [...current, value]);
    setSubPlate('');
  }

  async function submit() {
    const errors: Record<string, string> = {};
    if (!mainPlate.trim()) errors.mainPlate = REQUIRED_MESSAGE;
    if (!(draftSubPlates.length || subPlate.trim())) errors.subPlate = REQUIRED_MESSAGE;
    if (Object.keys(errors).length > 0) {
      setShowValidation(true);
      setMessage(buildValidationSummary(errors, { mainPlate: 'پلاک اصلی', subPlate: 'پلاک فرعی' }, 'اطلاعات پلاک کامل نیست.'));
      return;
    }
    setSaving(true);
    setMessage('');
    setShowValidation(false);
    try {
      const response = await fetch('/api/business-settings/project/plates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainPlate, subPlates: draftSubPlates }),
      });
      const data = (await response.json()) as { plates?: ProjectPlateDto[]; message?: string };
      if (!response.ok) throw new Error(data.message ?? 'ثبت پلاک ناموفق بود.');
      setPlates(data.plates ?? []);
      setMainPlate('');
      setSubPlate('');
      setDraftSubPlates([]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ثبت پلاک ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="business-blocks-page" aria-label="پلاک اصلی و فرعی">
      <div className="business-blocks-shell">
        <ProjectHero
          icon={Grid2X2}
          title="پلاک اصلی و فرعی"
          description="پلاک‌های ثبتی پروژه را یک‌جا نگه دارید تا در تعریف بلوک‌ها و گزارش‌ها از داده یکسان استفاده شود."
        />

        <div className="project-flow-layout">
          <div className="business-block-form-card">
            <div className="business-block-form-section">
              <h2>افزودن پلاک</h2>
              <div className="business-block-form-row">
                <ProjectField label="پلاک اصلی" required invalid={showValidation && !mainPlate.trim()}>
                  <input value={mainPlate} onChange={(event) => setMainPlate(event.target.value)} inputMode="numeric" placeholder="مثلاً 125" />
                </ProjectField>
                <ProjectField label="پلاک فرعی" required invalid={showValidation && !(draftSubPlates.length || subPlate.trim())}>
                  <input value={subPlate} onChange={(event) => setSubPlate(event.target.value)} inputMode="numeric" placeholder="مثلاً 10" />
                </ProjectField>
              </div>
              <div className="business-dialog-actions project-inline-actions-row">
                <button type="button" className="business-dialog-secondary" onClick={addSubPlate}>
                  افزودن پلاک فرعی
                </button>
              </div>
              <div className="business-unit-selected-tags">
                {draftSubPlates.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>

            <div className="business-block-form-actions">
              <button type="button" className="business-block-form-submit" onClick={submit} disabled={saving}>
                {saving ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
            </div>
          </div>

          <div className="business-block-form-card">
            <div className="business-block-form-section">
              <h2>فهرست پلاک‌ها</h2>
              {message ? <div className="business-blocks-state is-error">{message}</div> : null}
              {loading ? <div className="business-blocks-state">در حال دریافت پلاک‌ها...</div> : null}
              {!loading && plates.length === 0 ? <div className="business-blocks-state">هنوز پلاکی ثبت نشده است.</div> : null}
              <div className="project-plate-list">
                {plates.map((plate) => (
                  <div key={plate.id} className="project-plate-item">
                    <strong>پلاک اصلی {plate.mainPlate}</strong>
                    <div className="business-unit-selected-tags">
                      {plate.subPlates.map((sub) => (
                        <span key={sub}>فرعی {sub}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProjectReportsPanel() {
  const [summary, setSummary] = useState<ProjectReportSummary | null>(null);
  const [report, setReport] = useState<ProjectReportData>(defaultReportData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadReport() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/business-settings/project/reports', { cache: 'no-store' });
      const data = (await response.json()) as { report?: ProjectReportData; summary?: ProjectReportSummary; message?: string };
      if (!response.ok) throw new Error(data.message ?? 'دریافت گزارش پروژه ناموفق بود.');
      setReport({ ...defaultReportData, ...data.report });
      setSummary(data.summary ?? null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'دریافت گزارش پروژه ناموفق بود.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  async function submit() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/business-settings/project/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      const data = (await response.json()) as { report?: ProjectReportData; summary?: ProjectReportSummary; message?: string };
      if (!response.ok) throw new Error(data.message ?? 'ذخیره گزارش پروژه ناموفق بود.');
      setReport({ ...defaultReportData, ...data.report });
      setSummary(data.summary ?? null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ذخیره گزارش پروژه ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  const blockCount = summary?.blockCount ?? 0;
  const floorCount = summary?.floorCount ?? 0;
  const unitCount = summary?.unitCount ?? 0;
  const parkingCount = summary?.parkingCount ?? 0;
  const storageCount = summary?.storageCount ?? 0;
  const amenityCount = summary?.amenityCount ?? 0;
  const plateCount = summary?.plateCount ?? 0;
  const visibleTotal = Math.max(blockCount + floorCount + unitCount + parkingCount + storageCount + amenityCount + plateCount, 1);
  const chartRows = [
    { label: 'بلوک‌ها', value: blockCount, color: 'linear-gradient(90deg, #0f766e, #14b8a6)' },
    { label: 'طبقات', value: floorCount, color: 'linear-gradient(90deg, #d97706, #f59e0b)' },
    { label: 'واحدها', value: unitCount, color: 'linear-gradient(90deg, #1d4ed8, #38bdf8)' },
    { label: 'پارکینگ‌ها', value: parkingCount, color: 'linear-gradient(90deg, #334155, #64748b)' },
    { label: 'انباری‌ها', value: storageCount, color: 'linear-gradient(90deg, #7c3aed, #a855f7)' },
    { label: 'فضاهای رفاهی', value: amenityCount, color: 'linear-gradient(90deg, #db2777, #fb7185)' },
  ] as const;
  const donutUnits = [
    { label: 'واحدهای اصلی', value: unitCount, color: '#0f766e' },
    { label: 'پارکینگ‌ها', value: parkingCount, color: '#334155' },
    { label: 'انباری‌ها', value: storageCount, color: '#7c3aed' },
    { label: 'فضاهای رفاهی', value: amenityCount, color: '#d97706' },
  ] as const;
  const dominantItem = chartRows.reduce((best, current) => (current.value > best.value ? current : best), chartRows[0]);
  const pieProgress = Math.max(0, Math.min(100, summary && visibleTotal ? Math.round((unitCount / visibleTotal) * 100) : 0));
  const ringStyle = {
    '--ring-progress': `${Math.max(12, pieProgress)}%`,
    background: donutUnits
      .map((item, index) => {
        const start = donutUnits
          .slice(0, index)
          .reduce((acc, current) => acc + (visibleTotal ? (current.value / visibleTotal) * 100 : 0), 0);
        const end = start + (visibleTotal ? (item.value / visibleTotal) * 100 : 0);
        return `${item.color} ${start}% ${end}%`;
      })
      .join(', '),
  } as React.CSSProperties;

  return (
    <section className="business-block-form-page" aria-label="گزارش اطلاعات مجتمع">
      <div className="business-block-form-card project-flow-form-card">
        <ProjectHero
          icon={ClipboardList}
          title="گزارش اطلاعات مجتمع"
          description="وضعیت اجرایی، پیشرفت پروژه و خلاصه داده‌های ثبتی مجتمع را در یک صفحه نگه دارید."
        />

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت گزارش پروژه...</div> : null}

        {!loading ? (
          <>
            <div className="project-report-summary-strip">
              <ProjectStatCard label="بلوک‌های ثبت‌شده" value={String(blockCount)} />
              <ProjectStatCard label="طبقات ثبت‌شده" value={String(floorCount)} accent="amber" />
              <ProjectStatCard label="واحدهای اصلی" value={String(unitCount)} />
            </div>

            <div className="project-report-grid">
              <section className="project-report-panel">
                <div className="project-report-panel-head">
                  <div>
                    <span className="project-report-panel-kicker">واحدها و فضاها</span>
                    <h3>ترکیب ثبت‌شده‌ها</h3>
                  </div>
                  <FileText />
                </div>
                <div className="project-report-pie">
                  <div
                    className="project-report-donut"
                    style={ringStyle}
                    aria-label="نمودار ترکیب واحدها"
                  >
                    <div>
                      <strong>{pieProgress}%</strong>
                      <span>سهم واحدها</span>
                    </div>
                  </div>
                  <div className="project-report-legend-stack">
                    <div className="project-report-legend-summary">
                      <strong>کل آیتم‌های ثبت‌شده</strong>
                      <span>{visibleTotal}</span>
                    </div>
                    <div className="project-report-legend">
                      {donutUnits.map((item) => {
                        const ratio = visibleTotal ? Math.round((item.value / visibleTotal) * 100) : 0;
                        return (
                          <div className="project-report-legend-item" key={item.label}>
                            <span style={{ background: item.color }} />
                            <strong>{item.label}</strong>
                            <em>{ratio}%</em>
                          </div>
                        );
                      })}
                    </div>
                    <div className="project-report-panel-note">
                      {dominantItem.label} بیشترین سهم را در اجزای پروژه دارد.
                    </div>
                  </div>
                </div>
              </section>

              <section className="project-report-panel">
                <div className="project-report-panel-head">
                  <div>
                    <span className="project-report-panel-kicker">نمای کلی</span>
                    <h3>نمودار اجزای پروژه</h3>
                  </div>
                  <ClipboardList />
                </div>
                <div className="project-report-bars-summary">
                  <div>
                    <strong>{visibleTotal}</strong>
                    <span>جمع کل آیتم‌ها</span>
                  </div>
                  <p>این نمودار توزیع ساختار فعلی پروژه را نشان می‌دهد و با هر ثبت جدید به‌روزرسانی می‌شود.</p>
                </div>
                <div className="project-report-bars">
                  {chartRows.map((item) => {
                    const width = visibleTotal ? Math.max(6, Math.round((item.value / visibleTotal) * 100)) : 0;
                    const ratio = visibleTotal ? Math.round((item.value / visibleTotal) * 100) : 0;
                    return (
                      <div className="project-report-bar-row" key={item.label}>
                        <div className="project-report-bar-label">
                          <strong>{item.label}</strong>
                          <span>{item.value} · {ratio}%</span>
                        </div>
                        <div className="project-report-bar-track">
                          <div className="project-report-bar-fill" style={{ width: `${width}%`, background: item.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="project-report-panel">
                <div className="project-report-panel-head">
                  <div>
                    <span className="project-report-panel-kicker">وضعیت فروش</span>
                    <h3>عملیات و پیشرفت</h3>
                  </div>
                  <TrendingUp />
                </div>
                <div className="project-report-progress-grid">
                  <div className="project-report-progress-card">
                    <div className="project-report-progress-card-head">
                      <span>پیشرفت فیزیکی</span>
                      <strong>{report.physicalProgressPercent}%</strong>
                    </div>
                    <div className="project-report-progress-track">
                      <div
                        className="project-report-progress-fill"
                        style={{ width: `${Math.max(0, Math.min(100, report.physicalProgressPercent))}%`, background: 'linear-gradient(90deg, #0f766e, #14b8a6)' }}
                      />
                    </div>
                  </div>
                  <div className="project-report-progress-card">
                    <div className="project-report-progress-card-head">
                      <span>پیشرفت مالی</span>
                      <strong>{report.financialProgressPercent}%</strong>
                    </div>
                    <div className="project-report-progress-track">
                      <div
                        className="project-report-progress-fill"
                        style={{ width: `${Math.max(0, Math.min(100, report.financialProgressPercent))}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="project-report-status-grid">
                  <div className="project-report-status-card">
                    <span>وضعیت کلی</span>
                    <strong>{report.projectStatus || 'ثبت نشده'}</strong>
                  </div>
                  <div className="project-report-status-card">
                    <span>وضعیت پروانه</span>
                    <strong>{report.permitStatus || 'ثبت نشده'}</strong>
                  </div>
                  <div className="project-report-status-card">
                    <span>واحدهای فروخته‌شده</span>
                    <strong>{report.soldUnits}</strong>
                  </div>
                  <div className="project-report-status-card">
                    <span>واحدهای رزروشده</span>
                    <strong>{report.reservedUnits}</strong>
                  </div>
                </div>
              </section>

              <section className="project-report-panel">
                <div className="project-report-panel-head">
                  <div>
                    <span className="project-report-panel-kicker">میان‌بُرها</span>
                    <h3>مسیرهای مدیریتی</h3>
                  </div>
                  <Sparkles />
                </div>
                <div className="project-report-links-grid">
                  <Link className="project-report-link-card" href="/business-settings/project">
                    <Building2 />
                    <div>
                      <strong>تنظیمات پروژه</strong>
                      <p>تعریف هویت، طبقه‌بندی و اطلاعات پایه پروژه</p>
                    </div>
                  </Link>
                  <Link className="project-report-link-card" href="/business-settings/project/blocks">
                    <Grid2X2 />
                    <div>
                      <strong>بلوک‌ها و طبقات</strong>
                      <p>مدیریت ساختار بلوک، طبقات و واحدها</p>
                    </div>
                  </Link>
                  <Link className="project-report-link-card" href="/business-settings/project/technical-specs">
                    <Wrench />
                    <div>
                      <strong>مشخصات فنی</strong>
                      <p>ثبت سیستم‌ها، مصالح و زیرساخت فنی</p>
                    </div>
                  </Link>
                  <Link className="project-report-link-card" href="/business-settings/project/files">
                    <FileText />
                    <div>
                      <strong>فایل‌ها و اسناد</strong>
                      <p>دسترسی به فایل‌های پروژه و اسناد تکمیلی</p>
                    </div>
                  </Link>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function TechnicalSpecField({
  label,
  options,
  value,
  onChange,
  otherPlaceholder = 'متریال یا گزینه دلخواه را وارد کنید',
}: {
  label: string;
  options: ReadonlyArray<string>;
  value: string;
  onChange: (next: string) => void;
  otherPlaceholder?: string;
}) {
  const displayedOptions = useMemo(
    () => [TECHNICAL_SPEC_NONE_VALUE, ...options.filter((option) => option !== TECHNICAL_SPEC_NONE_VALUE)],
    [options],
  );
  const isKnownOption = displayedOptions.includes(value);
  const isNone = !value || value === TECHNICAL_SPEC_NONE_VALUE;
  const initialOtherActive = Boolean(value) && !isKnownOption && !isNone;
  const [otherActive, setOtherActive] = useState(initialOtherActive);
  const [otherDraft, setOtherDraft] = useState(initialOtherActive ? value : '');

  useEffect(() => {
    const known = displayedOptions.includes(value);
    const none = !value || value === TECHNICAL_SPEC_NONE_VALUE;
    if (!value || known || none) {
      setOtherActive(false);
      setOtherDraft('');
      return;
    }
    setOtherActive(true);
    setOtherDraft(value);
  }, [value, displayedOptions]);

  return (
    <FieldGroup label={label}>
      <div className="technical-spec-field">
        <div className="technical-spec-field-pills">
          {displayedOptions.map((option) => (
            <TagPill
              key={option}
              label={option}
              active={option === TECHNICAL_SPEC_NONE_VALUE ? isNone : value === option}
              onClick={() => {
                setOtherActive(false);
                setOtherDraft('');
                onChange(option);
              }}
            />
          ))}
          <TagPill
            label="سایر"
            active={otherActive}
            onClick={() => {
              if (otherActive) {
                setOtherActive(false);
                setOtherDraft('');
                onChange(TECHNICAL_SPEC_NONE_VALUE);
                return;
              }
              setOtherActive(true);
            }}
          />
        </div>
        {otherActive ? (
          <div className="technical-spec-field-other">
            <FormTextInput
              value={otherDraft}
              onChange={(next) => {
                const sliced = next.slice(0, 80);
                setOtherDraft(sliced);
                onChange(sliced);
              }}
              placeholder={otherPlaceholder}
            />
          </div>
        ) : null}
      </div>
    </FieldGroup>
  );
}

export function ProjectTechnicalSpecsPanel({ returnTo = '' }: { returnTo?: string }) {
  const router = useRouter();
  const [specs, setSpecs] = useState<ProjectTechnicalSpecs>(defaultTechnicalSpecs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadSpecs() {
      setLoading(true);
      setMessage('');
      try {
        const response = await fetch('/api/business-settings/project/technical-specs', { cache: 'no-store' });
        const data = (await response.json()) as { technicalSpecs?: ProjectTechnicalSpecs; message?: string };
        if (!response.ok) throw new Error(data.message ?? 'دریافت مشخصات فنی ناموفق بود.');
        if (!cancelled) setSpecs({ ...defaultTechnicalSpecs, ...data.technicalSpecs });
      } catch (err) {
        if (!cancelled) setMessage(err instanceof Error ? err.message : 'دریافت مشخصات فنی ناموفق بود.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSpecs();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/business-settings/project/technical-specs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(specs),
      });
      const data = (await response.json()) as { technicalSpecs?: ProjectTechnicalSpecs; message?: string };
      if (!response.ok) throw new Error(data.message ?? 'ذخیره مشخصات فنی ناموفق بود.');
      setSpecs({ ...defaultTechnicalSpecs, ...data.technicalSpecs });
      if (returnTo) router.push(returnTo);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ذخیره مشخصات فنی ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="business-block-form-page" aria-label="مشخصات فنی پروژه">
      <div className="business-block-form-card project-flow-form-card">
        <ProjectHero
          icon={Wrench}
          title="مشخصات فنی پروژه"
          description="مشخصات اجرایی، متریال و زیرساخت‌های فنی پروژه را ثبت کنید تا در بررسی، فروش و گزارش‌ها مرجع واحد داشته باشید."
        />

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت مشخصات فنی...</div> : null}

        {!loading ? (
          <>
            <div className="project-flow-grid project-tech-grid">
              <TechnicalSpecField
                label="سیستم سازه"
                options={structureSystemOptions}
                value={specs.structureSystem}
                onChange={(value) => setSpecs((current) => ({ ...current, structureSystem: value }))}
                otherPlaceholder="نوع سازه دلخواه را وارد کنید"
              />
              <TechnicalSpecField
                label="نمای ساختمان"
                options={facadeOptions}
                value={specs.facadeMaterial}
                onChange={(value) => setSpecs((current) => ({ ...current, facadeMaterial: value }))}
                otherPlaceholder="متریال نمای دلخواه را وارد کنید"
              />
              <TechnicalSpecField
                label="کابینت"
                options={cabinetOptions}
                value={specs.cabinetType}
                onChange={(value) => setSpecs((current) => ({ ...current, cabinetType: value }))}
                otherPlaceholder="متریال کابینت دلخواه را وارد کنید"
              />
              <TechnicalSpecField
                label="کف‌پوش"
                options={floorMaterialOptions}
                value={specs.floorMaterial}
                onChange={(value) => setSpecs((current) => ({ ...current, floorMaterial: value }))}
                otherPlaceholder="نوع کف‌پوش دلخواه را وارد کنید"
              />
              <TechnicalSpecField
                label="سیستم سرمایش"
                options={coolingOptions}
                value={specs.coolingSystem}
                onChange={(value) => setSpecs((current) => ({ ...current, coolingSystem: value }))}
                otherPlaceholder="نوع سیستم سرمایش دلخواه را وارد کنید"
              />
              <TechnicalSpecField
                label="سیستم گرمایش"
                options={heatingOptions}
                value={specs.heatingSystem}
                onChange={(value) => setSpecs((current) => ({ ...current, heatingSystem: value }))}
                otherPlaceholder="نوع سیستم گرمایش دلخواه را وارد کنید"
              />
              <TechnicalSpecField
                label="نوع پنجره"
                options={windowOptions}
                value={specs.windowType}
                onChange={(value) => setSpecs((current) => ({ ...current, windowType: value }))}
                otherPlaceholder="نوع پنجره دلخواه را وارد کنید"
              />
              <ProjectField label="تعداد آسانسور">
                <input
                  value={String(specs.elevatorCount)}
                  onChange={(event) => setSpecs((current) => ({ ...current, elevatorCount: Number(event.target.value) || 0 }))}
                  inputMode="numeric"
                  placeholder="0"
                />
              </ProjectField>
              <TechnicalSpecField
                label="سیستم امنیتی"
                options={securityOptions}
                value={specs.securitySystem}
                onChange={(value) => setSpecs((current) => ({ ...current, securitySystem: value }))}
                otherPlaceholder="نوع سیستم امنیتی دلخواه را وارد کنید"
              />
              <TechnicalSpecField
                label="سیستم اطفا / اعلام حریق"
                options={fireSystemOptions}
                value={specs.fireSystem}
                onChange={(value) => setSpecs((current) => ({ ...current, fireSystem: value }))}
                otherPlaceholder="نوع سیستم اعلام/اطفا دلخواه را وارد کنید"
              />
              <TechnicalSpecField
                label="زیرساخت اینترنت"
                options={internetOptions}
                value={specs.internetStatus}
                onChange={(value) => setSpecs((current) => ({ ...current, internetStatus: value }))}
                otherPlaceholder="نوع زیرساخت اینترنت دلخواه را وارد کنید"
              />
              <TechnicalSpecField
                label="دسترسی پارکینگ"
                options={parkingAccessOptions}
                value={specs.parkingAccess}
                onChange={(value) => setSpecs((current) => ({ ...current, parkingAccess: value }))}
                otherPlaceholder="نوع دسترسی پارکینگ دلخواه را وارد کنید"
              />
            </div>

            <ProjectField label="یادداشت فنی">
              <ProjectTextarea
                value={specs.technicalNotes}
                onChange={(value) => setSpecs((current) => ({ ...current, technicalNotes: value.slice(0, 800) }))}
                placeholder="جزئیات تکمیلی مثل برند تجهیزات، کیفیت اجرا، آیتم‌های خاص پروژه یا محدودیت‌های فنی را وارد کنید."
              />
            </ProjectField>

            <div className="business-block-form-actions">
              <button type="button" className="business-block-form-submit" onClick={submit} disabled={saving}>
                {saving ? 'در حال ذخیره...' : 'ذخیره مشخصات فنی'}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export function ProjectAddressPanel() {
  const [address, setAddress] = useState<ProjectAddressData>(defaultAddressData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [mapStatus, setMapStatus] = useState(neshanMapKey ? 'در حال آماده‌سازی مپ نشان...' : 'کلید وب‌سرویس نشان تنظیم نشده است.');
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<ProjectMapInstance | null>(null);
  const markerRef = useRef<ProjectMapMarker | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadAddress() {
      setLoading(true);
      setMessage('');
      try {
        const response = await fetch('/api/business-settings/project/address', { cache: 'no-store' });
        const data = (await response.json()) as { address?: ProjectAddressData; message?: string };
        if (!response.ok) throw new Error(data.message ?? 'دریافت آدرس پروژه ناموفق بود.');
        if (!cancelled) setAddress({ ...defaultAddressData, ...data.address });
      } catch (err) {
        if (!cancelled) setMessage(err instanceof Error ? err.message : 'دریافت آدرس پروژه ناموفق بود.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAddress();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function initializeMap() {
      if (!mapElementRef.current) return;
      try {
        const L = await ensureLeafletAssets();
        if (!active || !mapElementRef.current) return;

        const hasCoordinates = Boolean(address.latitude && address.longitude);
        const initialCenter: [number, number] = hasCoordinates ? [address.latitude, address.longitude] : defaultProjectMapCenter;
        const map = L.map(mapElementRef.current, {
          key: neshanMapKey,
          maptype: 'dreamy',
          poi: true,
          traffic: false,
          center: initialCenter,
          zoom: hasCoordinates ? 15 : 12,
        });

        if (hasCoordinates) {
          markerRef.current = L.circleMarker(initialCenter, {
            radius: 10,
            weight: 3,
            color: '#0f766e',
            fillColor: '#14b8a6',
            fillOpacity: 0.28,
          }).addTo(map);
          setMapStatus('موقعیت انتخاب‌شده روی مپ نمایش داده می‌شود.');
        } else {
          setMapStatus('برای ثبت لوکیشن، روی مپ کلیک کنید.');
        }

        map.on('click', (event) => {
          if (!event.latlng) return;
          const nextLat = Number(event.latlng.lat.toFixed(6));
          const nextLng = Number(event.latlng.lng.toFixed(6));

          setAddress((current) => ({
            ...current,
            latitude: nextLat,
            longitude: nextLng,
          }));
          setMapStatus('لوکیشن پروژه روی مپ ثبت شد.');

          if (markerRef.current) markerRef.current.setLatLng([nextLat, nextLng]);
          else {
            markerRef.current = L.circleMarker([nextLat, nextLng], {
              radius: 10,
              weight: 3,
              color: '#0f766e',
              fillColor: '#14b8a6',
              fillOpacity: 0.28,
            }).addTo(map);
          }
        });

        mapInstanceRef.current = map;
        window.setTimeout(() => {
          map.invalidateSize();
        }, 80);
      } catch (error) {
        if (!active) return;
        setMapStatus(error instanceof Error ? error.message : 'بارگذاری مپ ناموفق بود.');
      }
    }

    initializeMap();

    return () => {
      active = false;
      markerRef.current = null;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const hasCoordinates = Boolean(address.latitude && address.longitude);
    if (!mapInstanceRef.current) return;

    if (!hasCoordinates) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      mapInstanceRef.current.setView(defaultProjectMapCenter, 12);
      setMapStatus('برای ثبت لوکیشن، روی مپ کلیک کنید.');
      return;
    }

    const nextCenter: [number, number] = [address.latitude, address.longitude];
    mapInstanceRef.current.setView(nextCenter, 15);
    if (markerRef.current) markerRef.current.setLatLng(nextCenter);
    setMapStatus('موقعیت انتخاب‌شده روی مپ نمایش داده می‌شود.');
  }, [address.latitude, address.longitude]);

  async function submit() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/business-settings/project/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      const data = (await response.json()) as { address?: ProjectAddressData; message?: string };
      if (!response.ok) throw new Error(data.message ?? 'ذخیره آدرس پروژه ناموفق بود.');
      setAddress({ ...defaultAddressData, ...data.address });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ذخیره آدرس پروژه ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  const addressPreview = [address.province, address.city, address.district, address.neighborhood, address.street, address.alley, address.plaque].filter(Boolean);
  const coordinatesReady = Boolean(address.latitude && address.longitude);
  const provinceData = address.province ? (projectAddressDirectory[address.province as keyof typeof projectAddressDirectory] as unknown as AddressCityMap | undefined) : undefined;
  const cityData = address.city && provinceData ? provinceData[address.city] : undefined;
  const provinceOptions = Object.keys(projectAddressDirectory).map((item) => ({ value: item, label: item }));
  const cityOptions = provinceData ? Object.keys(provinceData).map((item) => ({ value: item, label: item })) : [];
  const districtOptions = cityData ? Object.keys(cityData).map((item) => ({ value: item, label: item })) : [];
  const neighborhoodOptions =
    cityData && address.district
      ? (cityData[address.district] ?? []).map((item) => ({ value: item, label: item }))
      : [];

  function selectProvince(value: string) {
    setAddress((current) => ({ ...current, province: value, city: '', district: '', neighborhood: '' }));
  }

  function selectCity(value: string) {
    setAddress((current) => ({ ...current, city: value, district: '', neighborhood: '' }));
  }

  function selectDistrict(value: string) {
    setAddress((current) => ({ ...current, district: value, neighborhood: '' }));
  }

  return (
    <section className="business-block-form-page" aria-label="آدرس پروژه">
      <div className="business-block-form-card project-flow-form-card">
        <ProjectHero
          icon={MapPin}
          title="آدرس پروژه"
          description="آدرس کامل پروژه را برای قراردادها، مکاتبات و گزارش‌ها ثبت کنید."
        />

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت آدرس پروژه...</div> : null}

        {!loading ? (
          <>
            <div className="project-stats-grid">
              <ProjectStatCard label="استان" value={address.province || '---'} />
              <ProjectStatCard label="شهر" value={address.city || '---'} accent="amber" />
              <ProjectStatCard label="مختصات" value={coordinatesReady ? 'ثبت شده' : 'ثبت نشده'} accent="slate" />
              <ProjectStatCard label="پلاک" value={address.plaque || '---'} />
            </div>

            <div className="project-address-map-card">
              <div className="project-address-map-head">
                <div>
                  <strong>انتخاب موقعیت روی مپ نشان</strong>
                  <p>{mapStatus}</p>
                </div>
                {coordinatesReady ? (
                  <button
                    type="button"
                    className="business-block-form-cancel"
                    onClick={() =>
                      setAddress((current) => ({
                        ...current,
                        latitude: 0,
                        longitude: 0,
                      }))
                    }
                  >
                    حذف لوکیشن
                  </button>
                ) : null}
              </div>
              <div ref={mapElementRef} className="project-address-map" />
              <div className="business-unit-selected-tags">
                <span>عرض جغرافیایی: {coordinatesReady ? address.latitude.toFixed(6) : '---'}</span>
                <span>طول جغرافیایی: {coordinatesReady ? address.longitude.toFixed(6) : '---'}</span>
              </div>
            </div>

            <div className="project-flow-grid">
              <FieldGroup label="استان">
                <InlineSelect
                  value={address.province}
                  onSelect={selectProvince}
                  options={provinceOptions}
                  placeholder="انتخاب استان"
                  searchPlaceholder="جستجو در استان‌ها..."
                  emptyText="استانی پیدا نشد"
                />
              </FieldGroup>
              <FieldGroup label="شهر">
                <InlineSelect
                  value={address.city}
                  onSelect={selectCity}
                  options={cityOptions}
                  placeholder={address.province ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید'}
                  searchPlaceholder="جستجو در شهرها..."
                  emptyText="شهری پیدا نشد"
                />
              </FieldGroup>
              <FieldGroup label="منطقه">
                <InlineSelect
                  value={address.district}
                  onSelect={selectDistrict}
                  options={districtOptions}
                  placeholder={address.city ? 'انتخاب منطقه' : 'ابتدا شهر را انتخاب کنید'}
                  searchPlaceholder="جستجو در منطقه‌ها..."
                  emptyText="منطقه‌ای پیدا نشد"
                />
              </FieldGroup>
              <FieldGroup label="محله">
                <InlineSelect
                  value={address.neighborhood}
                  onSelect={(value) => setAddress((current) => ({ ...current, neighborhood: value }))}
                  options={neighborhoodOptions}
                  placeholder={address.district ? 'انتخاب محله' : 'ابتدا منطقه را انتخاب کنید'}
                  searchPlaceholder="جستجو در محله‌ها..."
                  emptyText="محله‌ای پیدا نشد"
                />
              </FieldGroup>
              <ProjectField label="خیابان">
                <input value={address.street} onChange={(event) => setAddress((current) => ({ ...current, street: event.target.value.slice(0, 120) }))} placeholder="مثلاً بلوار سرو" />
              </ProjectField>
              <ProjectField label="کوچه">
                <input value={address.alley} onChange={(event) => setAddress((current) => ({ ...current, alley: event.target.value.slice(0, 120) }))} placeholder="مثلاً کوچه گلستان" />
              </ProjectField>
              <ProjectField label="پلاک">
                <input value={address.plaque} onChange={(event) => setAddress((current) => ({ ...current, plaque: event.target.value.slice(0, 30) }))} placeholder="مثلاً 14" />
              </ProjectField>
              <ProjectField label="کد پستی">
                <input value={address.postalCode} onChange={(event) => setAddress((current) => ({ ...current, postalCode: event.target.value.slice(0, 20) }))} inputMode="numeric" placeholder="مثلاً 1998712345" />
              </ProjectField>
            </div>

            <ProjectField label="شرح تکمیلی آدرس">
              <ProjectTextarea
                value={address.addressNotes}
                onChange={(value) => setAddress((current) => ({ ...current, addressNotes: value.slice(0, 800) }))}
                placeholder="ورودی، دسترسی، توضیحات تکمیلی محل پروژه یا هر نکته آدرس را وارد کنید."
              />
            </ProjectField>

            {addressPreview.length ? (
              <div className="business-unit-selected-tags">
                {addressPreview.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            ) : null}

            <div className="business-block-form-actions">
              <button type="button" className="business-block-form-submit" onClick={submit} disabled={saving}>
                {saving ? 'در حال ذخیره...' : 'ذخیره آدرس'}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export function ProjectFilesPanel() {
  return (
    <section className="business-block-form-page" aria-label="فایل‌های پروژه">
      <div className="business-block-form-card project-flow-form-card">
        <ProjectHero
          icon={FileText}
          title="فایل‌های پروژه"
          description="اسناد، نقشه‌ها، تصاویر رسمی و فایل‌های تکمیلی پروژه را از این بخش مدیریت کنید."
        />

        <div className="project-stats-grid">
          <ProjectStatCard label="نقشه معماری" value="در انتظار" accent="slate" />
          <ProjectStatCard label="پروانه ساخت" value="در انتظار" accent="amber" />
          <ProjectStatCard label="گزارش فنی" value="در انتظار" accent="slate" />
          <ProjectStatCard label="آلبوم تصاویر" value="در انتظار" accent="teal" />
        </div>

        <div className="business-blocks-state">
          برای این بخش route مستقل ایجاد شد. اگر بخواهی، در مرحله بعدی آپلود واقعی فایل، پیش‌نمایش و دسته‌بندی اسناد را هم روی همین صفحه اضافه می‌کنم.
        </div>
      </div>
    </section>
  );
}

export function ProjectSummaryPanel() {
  return (
    <section className="business-block-form-page" aria-label="خلاصه اطلاعات پروژه">
      <div className="business-block-form-card project-flow-form-card">
        <ProjectHero
          icon={ClipboardList}
          title="خلاصه اطلاعات پروژه"
          description="نمای سریع از مسیرهای اصلی تنظیمات و بخش‌های کلیدی پروژه را ببینید."
        />

        <div className="project-stats-grid">
          <ProjectStatCard label="بلوک‌ها" value="—" />
          <ProjectStatCard label="طبقات" value="—" accent="amber" />
          <ProjectStatCard label="واحدها" value="—" />
          <ProjectStatCard label="قراردادها" value="—" accent="slate" />
        </div>

        <div className="business-blocks-toolbar">
          <Link href="/business-settings/project" className="business-blocks-add">
            <Building2 />
            <span>تنظیمات پروژه</span>
          </Link>
          <Link href="/business-settings/project/blocks" className="business-blocks-add">
            <Grid2X2 />
            <span>بلوک‌ها و طبقات</span>
          </Link>
          <Link href="/business-settings/project/reports" className="business-blocks-add">
            <FileText />
            <span>گزارش‌ها</span>
          </Link>
          <Link href="/business-settings/project/technical-specs" className="business-blocks-add">
            <Wrench />
            <span>مشخصات فنی</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
