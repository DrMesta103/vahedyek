'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Check,
  Hash,
  Search,
  User,
  X,
} from 'lucide-react';
import { StickySubmitBar } from './StickySubmitBar';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import { PersianDatePicker } from '../../../../components/ui/PersianDatePicker';
import { validateStep1 } from '../../../../lib/contractValidation';
import { ensureActiveDraftId, getReferenceData, getStepData, saveStepData } from '../../../../lib/contractDraftClient';
import type { ContractSubjectData } from '../../../../types/contract';
import { dispatchContractFlowDirty, dispatchContractFlowSaved } from './contractFlowSignals';

type EmployeeOption = { id: string; firstName: string; lastName: string };
type BlockOption = {
  id: string;
  name: string;
  units: Array<{ id: string; name: string; floorName: string; title: string }>;
};

// ─── Primitives ──────────────────────────────────────────────────────────────

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ label, description }: { label: string; description?: string }) {
  return (
    <div className="border-b border-slate-100 px-5 py-4">
      <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      {description ? <p className="mt-0.5 text-[13px] text-slate-500">{description}</p> : null}
    </div>
  );
}

function FieldGroup({ label, required, hint, children }: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[13px] font-medium text-slate-600">
        {label}
        {required ? <span className="text-rose-500">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      {Icon ? (
        <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      ) : null}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-[42px] w-full rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:bg-slate-50 disabled:text-slate-400 ${Icon ? 'pr-10 pl-3.5' : 'px-3.5'}`}
      />
    </div>
  );
}

function DateInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <PersianDatePicker
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? 'انتخاب تاریخ'}
        className="h-[42px] w-full rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] pr-10 pl-3.5 text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
      />
    </div>
  );
}

// ─── Contract Number Input ────────────────────────────────────────────────────

function ContractNumberInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [suggestedNumber, setSuggestedNumber] = useState('');

  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        const res = await fetch('/api/contracts/generate-number');
        if (res.ok) {
          const data = (await res.json()) as { contractNumber: string };
          setSuggestedNumber(data.contractNumber);
        }
      } catch {
        // silent fail
      }
    };
    void fetchSuggestion();
  }, []);

  return (
    <div className="relative">
      <Hash className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={suggestedNumber || 'مثلاً ۱۴۰۳-۰۰۱'}
        className="h-[42px] w-full rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] pr-10 pl-3.5 text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
      />
    </div>
  );
}

// ─── Tag Pills ────────────────────────────────────────────────────────────────

function TagPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-full border-[0.5px] px-4 text-[12px] transition-all ${
        active
          ? 'border-[#a6e8ef] bg-[#a6e8ef] font-semibold text-[#123b69]'
          : 'border-[#6e86a3] bg-white text-[#314a67] hover:bg-slate-50'
      }`}
    >
      {active ? <Check className="h-3 w-3 shrink-0 stroke-[2.75]" /> : null}
      {label}
    </button>
  );
}

function TagPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <TagPill
          key={opt.value}
          label={opt.label}
          active={value === opt.value}
          onClick={() => onChange(opt.value)}
        />
      ))}
    </div>
  );
}

// ─── Inline Searchable Select ─────────────────────────────────────────────────

function InlineSelect({
  value,
  onSelect,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
}: {
  value: string;
  onSelect: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((o) => o.label.includes(q));
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex h-[42px] w-full items-center justify-between rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-3.5 text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-all hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
          <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
            />
            {q ? (
              <button type="button" onClick={() => setQ('')}>
                <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            ) : null}
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length ? (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => { onSelect(o.value); setOpen(false); setQ(''); }}
                    className={`flex w-full items-center px-3 py-2 text-right text-[13px] transition-colors hover:bg-slate-50 ${
                      value === o.value ? 'font-semibold text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-center text-[12px] text-slate-400">{emptyText}</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// ─── Unit Selector ────────────────────────────────────────────────────────────

const ITEMS_PER_ROW = 8;

function TagGroup({
  label,
  items,
  selectedId,
  onSelect,
  emptyText,
}: {
  label: string;
  items: { id: string; name: string; sub?: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  emptyText: string;
}) {
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = q.trim()
    ? items.filter((i) => i.name.includes(q) || (i.sub ?? '').includes(q))
    : items;

  const visible = expanded ? filtered : filtered.slice(0, ITEMS_PER_ROW);
  const hasMore = filtered.length > ITEMS_PER_ROW;

  const openSearch = () => {
    setSearchOpen(true);
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQ('');
    setExpanded(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-[13px] font-medium text-slate-600">
          {label}
          <span className="text-rose-500">*</span>
        </label>

        {/* آیکون سرچ — ۴px بالاتر، فقط وقتی بسته‌ست */}
        {!searchOpen ? (
          <button
            type="button"
            onClick={openSearch}
            className="relative top-[4px] flex h-4 w-4 items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-600"
          >
            <Search className="h-3 w-3" />
          </button>
        ) : null}

        {/* input سرچ — همیشه mount، با max-width انیمیشن */}
        <div
          className={`relative flex items-center overflow-hidden rounded-md border bg-white transition-[max-width,opacity,border-color] duration-200 ease-out ${
            searchOpen
              ? 'max-w-[176px] border-slate-300 opacity-100'
              : 'max-w-0 border-transparent opacity-0'
          }`}
          style={{ height: '22px' }}
        >
          <Search className="pointer-events-none absolute right-1.5 h-2.5 w-2.5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`جستجو در ${label}...`}
            tabIndex={searchOpen ? 0 : -1}
            className="h-full w-44 bg-transparent pr-6 pl-6 text-[10px] font-light text-slate-600 placeholder:text-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={closeSearch}
            tabIndex={searchOpen ? 0 : -1}
            className="absolute left-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-[12px] text-slate-400">{emptyText}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {visible.map((item) => (
              <TagPill
                key={item.id}
                label={item.sub ? `${item.name} · ${item.sub}` : item.name}
                active={selectedId === item.id}
                onClick={() => onSelect(item.id)}
              />
            ))}
            {filtered.length === 0 ? (
              <p className="text-[12px] text-slate-400">موردی یافت نشد</p>
            ) : null}
          </div>

          {hasMore ? (
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700"
            >
              {expanded ? (
                <><ChevronUp className="h-3 w-3" /> نمایش کمتر</>
              ) : (
                <><ChevronDown className="h-3 w-3" /> {filtered.length - ITEMS_PER_ROW} مورد بیشتر</>
              )}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

function UnitSelector({
  blocks,
  selectedBlock,
  selectedUnit,
  onBlockChange,
  onUnitChange,
}: {
  blocks: BlockOption[];
  selectedBlock: string;
  selectedUnit: string;
  onBlockChange: (id: string) => void;
  onUnitChange: (id: string) => void;
}) {
  const blockData = blocks.find((b) => b.id === selectedBlock);

  return (
    <div className="space-y-4">
      <TagGroup
        label="بلوک"
        items={blocks.map((b) => ({ id: b.id, name: b.name }))}
        selectedId={selectedBlock}
        onSelect={(id) => { onBlockChange(id); onUnitChange(''); }}
        emptyText="بلوکی تعریف نشده است"
      />

      {blockData ? (
        <TagGroup
          label="واحد"
          items={blockData.units.map((u) => ({ id: u.id, name: u.name, sub: u.floorName }))}
          selectedId={selectedUnit}
          onSelect={onUnitChange}
          emptyText="واحدی در این بلوک وجود ندارد"
        />
      ) : null}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SubjectStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [formerEmployees, setFormerEmployees] = useState<Array<{ id: string; fullName: string }>>([]);
  const [blocks, setBlocks] = useState<BlockOption[]>([]);

  const [issuerType, setIssuerType] = useState<'self' | 'former' | 'staff'>('self');
  const [formerEmployeeName, setFormerEmployeeName] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedContractType, setSelectedContractType] = useState<'sale' | 'pre-sale'>('pre-sale');
  const [contractDate, setContractDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const staffOptions = useMemo(
    () => employees.map((e) => ({ label: `${e.firstName} ${e.lastName}`, value: e.id })),
    [employees],
  );

  const formerEmployeeOptions = useMemo(
    () => formerEmployees.map((e) => ({ label: e.fullName, value: e.fullName })),
    [formerEmployees],
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const [referenceData, subjectData] = await Promise.all([
          getReferenceData(),
          getStepData<ContractSubjectData>(id, 'subject'),
        ]);
        if (!mounted) return;
        setDraftId(id);
        setEmployees(referenceData.employees);
        setFormerEmployees(referenceData.formerEmployees);
        setBlocks(referenceData.blocks);
        if (subjectData) {
          if (subjectData.contractor.type === 'employee') setIssuerType('staff');
          else if (subjectData.contractor.type === 'former-employee') setIssuerType('former');
          else setIssuerType('self');
          setFormerEmployeeName(
            [subjectData.contractor.formerFirstName, subjectData.contractor.formerLastName].filter(Boolean).join(' '),
          );
          setSelectedStaff(subjectData.contractor.employeeId ?? '');
          setSelectedContractType(subjectData.contractType);
          setContractDate(subjectData.contractDate);
          setDeliveryDate(subjectData.deliveryDate);
          setContractNumber(subjectData.contractNumber);
          setSelectedBlock(subjectData.blockId);
          setSelectedUnit(subjectData.unitId);
        }
      } catch (error) {
        if (mounted) setFormError(error instanceof Error ? error.message : 'بارگذاری اطلاعات پایه انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const buildPayload = (): ContractSubjectData => {
    const contractor =
      issuerType === 'staff'
        ? { type: 'employee' as const, employeeId: selectedStaff }
        : issuerType === 'former'
          ? {
              type: 'former-employee' as const,
              formerFirstName: formerEmployeeName.split(' ')[0] ?? '',
              formerLastName: formerEmployeeName.split(' ').slice(1).join(' '),
            }
          : { type: 'self' as const };
    return { contractor, contractType: selectedContractType, contractDate, contractNumber, deliveryDate, blockId: selectedBlock, unitId: selectedUnit };
  };

  const handleSubmit = async () => {
    if (!draftId) return;
    const payload = buildPayload();
    const validation = validateStep1(payload);
    if (!validation.valid) {
      setFormError(
        validation.errors.contractType ?? validation.errors.contractDate ?? validation.errors.contractNumber ??
        validation.errors.deliveryDate ?? validation.errors.blockId ?? validation.errors.unitId ??
        validation.errors['contractor.employeeId'] ?? validation.errors['contractor.formerFirstName'] ??
        validation.errors['contractor.formerLastName'] ?? 'اطلاعات پایه معتبر نیست.',
      );
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await saveStepData(draftId, 'subject', payload);
      initialSnapshotRef.current = JSON.stringify(payload);
      dispatchContractFlowDirty(stepId as 'subject', false);
      dispatchContractFlowSaved(stepId as 'subject');
      router.push(basePath);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ذخیره اطلاعات پایه انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (loading || !draftId) return;
    const snapshot = JSON.stringify(buildPayload());
    if (!initialSnapshotRef.current) {
      initialSnapshotRef.current = snapshot;
      dispatchContractFlowDirty(stepId as 'subject', false);
      return;
    }
    dispatchContractFlowDirty(stepId as 'subject', snapshot !== initialSnapshotRef.current);
  }, [contractDate, contractNumber, deliveryDate, draftId, formerEmployeeName, issuerType, loading, selectedBlock, selectedContractType, selectedStaff, selectedUnit, stepId]);

  return (
    <div className="space-y-4">
      {!embedded ? (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="mt-0.5 text-[13px] text-slate-500">اطلاعات پایه و اولیه قرارداد را وارد کنید.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push(basePath)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] text-slate-600 transition-colors hover:bg-slate-50"
          >
            بازگشت
          </button>
        </div>
      ) : null}

      {formError ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
          {formError}
        </div>
      ) : null}

      {/* ── منعقدکننده ── */}
      <SectionCard>
        <SectionHeader label="منعقدکننده قرارداد" description="فردی که این قرارداد را با مشتری منعقد کرده مشخص کنید" />
        <div className="space-y-4 p-5">
          <TagPills
            value={issuerType}
            onChange={(v) => setIssuerType(v as 'self' | 'former' | 'staff')}
            options={[
              { value: 'self', label: 'خودم' },
              { value: 'former', label: 'کارمند سابق' },
              { value: 'staff', label: 'سایر کارمندان' },
            ]}
          />

          {issuerType === 'former' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup label="انتخاب از لیست سابقین">
                <InlineSelect
                  value={formerEmployeeName}
                  onSelect={setFormerEmployeeName}
                  options={formerEmployeeOptions}
                  placeholder="در صورت وجود انتخاب کنید"
                  searchPlaceholder="جستجو..."
                  emptyText="کارمند سابقی ثبت نشده"
                />
              </FieldGroup>
              <FieldGroup label="نام کامل کارمند سابق" hint="در صورت عدم وجود در لیست، دستی وارد کنید">
                <TextInput
                  value={formerEmployeeName}
                  onChange={setFormerEmployeeName}
                  placeholder="نام و نام خانوادگی"
                  icon={User}
                />
              </FieldGroup>
            </div>
          ) : null}

          {issuerType === 'staff' ? (
            <FieldGroup label="انتخاب کارمند">
              <InlineSelect
                value={selectedStaff}
                onSelect={setSelectedStaff}
                options={staffOptions}
                placeholder="یک کارمند را انتخاب کنید"
                searchPlaceholder="جستجو در کارمندان..."
                emptyText="کارمندی پیدا نشد"
              />
            </FieldGroup>
          ) : null}
        </div>
      </SectionCard>

      {/* ── نوع قرارداد + شماره + تاریخ‌ها ── */}
      <SectionCard>
        <SectionHeader label="مشخصات قرارداد" />
        <div className="space-y-5 p-5">
          {/* ردیف اول: نوع قرارداد */}
          <FieldGroup label="نوع قرارداد" required>
            <TagPills
              value={selectedContractType}
              onChange={(v) => setSelectedContractType(v as 'sale' | 'pre-sale')}
              options={[
                { value: 'pre-sale', label: 'پیش‌فروش' },
                { value: 'sale', label: 'فروش' },
              ]}
            />
          </FieldGroup>

          {/* ردیف دوم: شماره + تاریخ عقد */}
          <div className="grid gap-4 md:grid-cols-2">
            <FieldGroup label="شماره قرارداد" required hint="باید یکتا باشد">
              <ContractNumberInput
                value={contractNumber}
                onChange={setContractNumber}
              />
            </FieldGroup>

            <FieldGroup label="زمان عقد قرارداد" required>
              <DateInput
                value={contractDate}
                onChange={setContractDate}
                placeholder="انتخاب تاریخ"
              />
            </FieldGroup>
          </div>

          {/* ردیف سوم: تاریخ تحویل */}
          <div className="grid gap-4 md:grid-cols-2">
            <FieldGroup label="تاریخ تحویل واحد" required hint="تعهد رسمی شرکت سازنده">
              <div className="relative">
                <CalendarClock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <PersianDatePicker
                  value={deliveryDate}
                  onChange={setDeliveryDate}
                  placeholder="انتخاب تاریخ"
                  className="h-[42px] w-full rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] pr-10 pl-3.5 text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>
            </FieldGroup>
            <div />
          </div>
        </div>
      </SectionCard>

      {/* ── انتخاب واحد ── */}
      <SectionCard>
        <SectionHeader label="انتخاب واحد" description="ابتدا بلوک، سپس واحد مورد نظر را انتخاب کنید" />
        <div className="p-5">
          <UnitSelector
            blocks={blocks}
            selectedBlock={selectedBlock}
            selectedUnit={selectedUnit}
            onBlockChange={setSelectedBlock}
            onUnitChange={setSelectedUnit}
          />
        </div>
      </SectionCard>

      <StickySubmitBar
        label="ذخیره اطلاعات پایه"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
      />
    </div>
  );
}
