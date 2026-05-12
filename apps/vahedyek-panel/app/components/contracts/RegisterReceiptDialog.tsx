'use client';

import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowRight, Banknote, Building2, Camera, Check, ChevronDown, FileAudio, FileImage, FileText, Info, Plus, Settings, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input, PersianDatePicker } from '@repo/ui';
import type { DueRegisterReceiptPayload } from './DueMonthAccordionList';
import type {
  ReceiptAllocationMode,
  ReceiptDocument,
  ReceiptDocumentFile,
  ReceiptPaymentFieldsPersisted,
  ReceiptTransferKind,
  RegisteredReceiptRecord,
} from '../../lib/contractReceipts';
import { fetchProfileStore, type BankAccountRecord } from '../../(panel)/business-settings/profile/_components/profileStorage';
import { fixMojibake } from '../../lib/fixMojibake';
import { FieldHint } from '../ui/field-hint';

const TRANSFER_KINDS: { id: ReceiptTransferKind; label: string }[] = [
  { id: 'card_to_card', label: 'کارت به کارت' },
  { id: 'account_transfer', label: 'حساب به حساب' },
  { id: 'remittance', label: 'حواله' },
  { id: 'cheque', label: 'چک' },
  { id: 'cash', label: 'نقد' },
];

const MOCK_DEST_CARDS = [
  { value: '', label: 'انتخاب شماره کارت مقصد' },
  { value: '6037991234567890', label: 'کارت یک — ۶۰۳۷۹۹…۸۹۰' },
];

const MOCK_DEST_ACCOUNTS = [
  { value: '', label: 'انتخاب شماره حساب مقصد' },
  { value: '9876543210', label: 'حساب سپرده — ۹۸۷۶۵۴۳۲۱۰' },
];

const MOCK_DEST_SHEBAS = [
  { value: '', label: 'انتخاب شماره شبا مقصد' },
  { value: 'IR910120010000009876543901', label: 'شبای پروژه — IR۹۱…۹۰۱' },
];

const inputCls =
  'h-11 w-full rounded-2xl border border-slate-200/95 bg-[image:var(--control-bg-gradient)] px-4 text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition placeholder:text-slate-400 focus:border-[color-mix(in_srgb,var(--dark-teal)_45%,#94a3b8)] focus:ring-[3px] focus:ring-[color-mix(in_srgb,var(--dark-teal)_22%,transparent)]';

const RECEIPT_DIALOG_DRAFT_PREFIX = 'vahedyek.register-receipt-dialog';

const RECEIPT_DOCUMENT_CATEGORIES = ['تصویر فیش', 'رسید بانکی', 'مستندات پرداخت', 'سایر'] as const;
const RECEIPT_DOCUMENT_TITLES = ['فیش واریزی', 'رسید کارت به کارت', 'رسید انتقال حساب', 'رسید شبا', 'رسید نقدی'] as const;

function createLocalId(prefix = 'id') {
  try {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `${prefix}-${uuid}`;
  } catch {
    // Fallback below.
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });
}

function formatAmountInput(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function Req() {
  return <span className="font-black text-rose-500">*</span>;
}

export function RegisterReceiptDialog({
  open,
  context,
  contractId,
  allocationMode = 'direct',
  editReceipt = null,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  context: DueRegisterReceiptPayload | null;
  contractId?: string;
  allocationMode?: ReceiptAllocationMode;
  /** When set, dialog loads this record and submit overwrites the same id. */
  editReceipt?: RegisteredReceiptRecord | null;
  onClose: () => void;
  onSubmitted?: (receipt: RegisteredReceiptRecord) => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const sourceCardInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [destinationAccounts, setDestinationAccounts] = useState<BankAccountRecord[]>([]);
  const [destinationAccountsLoading, setDestinationAccountsLoading] = useState(false);

  const [transferKind, setTransferKind] = useState<ReceiptTransferKind>('card_to_card');
  const [sourceCardParts, setSourceCardParts] = useState(['', '', '', '']);
  const [sourceCardHolder, setSourceCardHolder] = useState('');
  const [sourceAccount, setSourceAccount] = useState('');
  const [sourceAccountHolder, setSourceAccountHolder] = useState('');
  const [sourceSheba, setSourceSheba] = useState('');
  const [sourceShebaHolder, setSourceShebaHolder] = useState('');
  const [chequeOwner, setChequeOwner] = useState('');
  const [chequeBank, setChequeBank] = useState('');
  const [chequeSayadi, setChequeSayadi] = useState('');
  const [chequeSeries, setChequeSeries] = useState('');
  const [chequeSerial, setChequeSerial] = useState('');
  const [depositorName, setDepositorName] = useState('');

  const [paidAmount, setPaidAmount] = useState('');
  const [depositDate, setDepositDate] = useState('');
  const [depositTime, setDepositTime] = useState('');
  const [destinationSelect, setDestinationSelect] = useState('');
  const [destinationHolder, setDestinationHolder] = useState('');
  const [destinationHolders, setDestinationHolders] = useState<string[]>([]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  const [receiptDocuments, setReceiptDocuments] = useState<ReceiptDocument[]>([]);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [docCategoryInput, setDocCategoryInput] = useState('');
  const [docSelectedCategory, setDocSelectedCategory] = useState('');
  const [docTitleInput, setDocTitleInput] = useState('');
  const [docSelectedTitle, setDocSelectedTitle] = useState('');
  const [docDate, setDocDate] = useState('');
  const [docUploading, setDocUploading] = useState(false);
  const [docDraftFiles, setDocDraftFiles] = useState<ReceiptDocumentFile[]>([]);
  const docImageInputRef = useRef<HTMLInputElement | null>(null);
  const docCameraInputRef = useRef<HTMLInputElement | null>(null);
  const docAudioInputRef = useRef<HTMLInputElement | null>(null);
  const docFileInputRef = useRef<HTMLInputElement | null>(null);

  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getDraftKey = useCallback((rowId: string) => `${RECEIPT_DIALOG_DRAFT_PREFIX}.${rowId}`, []);
  const activeDraftId = editReceipt
    ? `edit.${editReceipt.id}`
    : context?.row.id ?? `auto.${contractId ?? 'unknown'}`;

  const effectiveAllocationMode = editReceipt?.allocationMode ?? allocationMode;

  const applyReceiptFromRecord = useCallback((receipt: RegisteredReceiptRecord) => {
    const pf: ReceiptPaymentFieldsPersisted | undefined = receipt.paymentFields;
    setTransferKind(receipt.transferKind);
    if (pf?.sourceCardParts?.length) {
      setSourceCardParts(pf.sourceCardParts.concat(['', '', '', '']).slice(0, 4));
    } else {
      setSourceCardParts(['', '', '', '']);
    }
    setSourceCardHolder(pf?.sourceCardHolder ?? '');
    setSourceAccount(pf?.sourceAccount ?? '');
    setSourceAccountHolder(pf?.sourceAccountHolder ?? '');
    setSourceSheba(pf?.sourceSheba ?? '');
    setSourceShebaHolder(pf?.sourceShebaHolder ?? '');
    setChequeOwner(pf?.chequeOwner ?? '');
    setChequeBank(pf?.chequeBank ?? '');
    setChequeSayadi(pf?.chequeSayadi ?? '');
    setChequeSeries(pf?.chequeSeries ?? '');
    setChequeSerial(pf?.chequeSerial ?? '');
    setDepositorName(receipt.depositorName);
    setPaidAmount(formatAmountInput(String(Math.max(0, Math.round(Number(receipt.paidAmountRial) || 0)))));
    setDepositDate(receipt.depositDate);
    setDepositTime(receipt.depositTime);
    setDestinationSelect(receipt.destinationValue);
    setDestinationHolder(receipt.destinationHolder);
    setDestinationHolders(Array.isArray(receipt.destinationHolders) ? receipt.destinationHolders : []);
    setTrackingNumber(receipt.trackingNumber);
    setReferenceNumber(receipt.referenceNumber);
    setReceiptNumber(receipt.receiptNumber);
    setReceiptDocuments(Array.isArray(receipt.documents) ? receipt.documents : []);
  }, []);

  const resetDocumentDialog = useCallback(() => {
    setDocCategoryInput('');
    setDocSelectedCategory('');
    setDocTitleInput('');
    setDocSelectedTitle('');
    setDocDate('');
    setDocDraftFiles([]);
    setDocUploading(false);
  }, []);

  const resetForm = useCallback(() => {
    setTransferKind('card_to_card');
    setSourceCardParts(['', '', '', '']);
    setSourceCardHolder('');
    setSourceAccount('');
    setSourceAccountHolder('');
    setSourceSheba('');
    setSourceShebaHolder('');
    setChequeOwner('');
    setChequeBank('');
    setChequeSayadi('');
    setChequeSeries('');
    setChequeSerial('');
    setDepositorName('');
    setPaidAmount('');
    setDepositDate('');
    setDepositTime('');
    setDestinationSelect('');
    setDestinationHolder('');
    setDestinationHolders([]);
    setTrackingNumber('');
    setReferenceNumber('');
    setReceiptNumber('');
    setReceiptDocuments([]);
    resetDocumentDialog();
    setSubmitError('');
  }, [resetDocumentDialog]);

  const restoreDraft = useCallback(
    (rowId: string) => {
      if (typeof window === 'undefined') return false;
      const raw = window.sessionStorage.getItem(getDraftKey(rowId));
      if (!raw) return false;

      try {
        const draft = JSON.parse(raw) as Partial<{
          transferKind: ReceiptTransferKind;
          sourceCardParts: string[];
          sourceCardHolder: string;
          sourceAccount: string;
          sourceAccountHolder: string;
          sourceSheba: string;
          sourceShebaHolder: string;
          chequeOwner: string;
          chequeBank: string;
          chequeSayadi: string;
          chequeSeries: string;
          chequeSerial: string;
          depositorName: string;
          paidAmount: string;
          depositDate: string;
          depositTime: string;
          destinationSelect: string;
          destinationHolder: string;
          destinationHolders: string[];
          trackingNumber: string;
          referenceNumber: string;
          receiptNumber: string;
          receiptDocuments: ReceiptDocument[];
        }>;

        if (draft.transferKind) setTransferKind(draft.transferKind);
        if (Array.isArray(draft.sourceCardParts)) setSourceCardParts(draft.sourceCardParts.concat(['', '', '', '']).slice(0, 4));
        setSourceCardHolder(draft.sourceCardHolder ?? '');
        setSourceAccount(draft.sourceAccount ?? '');
        setSourceAccountHolder(draft.sourceAccountHolder ?? '');
        setSourceSheba(draft.sourceSheba ?? '');
        setSourceShebaHolder(draft.sourceShebaHolder ?? '');
        setChequeOwner(draft.chequeOwner ?? '');
        setChequeBank(draft.chequeBank ?? '');
        setChequeSayadi(draft.chequeSayadi ?? '');
        setChequeSeries(draft.chequeSeries ?? '');
        setChequeSerial(draft.chequeSerial ?? '');
        setDepositorName(draft.depositorName ?? '');
        setPaidAmount(draft.paidAmount ?? '');
        setDepositDate(draft.depositDate ?? '');
        setDepositTime(draft.depositTime ?? '');
        setDestinationSelect(draft.destinationSelect ?? '');
        setDestinationHolder(draft.destinationHolder ?? '');
        setDestinationHolders(Array.isArray(draft.destinationHolders) ? draft.destinationHolders : []);
        setTrackingNumber(draft.trackingNumber ?? '');
        setReferenceNumber(draft.referenceNumber ?? '');
        setReceiptNumber(draft.receiptNumber ?? '');
        setReceiptDocuments(Array.isArray(draft.receiptDocuments) ? draft.receiptDocuments : []);
        setSubmitError('');
        return true;
      } catch {
        window.sessionStorage.removeItem(getDraftKey(rowId));
        return false;
      }
    },
    [getDraftKey],
  );

  useEffect(() => {
    if (!open) return;
    if (editReceipt) {
      resetForm();
      applyReceiptFromRecord(editReceipt);
      setSubmitError('');
      return;
    }
    resetForm();
    restoreDraft(activeDraftId);
  }, [activeDraftId, applyReceiptFromRecord, editReceipt, open, resetForm, restoreDraft]);

  useEffect(() => {
    if (!open) return;
    let ignore = false;

    const loadDestinationAccounts = async () => {
      setDestinationAccountsLoading(true);
      try {
        const store = await fetchProfileStore();
        if (ignore) return;
        setDestinationAccounts((store.bankAccounts ?? []).filter((account) => account.showInContracts));
      } finally {
        if (!ignore) setDestinationAccountsLoading(false);
      }
    };

    void loadDestinationAccounts();

    return () => {
      ignore = true;
    };
  }, [open]);

  const dueHint = useMemo(() => {
    if (editReceipt) {
      return editReceipt.allocationMode === 'auto'
        ? 'ویرایش فیش اتوماتیک؛ پس از ذخیره، تخصیص دوباره از روی تاریخ و مبلغ محاسبه می‌شود.'
        : 'ویرایش فیش؛ پس از ذخیره، تخصیص بر اساس سررسید و ترتیب پرداخت به‌روز می‌شود.';
    }
    if (!context) return 'ثبت فیش اتوماتیک؛ مبلغ پرداختی از قدیمی‌ترین بدهی سررسیدها تخصیص داده می‌شود.';
    const { row, monthHeading } = context;
    return `${monthHeading} — ${row.title || 'سررسید'} · سررسید ${row.dueDate} · مبلغ ${Math.round(
      Number(row.amount) || 0,
    ).toLocaleString('fa-IR')} ریال`;
  }, [context, editReceipt]);

  const destinationOptions = useMemo(() => {
    const removeSpaces = (value: string) => value.replace(/\s+/g, '').trim();
    const fixedPlaceholderLabel =
      transferKind === 'card_to_card'
        ? '\u0627\u0646\u062a\u062e\u0627\u0628 \u0634\u0645\u0627\u0631\u0647 \u06a9\u0627\u0631\u062a \u0645\u0642\u0635\u062f'
        : transferKind === 'account_transfer'
          ? '\u0627\u0646\u062a\u062e\u0627\u0628 \u0634\u0645\u0627\u0631\u0647 \u062d\u0633\u0627\u0628 \u0645\u0642\u0635\u062f'
          : '\u0627\u0646\u062a\u062e\u0627\u0628 \u0634\u0645\u0627\u0631\u0647 \u0634\u0628\u0627 \u0645\u0642\u0635\u062f';
    const placeholderLabel =
      transferKind === 'card_to_card'
        ? 'Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ù…Ø§Ø±Ù‡ Ú©Ø§Ø±Øª Ù…Ù‚ØµØ¯'
        : transferKind === 'account_transfer'
          ? 'Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ù…Ø§Ø±Ù‡ Ø­Ø³Ø§Ø¨ Ù…Ù‚ØµØ¯'
          : 'Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ù…Ø§Ø±Ù‡ Ø´Ø¨Ø§ Ù…Ù‚ØµØ¯';
    const fieldName =
      transferKind === 'card_to_card'
        ? 'cardNumber'
        : transferKind === 'account_transfer'
          ? 'accountNumber'
          : 'sheba';

    const options = destinationAccounts
      .map((account) => {
        const rawValue = String(account[fieldName] ?? '').trim();
        if (!rawValue) return null;
        const optionValue = fieldName === 'sheba' ? rawValue : removeSpaces(rawValue);
        const owners = account.owners.map((owner) => fixMojibake(owner).trim()).filter(Boolean);
        const ownersText = owners.join('\u060c ');
        const bankName = fixMojibake(account.bankName).trim();
        const title = fixMojibake(account.title ?? '').trim();
        const titleText = title ? ` (${title})` : '';
        return {
          value: optionValue,
          label: `${bankName}${titleText} - ${rawValue}`,
          holder: ownersText,
          holders: owners,
        };
      })
      .filter((item): item is { value: string; label: string; holder: string; holders: string[] } => item !== null);

    return [
      {
        value: '',
        label: destinationAccountsLoading
          ? '\u062f\u0631 \u062d\u0627\u0644 \u062f\u0631\u06cc\u0627\u0641\u062a \u062d\u0633\u0627\u0628\u200c\u0647\u0627...'
          : fixedPlaceholderLabel,
        holder: '',
        holders: [],
      },
      ...options,
    ];
  }, [destinationAccounts, destinationAccountsLoading, transferKind]);

  const validate = (): boolean => {
    setSubmitError('');
    if ((depositorName ?? '').trim().length < 2) {
      setSubmitError('نام و نام خانوادگی واریزکننده را کامل کنید.');
      return false;
    }
    if (!(paidAmount ?? '').trim()) {
      setSubmitError('مبلغ پرداخت‌شده را وارد کنید.');
      return false;
    }
    if (!(depositDate ?? '').trim()) {
      setSubmitError('تاریخ واریز را انتخاب کنید.');
      return false;
    }
    if (transferKind !== 'cash' && !(depositTime ?? '').trim()) {
      setSubmitError('ساعت واریز را وارد کنید.');
      return false;
    }

    switch (transferKind) {
      case 'card_to_card': {
        const card = sourceCardParts.join('');
        if (card.length !== 16 || !/^\d{16}$/.test(card)) {
          setSubmitError('شماره کارت مبدا باید دقیقاً ۱۶ رقم باشد.');
          return false;
        }
        if (!(destinationSelect ?? '').trim()) {
          setSubmitError('شماره کارت مقصد را انتخاب کنید.');
          return false;
        }
        break;
      }
      case 'account_transfer':
        if (!(sourceAccount ?? '').trim()) {
          setSubmitError('شماره حساب مبدا را وارد کنید.');
          return false;
        }
        if (!(destinationSelect ?? '').trim()) {
          setSubmitError('شماره حساب مقصد را انتخاب کنید.');
          return false;
        }
        break;
      case 'remittance': {
        const sh = (sourceSheba ?? '').trim().toUpperCase();
        if (!(sh.startsWith('IR') && sh.length >= 26)) {
          setSubmitError('شماره شبا مبدا معتبر نیست.');
          return false;
        }
        if (!(destinationSelect ?? '').trim()) {
          setSubmitError('شماره شبا مقصد را انتخاب کنید.');
          return false;
        }
        break;
      }
      case 'cheque':
        if (
          ![chequeOwner, chequeBank, chequeSayadi, chequeSeries, chequeSerial].every(
            (s) => (s ?? '').trim().length > 0,
          )
        ) {
          setSubmitError('تمام فیلدهای ضروری چک را تکمیل کنید.');
          return false;
        }
        break;
      case 'cash':
        if (!(receiptNumber ?? '').trim()) {
          setSubmitError('شماره رسید را وارد کنید.');
          return false;
        }
        break;
      default:
        break;
    }

    if (!receiptDocuments.some((doc) => doc.files.length > 0)) {
      setSubmitError('تصویر یا PDF رسید بارگذاری شود.');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(getDraftKey(activeDraftId));
      const mode = editReceipt?.allocationMode ?? allocationMode;
      const baseDirect = mode === 'direct' && context;
      const paymentFields: ReceiptPaymentFieldsPersisted = {
        sourceCardParts: [...sourceCardParts],
        sourceCardHolder,
        sourceAccount,
        sourceAccountHolder,
        sourceSheba,
        sourceShebaHolder,
        chequeOwner,
        chequeBank,
        chequeSayadi,
        chequeSeries,
        chequeSerial,
      };
      onSubmitted?.({
        id: editReceipt?.id ?? createLocalId('receipt'),
        contractId,
        allocationMode: mode,
        allocationDate: baseDirect ? context!.row.dueDate : depositDate,
        dueRowId: baseDirect ? context!.row.id : editReceipt?.dueRowId,
        dueTitle: baseDirect ? context!.row.title : editReceipt?.dueTitle,
        dueDate: baseDirect ? context!.row.dueDate : editReceipt?.dueDate,
        dueAmount: baseDirect ? Number(context!.row.amount) || 0 : editReceipt?.dueAmount ?? 0,
        transferKind,
        depositorName,
        paidAmountRial: Number(paidAmount.replace(/\D/g, '')) || 0,
        depositDate,
        depositTime,
        destinationValue: destinationSelect,
        destinationHolder,
        destinationHolders,
        trackingNumber,
        referenceNumber,
        receiptNumber,
        notes: '',
        documents: receiptDocuments,
        createdAt: editReceipt?.createdAt ?? new Date().toISOString(),
        paymentFields,
      });
      onClose();
    }, 520);
  };

  const setCardDigitGroup = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setSourceCardParts((parts) => {
      const next = [...parts];
      next[index] = digits;
      return next;
    });
    if (digits.length === 4 && index < 3) sourceCardInputRefs.current[index + 1]?.focus();
  };

  const handleSourceCardKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && sourceCardParts[index] === '' && index > 0) {
      sourceCardInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaidAmountChange = (value: string) => {
    setPaidAmount(formatAmountInput(value));
  };

  const handleTransferKindChange = (kind: ReceiptTransferKind) => {
    setTransferKind(kind);
    setDestinationSelect('');
    setDestinationHolder('');
    setDestinationHolders([]);
  };

  const handleDestinationSelect = (value: string) => {
    setDestinationSelect(value);
    const selected = destinationOptions.find((option) => option.value === value);
    setDestinationHolder(selected?.holder ?? '');
    setDestinationHolders(selected?.holders ?? []);
  };

  const handleDocumentFilesPicked = async (files: File[]) => {
    if (!files.length) return;
    setDocUploading(true);
    setSubmitError('');
    try {
      const nextFiles = await Promise.all(
        files.map(async (file) => ({
          id: createLocalId('receipt-file'),
          name: file.name,
          size: file.size,
          mimeType: file.type || null,
          dataUrl: await fileToDataUrl(file),
        })),
      );
      setDocDraftFiles((current) => [...current, ...nextFiles]);
    } catch {
      setSubmitError('بارگذاری فایل انجام نشد.');
    } finally {
      setDocUploading(false);
    }
  };

  const openDocumentDialog = () => {
    resetDocumentDialog();
    setDocumentDialogOpen(true);
  };

  const confirmDocumentDialog = () => {
    if (docUploading) return;
    const category = (docSelectedCategory || docCategoryInput).trim();
    const title = (docSelectedTitle || docTitleInput).trim();
    if (!title || docDraftFiles.length === 0) {
      setSubmitError('عنوان سند و فایل رسید را کامل کنید.');
      return;
    }
    const next: ReceiptDocument = {
      id: createLocalId('receipt-doc'),
      category,
      title,
      date: docDate.trim(),
      description: '',
      files: docDraftFiles,
    };
    setReceiptDocuments((current) => [next, ...current]);
    setDocumentDialogOpen(false);
    resetDocumentDialog();
  };

  const openBankAccountsManagement = () => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(
      getDraftKey(activeDraftId),
      JSON.stringify({
        transferKind,
        sourceCardParts,
        sourceCardHolder,
        sourceAccount,
        sourceAccountHolder,
        sourceSheba,
        sourceShebaHolder,
        chequeOwner,
        chequeBank,
        chequeSayadi,
        chequeSeries,
        chequeSerial,
        depositorName,
        paidAmount,
        depositDate,
        depositTime,
        destinationSelect,
        destinationHolder,
        destinationHolders,
        trackingNumber,
        referenceNumber,
        receiptNumber,
        receiptDocuments,
      }),
    );
    const returnUrl = new URL(`${window.location.pathname}${window.location.search}`, window.location.origin);
    if (context) returnUrl.searchParams.set('receiptRowId', context.row.id);
    else if (editReceipt?.dueRowId) returnUrl.searchParams.set('receiptRowId', editReceipt.dueRowId);
    const q = new URLSearchParams({ returnTo: `${returnUrl.pathname}${returnUrl.search}` });
    router.push(`/business-settings/profile/bank-accounts?${q.toString()}`);
  };

  if (!open || (effectiveAllocationMode === 'direct' && !context)) return null;

  const showTrackingRef = transferKind !== 'cash';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 pt-14 backdrop-blur-[2px] sm:items-center sm:p-6"
      dir="rtl"
      lang="fa"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[min(920px,calc(100vh-52px))] w-full max-w-xl flex-col overflow-hidden rounded-t-[26px] border border-white/75 bg-[linear-gradient(180deg,#f8fafc,white)] shadow-[0_-24px_60px_-32px_rgba(15,23,42,0.45)] sm:rounded-[26px]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-200/85 bg-white/90 px-4 py-3.5 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)]"
            aria-label="بازگشت"
          >
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <h2 id={titleId} className="text-[15px] font-black leading-tight text-slate-900">
              {editReceipt ? 'ویرایش فیش واریزی' : 'ثبت فیش واریزی'}
            </h2>
            <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold text-slate-500">{dueHint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="بستن"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto bg-[repeating-linear-gradient(315deg,color-mix(in_srgb,var(--dark-teal)_04%,transparent)_0,color-mix(in_srgb,var(--dark-teal)_04%,transparent)_1px,transparent_0,transparent_8px)] px-4 py-4 sm:px-5">
          {submitError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-right text-[12px] font-bold text-rose-900">
              {submitError}
            </div>
          ) : null}

          <section className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:px-5">
            <div className="flex items-start gap-2 border-b border-slate-100 pb-3">
              <Building2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[color-mix(in_srgb,var(--dark-teal)_82%,black)]" />
              <div className="min-w-0 text-right">
                <div className="text-[14px] font-black text-slate-900">اطلاعات مبدا واریز</div>
                <p className="mt-1 flex items-start gap-1 text-[11px] font-semibold leading-snug text-slate-500">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  جهت ثبت فیش واریزی، ابتدا نوع واریز وجه / نوع انتقال وجه را انتخاب کنید.
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {TRANSFER_KINDS.map((kind) => {
                const sel = transferKind === kind.id;
                return (
                  <button
                    key={kind.id}
                    type="button"
                    onClick={() => handleTransferKindChange(kind.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-black tracking-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] ${
                      sel
                        ? 'bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dark-teal)_90%,black),color-mix(in_srgb,var(--dark-teal)_74%,#0f766e))] text-white shadow-sm ring-1 ring-black/15'
                        : 'border border-slate-200/90 bg-white text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,1)] hover:border-[color-mix(in_srgb,var(--dark-teal)_30%,transparent)]'
                    }`}
                  >
                    {sel ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
                    {kind.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 space-y-3">
              {transferKind === 'card_to_card' ? (
                <>
                  <div className="text-right">
                    <div className="flex items-center justify-start gap-1.5">
                      <span className="text-[11px] font-bold text-slate-600">
                        شماره کارت مبدا <Req />
                      </span>
                      <FieldHint
                        label="شماره کارت مبدا"
                        text="شماره ۱۶ رقمی کارت بانکی که پرداخت از طریق آن انجام شده است؛ هر خانه ۴ رقم."
                      />
                    </div>
                    <span className="mt-2 flex flex-row flex-wrap gap-2 justify-start" dir="ltr">
                      {[0, 1, 2, 3].map((idx) => (
        <Input
          ref={(node) => {
            sourceCardInputRefs.current[idx] = node;
          }}
          key={idx}
          value={sourceCardParts[idx]}
          inputMode="numeric"
          dir="ltr"
          maxLength={4}
          onChange={(e) => setCardDigitGroup(idx, e.target.value)}
          onKeyDown={(e) => handleSourceCardKeyDown(idx, e)}
          className="h-11 min-w-[3.75rem] flex-1 rounded-2xl border-slate-200 text-center text-[13px] font-semibold tabular-nums"
        />
                      ))}
                    </span>
                  </div>
                  <FormField
                    label="دارنده شماره کارت مبدا"
                    tooltip="نام صاحب کارت مبدا مطابق اطلاعات بانک؛ در صورت تفاوت با واریزکننده، هر دو را شفاف کنید."
                  >
                    <input type="text" value={sourceCardHolder} onChange={(e) => setSourceCardHolder(e.target.value)} className={inputCls} />
                  </FormField>
                </>
              ) : null}

              {transferKind === 'account_transfer' ? (
                <>
                  <FormField
                    label="شماره حساب مبدا"
                    required
                    tooltip="شماره حساب بانکی که وجه از آن خارج شده است."
                  >
                    <input
                      type="text"
                      value={sourceAccount}
                      onChange={(e) => setSourceAccount(e.target.value)}
                      dir="ltr"
                      className={`${inputCls} text-right`}
                    />
                  </FormField>
                  <FormField label="دارنده شماره حساب مبدا" tooltip="نام صاحب حساب مبدا مطابق دفترچه یا گردش حساب.">
                    <input type="text" value={sourceAccountHolder} onChange={(e) => setSourceAccountHolder(e.target.value)} className={inputCls} />
                  </FormField>
                </>
              ) : null}

              {transferKind === 'remittance' ? (
                <>
                  <FormField
                    label="شماره شبا مبدا"
                    required
                    tooltip="شماره شبای ۲۴ رقمی با پیشوند IR مطابق حساب مبدا."
                  >
                    <input
                      type="text"
                      value={sourceSheba}
                      onChange={(e) => setSourceSheba(e.target.value.trim())}
                      placeholder="IR..."
                      dir="ltr"
                      className={`${inputCls} font-mono text-right`}
                    />
                  </FormField>
                  <FormField label="دارنده شبا مبدا" tooltip="نام صاحب شبا مطابق بانک صادرکننده حساب مبدا.">
                    <input type="text" value={sourceShebaHolder} onChange={(e) => setSourceShebaHolder(e.target.value)} className={inputCls} />
                  </FormField>
                </>
              ) : null}

              {transferKind === 'cheque' ? (
                <>
                  <FormField label="نام صاحب چک" required tooltip="نام ذکرشده روی چک به‌عنوان ذینفع یا صاحب چک.">
                    <input type="text" value={chequeOwner} onChange={(e) => setChequeOwner(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField label="نام بانک" required tooltip="بانکی که چک از آن صادر شده است.">
                    <input type="text" value={chequeBank} onChange={(e) => setChequeBank(e.target.value)} className={inputCls} />
                  </FormField>
                  <FormField
                    label="شماره صیادی"
                    required
                    tooltip="شماره رهگیری ۱۶ رقمی چک در سامانه صیاد که روی چک درج شده است."
                  >
                    <input type="text" value={chequeSayadi} onChange={(e) => setChequeSayadi(e.target.value)} dir="ltr" className={`${inputCls} tabular-nums`} />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="سری چک" required tooltip="شماره سری دسته چک (طبق روی چک یا دفترچه).">
                      <input type="text" value={chequeSeries} onChange={(e) => setChequeSeries(e.target.value)} className={inputCls} />
                    </FormField>
                    <FormField label="سریال چک" required tooltip="شماره سریال همان برگ چک.">
                      <input type="text" value={chequeSerial} onChange={(e) => setChequeSerial(e.target.value)} dir="ltr" className={`${inputCls} tabular-nums`} />
                    </FormField>
                  </div>
                </>
              ) : null}

              <FormField
                label="نام و نام خانوادگی واریزکننده"
                required
                tooltip="فردی که عملاً وجه را واریز کرده است؛ ممکن است با صاحب کارت یا حساب مبدا متفاوت باشد."
              >
                <input type="text" value={depositorName} onChange={(e) => setDepositorName(e.target.value)} className={inputCls} />
              </FormField>
            </div>
            <div className="hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="text-right text-[12px] font-black text-slate-700">{'\u0627\u0633\u0646\u0627\u062f \u0648 \u0645\u062f\u0627\u0631\u06a9'}</div>
                <button type="button" onClick={openDocumentDialog} className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-4 py-2 text-[12px] font-black text-white shadow-sm transition hover:brightness-105">
                  <Plus className="h-4 w-4" aria-hidden />
                  {'\u0627\u0641\u0632\u0648\u062f\u0646 \u0633\u0646\u062f'}
                </button>
              </div>
              {receiptDocuments.length ? (
                <div className="space-y-2">
                  {receiptDocuments.map((doc) => (
                    <div key={doc.id} className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-right shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[12px] font-black text-slate-900">{doc.title}</div>
                          <div className="mt-1 text-[11px] font-semibold text-slate-500">
                            {doc.category || '\u0628\u062f\u0648\u0646 \u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc'} · {doc.files.length} {'\u0641\u0627\u06cc\u0644'}
                          </div>
                        </div>
                        <button type="button" onClick={() => setReceiptDocuments((current) => current.filter((item) => item.id !== doc.id))} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700" aria-label="حذف سند">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/65 px-4 py-7 text-center">
                  <p className="text-[12px] font-black text-slate-600">{'\u0647\u0646\u0648\u0632 \u0633\u0646\u062f\u06cc \u0627\u0636\u0627\u0641\u0647 \u0646\u0634\u062f\u0647 \u0627\u0633\u062a.'}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-400">{'\u0628\u0631\u0627\u06cc \u0634\u0631\u0648\u0639 \u0631\u0648\u06cc \u00ab\u0627\u0641\u0632\u0648\u062f\u0646 \u0633\u0646\u062f\u00bb \u06a9\u0644\u06cc\u06a9 \u06a9\u0646\u06cc\u062f.'}</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:px-5">
            <div className="flex items-start gap-2 border-b border-slate-100 pb-3">
              <Banknote className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[color-mix(in_srgb,var(--dark-teal)_82%,black)]" />
              <div className="min-w-0 text-right">
                <div className="text-[14px] font-black text-slate-900">اطلاعات انتقال</div>
                <p className="mt-1 flex items-start gap-1 text-[11px] font-semibold leading-snug text-slate-500">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  اطلاعات انتقال وجه را وارد کنید.
                </p>
              </div>
              <button
                type="button"
                onClick={openBankAccountsManagement}
                className="mr-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-600 shadow-sm transition hover:border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] hover:text-[color-mix(in_srgb,var(--dark-teal)_85%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)]"
                title="مدیریت، افزودن یا ویرایش حساب‌های قابل نمایش در قرارداد"
              >
                <Settings className="h-3.5 w-3.5" aria-hidden />
                {'\u0645\u062f\u06cc\u0631\u06cc\u062a \u062d\u0633\u0627\u0628\u200c\u0647\u0627'}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <FormField
                label="مبلغ پرداخت‌شده"
                required
                tooltip="مبلغ واقعی واریزشده به ریال مطابق رسید یا گردش حساب."
              >
                <input
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  value={paidAmount}
                  onChange={(e) => handlePaidAmountChange(e.target.value)}
                  placeholder="ریال"
                  className={`${inputCls} font-semibold tabular-nums`}
                />
              </FormField>
              <div className={`grid gap-3 ${transferKind === 'cash' ? 'grid-cols-1' : 'sm:grid-cols-[minmax(0,1fr)_8.75rem]'}`}>
                <FormField label="تاریخ واریز وجه" required tooltip="تاریخ انجام تراکنش به‌تقویم شمسی مطابق رسید یا پیام بانکی.">
                  <PersianDatePicker
                    value={depositDate}
                    onChange={setDepositDate}
                    placeholder="انتخاب تاریخ"
                    containerClassName="w-full [&_.app-control]:h-11 [&_.app-control]:min-h-[2.75rem] [&_.app-control]:rounded-2xl"
                  />
                </FormField>
                {transferKind !== 'cash' ? (
                  <FormField label="ساعت واریز" required tooltip="ساعت ثبت تراکنش مطابق رسید، پیامک بانک یا پرینت آنلاین.">
                    <input type="time" value={depositTime} onChange={(e) => setDepositTime(e.target.value)} className={`${inputCls} text-center`} />
                  </FormField>
                ) : null}
              </div>

              {transferKind === 'cash' ? (
                <FormField
                  label="شماره رسید"
                  required
                  tooltip="شماره رسید صادرشده از شعبه، صندوق یا دستگاه کارتی برای پرداخت نقد."
                >
                  <input type="text" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} dir="ltr" className={`${inputCls} tabular-nums`} />
                </FormField>
              ) : null}

              {transferKind === 'card_to_card' ? (
                <>
                  <SelectField
                    label="شماره کارت مقصد"
                    tooltip="شماره کارت مقصدی که مطابق قرارداد یا اطلاع‌رسانی به واحد، وجه باید به آن واریز شود."
                    value={destinationSelect}
                    onChange={handleDestinationSelect}
                    options={destinationOptions}
                    disabled={destinationAccountsLoading || destinationOptions.length <= 1}
                  />
                  <FormField label="دارنده شماره کارت مقصد" tooltip="نام صاحب کارت مقصد در صورت نیاز به تأیید یا تطبیق با سوابق.">
                    <DestinationHolderTags holders={destinationHolders} fallback={destinationHolder} />
                  </FormField>
                </>
              ) : null}
              {transferKind === 'account_transfer' ? (
                <>
                  <SelectField
                    label="شماره حساب مقصد"
                    tooltip="شماره حساب مقصد تعریف‌شده برای دریافت وجه این قرارداد."
                    value={destinationSelect}
                    onChange={handleDestinationSelect}
                    options={destinationOptions}
                    disabled={destinationAccountsLoading || destinationOptions.length <= 1}
                  />
                  <FormField label="دارنده شماره حساب مقصد" tooltip="نام صاحب حساب مقصد در صورت نیاز به تأیید.">
                    <DestinationHolderTags holders={destinationHolders} fallback={destinationHolder} />
                  </FormField>
                </>
              ) : null}
              {transferKind === 'remittance' ? (
                <>
                  <SelectField
                    label="شماره شبا مقصد"
                    tooltip="شماره شبای حساب مقصد که وجه حواله به آن واریز شده است."
                    value={destinationSelect}
                    onChange={handleDestinationSelect}
                    options={destinationOptions}
                    disabled={destinationAccountsLoading || destinationOptions.length <= 1}
                  />
                  <FormField label="دارنده شبا مقصد" tooltip="نام صاحب شبای مقصد در صورت نیاز به تأیید.">
                    <DestinationHolderTags holders={destinationHolders} fallback={destinationHolder} />
                  </FormField>
                </>
              ) : null}

              {showTrackingRef ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField label="شماره رهگیری" tooltip="شماره پیگیری تراکنش از بانک، درگاه یا پیامک در صورت وجود.">
                    <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} dir="ltr" className={`${inputCls} tabular-nums`} />
                  </FormField>
                  <FormField label="شماره مرجع" tooltip="شماره مرجع یا پیگیری ثبت‌شده در سیستم بانکی برای این تراکنش.">
                    <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} dir="ltr" className={`${inputCls} tabular-nums`} />
                  </FormField>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:px-5">
            <div className="flex items-start gap-2 border-b border-slate-100 pb-3">
              <FileText className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[color-mix(in_srgb,var(--dark-teal)_82%,black)]" />
              <div className="min-w-0 text-right">
                <div className="text-[14px] font-black text-slate-900">{'\u062a\u0648\u0636\u06cc\u062d\u0627\u062a \u0648 \u0645\u062f\u0627\u0631\u06a9'}</div>
                <p className="mt-1 text-[11px] font-semibold leading-snug text-slate-500">
                  {'\u0645\u062f\u0627\u0631\u06a9 \u0631\u0627 \u0628\u0627 \u0647\u0645\u0627\u0646 \u0641\u0644\u0648\u06cc \u062b\u0628\u062a \u0627\u0633\u0646\u0627\u062f \u0642\u0631\u0627\u0631\u062f\u0627\u062f \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f.'}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="space-y-3 rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/60 px-4 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-right text-[12px] font-black text-slate-700">{'\u0627\u0633\u0646\u0627\u062f \u0648 \u0645\u062f\u0627\u0631\u06a9'}</div>
                  <button type="button" onClick={openDocumentDialog} className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-4 py-2 text-[12px] font-black text-white shadow-sm transition hover:brightness-105">
                    <Plus className="h-4 w-4" aria-hidden />
                    {'\u0627\u0641\u0632\u0648\u062f\u0646 \u0633\u0646\u062f'}
                  </button>
                </div>
                {receiptDocuments.length ? (
                  <div className="space-y-2">
                    {receiptDocuments.map((doc) => (
                      <div key={doc.id} className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-right shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[12px] font-black text-slate-900">{doc.title}</div>
                            <div className="mt-1 text-[11px] font-semibold text-slate-500">
                              {doc.category || '\u0628\u062f\u0648\u0646 \u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc'} {'\u00b7'} {doc.files.length} {'\u0641\u0627\u06cc\u0644'}
                            </div>
                          </div>
                          <button type="button" onClick={() => setReceiptDocuments((current) => current.filter((item) => item.id !== doc.id))} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700" aria-label="حذف سند">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/65 px-4 py-7 text-center">
                    <p className="text-[12px] font-black text-slate-600">{'\u0647\u0646\u0648\u0632 \u0633\u0646\u062f\u06cc \u0627\u0636\u0627\u0641\u0647 \u0646\u0634\u062f\u0647 \u0627\u0633\u062a.'}</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">{'\u0628\u0631\u0627\u06cc \u0634\u0631\u0648\u0639 \u0631\u0648\u06cc \u00ab\u0627\u0641\u0632\u0648\u062f\u0646 \u0633\u0646\u062f\u00bb \u06a9\u0644\u06cc\u06a9 \u06a9\u0646\u06cc\u062f.'}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {documentDialogOpen ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4" onMouseDown={() => setDocumentDialogOpen(false)}>
            <div className="flex max-h-[min(760px,calc(100vh-40px))] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl" dir="rtl" onMouseDown={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3">
                <div>
                  <div className="text-[15px] font-black text-slate-900">{'\u0627\u0641\u0632\u0648\u062f\u0646 \u0633\u0646\u062f'}</div>
                  <div className="mt-1 text-[12px] font-semibold text-slate-500">{'\u0627\u0637\u0644\u0627\u0639\u0627\u062a \u0633\u0646\u062f \u0648 \u0641\u0627\u06cc\u0644(\u0647\u0627) \u0631\u0627 \u062b\u0628\u062a \u06a9\u0646\u06cc\u062f.'}</div>
                </div>
                <button type="button" onClick={() => setDocumentDialogOpen(false)} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700" aria-label="بستن">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                <FormField label={'\u062f\u0633\u062a\u0647 \u0628\u0646\u062f\u06cc'}>
                  <div className="flex gap-2">
                    <input value={docCategoryInput} onChange={(e) => setDocCategoryInput(e.target.value)} placeholder="مثال: رسید بانکی" className={inputCls} />
                    <button type="button" onClick={() => setDocSelectedCategory(docCategoryInput.trim())} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {RECEIPT_DOCUMENT_CATEGORIES.map((cat) => (
                      <button key={cat} type="button" onClick={() => setDocSelectedCategory(docSelectedCategory === cat ? '' : cat)} className={`rounded-full border px-3 py-1 text-[11px] font-black ${docSelectedCategory === cat ? 'border-[color-mix(in_srgb,var(--dark-teal)_65%,#cbd5e1)] bg-[color-mix(in_srgb,var(--dark-teal)_10%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]' : 'border-slate-200 bg-white text-slate-600'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label={'\u0639\u0646\u0648\u0627\u0646'} required>
                  <div className="flex gap-2">
                    <input value={docTitleInput} onChange={(e) => setDocTitleInput(e.target.value)} placeholder="مثال: فیش واریزی" className={inputCls} />
                    <button type="button" onClick={() => setDocSelectedTitle(docTitleInput.trim())} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {RECEIPT_DOCUMENT_TITLES.map((title) => (
                      <button key={title} type="button" onClick={() => setDocSelectedTitle(docSelectedTitle === title ? '' : title)} className={`rounded-full border px-3 py-1 text-[11px] font-black ${docSelectedTitle === title ? 'border-[color-mix(in_srgb,var(--dark-teal)_65%,#cbd5e1)] bg-[color-mix(in_srgb,var(--dark-teal)_10%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]' : 'border-slate-200 bg-white text-slate-600'}`}>
                        {title}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label={'\u062a\u0627\u0631\u06cc\u062e'}>
                  <PersianDatePicker value={docDate} onChange={setDocDate} placeholder="انتخاب تاریخ" containerClassName="w-full [&_.app-control]:h-11 [&_.app-control]:min-h-[2.75rem] [&_.app-control]:rounded-2xl" />
                </FormField>
                <FormField label={'\u0641\u0627\u06cc\u0644\u200c\u0647\u0627'} required>
                  <input ref={docCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => void handleDocumentFilesPicked(Array.from(e.target.files ?? []))} />
                  <input ref={docImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => void handleDocumentFilesPicked(Array.from(e.target.files ?? []))} />
                  <input ref={docAudioInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={(e) => void handleDocumentFilesPicked(Array.from(e.target.files ?? []))} />
                  <input ref={docFileInputRef} type="file" accept="image/*,.pdf,audio/*" multiple className="hidden" onChange={(e) => void handleDocumentFilesPicked(Array.from(e.target.files ?? []))} />
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 p-4 text-center">
                    <div className="text-[13px] font-bold text-slate-600">{'\u0627\u0646\u062a\u062e\u0627\u0628 \u0641\u0627\u06cc\u0644'}</div>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      {[
                        { icon: Camera, ref: docCameraInputRef, label: 'دوربین' },
                        { icon: FileImage, ref: docImageInputRef, label: 'تصویر' },
                        { icon: FileAudio, ref: docAudioInputRef, label: 'صدا' },
                        { icon: FileText, ref: docFileInputRef, label: 'فایل' },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button key={item.label} type="button" disabled={docUploading} onClick={() => item.ref.current?.click()} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50" aria-label={item.label}>
                            <Icon className="h-5 w-5" />
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-slate-500">
                      {docUploading ? 'در حال بارگذاری...' : docDraftFiles.length ? `${docDraftFiles.length} فایل انتخاب شده` : 'یکی از گزینه‌ها را انتخاب کنید.'}
                    </div>
                  </div>
                </FormField>
              </div>
              <div className="flex justify-start gap-2 border-t border-slate-100 px-4 py-3">
                <button type="button" onClick={confirmDocumentDialog} disabled={docUploading} className="rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_82%,black)] px-5 py-2 text-[12px] font-black text-white disabled:opacity-60">{'\u0630\u062e\u06cc\u0631\u0647'}</button>
                <button type="button" onClick={() => setDocumentDialogOpen(false)} className="rounded-full border border-slate-200 bg-white px-5 py-2 text-[12px] font-black text-slate-700">{'\u0627\u0646\u0635\u0631\u0627\u0641'}</button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="shrink-0 border-t border-slate-200/90 bg-white/95 p-4 sm:px-5">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dark-teal)_92%,black),color-mix(in_srgb,var(--dark-teal)_78%,#0f766e))] text-[14px] font-black text-white shadow-[0_10px_28px_-16px_rgba(15,23,42,0.45)] ring-1 ring-black/10 transition hover:brightness-[1.05] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'در حال ثبت…' : 'ثبت'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  tooltip,
  children,
}: {
  label: string;
  required?: boolean;
  tooltip?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-right">
      <div className="flex items-center justify-start gap-1.5">
        <span className="text-[11px] font-bold text-slate-600">
          {label} {required ? <Req /> : null}
        </span>
        {tooltip ? <FieldHint label={label} text={tooltip} /> : null}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function DestinationHolderTags({ holders, fallback }: { holders: string[]; fallback: string }) {
  const displayHolders = holders.length > 0 ? holders : fallback.split(/[\u060c,]/).map((item) => item.trim()).filter(Boolean);

  if (displayHolders.length === 0) {
    return (
      <div className={`${inputCls} flex items-center text-slate-400`}>
        {'\u0628\u0627 \u0627\u0646\u062a\u062e\u0627\u0628 \u0645\u0642\u0635\u062f \u067e\u0631 \u0645\u06cc\u200c\u0634\u0648\u062f'}
      </div>
    );
  }

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-2xl border border-slate-200/95 bg-[image:var(--control-bg-gradient)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
      {displayHolders.map((holder) => (
        <span
          key={holder}
          className="inline-flex max-w-full items-center rounded-full border border-[color-mix(in_srgb,var(--dark-teal)_24%,#cbd5e1)] bg-white px-3 py-1 text-[11px] font-black text-slate-700 shadow-sm"
        >
          {holder}
        </span>
      ))}
    </div>
  );
}

function SelectField({
  label,
  tooltip,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  tooltip?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="block text-right">
      <div className="flex items-center justify-start gap-1.5">
        <span className="text-[11px] font-bold text-slate-600">
          {label} <Req />
        </span>
        {tooltip ? <FieldHint label={label} text={tooltip} /> : null}
      </div>
      <div className="relative mt-1.5">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} cursor-pointer appearance-none pl-11 pr-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
        >
          {options.map((o) => (
            <option key={o.value || 'ph'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3.5" aria-hidden />
      </div>
    </label>
  );
}
