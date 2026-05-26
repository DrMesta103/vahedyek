import { fixMojibakeDeep } from './fixMojibake';

export type ContractRuleId =
  | 'installments'
  | 'prepayment'
  | 'adjustment'
  | 'additional-costs'
  | 'discount'
  | 'penalty'
  | 'builder-penalty'
  | 'builder-cancellation'
  | 'buyer-cancellation'
  | 'forgiveness'
  | 'interest';

export type LoanAmountMode = 'fixed' | 'percent';
export type LoanAmountSelectionMode = 'unselected' | 'fixed' | 'contract-time';
export type LoanTiming = 'undated' | 'contract-date' | 'before-contract' | 'dated';
export type RepaymentTiming = 'next-month' | 'after-two-months' | 'custom';

export type RuleField =
  | { key: string; label: string; type: 'text' | 'number'; placeholder?: string }
  | { key: string; label: string; type: 'select'; options: string[] }
  | { key: string; label: string; type: 'switch' };

export type RuleTabConfig = {
  id: string;
  title: string;
  description: string;
  fields: RuleField[];
};

export type RuleConfig = {
  id: ContractRuleId;
  title: string;
  description: string;
  activationTitle: string;
  activationDescription: string;
  detailsLabel?: string;
  chips?: string[];
  tabs: RuleTabConfig[];
};

export type ContractRuleState = {
  active: boolean;
  activeTab: string;
  activeChip?: string;
  values: Record<string, string | boolean>;
};

export type LoanSettingsState = {
  enabled: boolean;
  loanAmountMode: LoanAmountMode;
  loanAmountSelectionMode: LoanAmountSelectionMode;
  loanBankInterestEnabled: boolean;
  loanBankInterestRate: string;
  loanBankFeeBuyer: boolean;
  loanBankFeeSeller: boolean;
  loanBankFeeBankPolicyEnabled: boolean;
  loanBankFeeMode: 'fixed' | 'percent' | 'combined';
  loanBankFeeValue: string;
  loanParticipationBuyer: boolean;
  loanParticipationSeller: boolean;
  loanParticipationBankPolicyEnabled: boolean;
  loanParticipationRate: string;
  loanExpertBuyer: boolean;
  loanExpertSeller: boolean;
  loanExpertBankPolicyEnabled: boolean;
  loanExpertRate: string;
  loanPriorityBondBuyer: boolean;
  loanPriorityBondSeller: boolean;
  loanPriorityBondBankPolicyEnabled: boolean;
  loanPriorityBondRate: string;
  loanTiming: LoanTiming;
  loanReceivedDate: string;
  repaymentTiming: RepaymentTiming;
  fixedAmount: string;
  percentAmount: string;
  loanGracePeriod: string;
  selectedBank: string;
};

export const LOAN_TIMING_OPTIONS = fixMojibakeDeep([
  {
    id: 'undated',
    label: 'وام دریافت شده و تاریخ مشخصی ندارد',
    description: 'برای حالتی که دریافت وام قطعی است اما تاریخ دقیق آن در قرارداد ثبت نمی‌شود.',
    helperText: 'در این حالت تاریخ مشخصی برای ثبت دریافت وام لازم نیست.',
    requiresDate: false,
  },
  {
    id: 'contract-date',
    label: 'تاریخ وام همزمان با انعقاد قرارداد است',
    description: 'اگر دریافت وام همزمان با روز عقد قرارداد باشد این گزینه را انتخاب کنید.',
    helperText: 'زمان دریافت وام با تاریخ قرارداد یکسان در نظر گرفته می‌شود.',
    requiresDate: false,
  },
  {
    id: 'before-contract',
    label: 'تاریخ دریافت وام قبل از انعقاد قرارداد است',
    description: 'برای شرایطی که وام پیش از ثبت قرارداد دریافت شده و باید تاریخ آن ثبت شود.',
    helperText: 'تاریخی را وارد کنید که وام پیش از قرارداد دریافت شده است.',
    requiresDate: true,
  },
  {
    id: 'dated',
    label: 'وام دریافت شده اما تاریخ مشخصی دارد',
    description: 'اگر لازم است تاریخ دریافت وام به صورت دقیق در تنظیمات ثبت شود از این گزینه استفاده کنید.',
    helperText: 'تاریخ دقیق دریافت وام را در این بخش وارد کنید.',
    requiresDate: true,
  },
] as const);

export const CONTRACT_RULE_ITEMS: Array<{ id: ContractRuleId; title: string; description: string }> = fixMojibakeDeep([
  {
    id: 'installments',
    title: 'اقساط',
    description: 'تنظیم تعداد اقساط، فاصله زمانی و نحوه محاسبه اقساط را تنظیم کنید.',
  },
  {
    id: 'prepayment',
    title: 'پیش پرداخت',
    description: 'نحوه تعیین مبلغ پیش‌پرداخت، درصد پیش‌پرداخت و زمان پرداخت را از این بخش تنظیم کنید.',
  },
  {
    id: 'adjustment',
    title: 'تنظیمات تعدیل',
    description: 'نحوه تعدیل مبلغ قرارداد بر اساس شاخص‌های اقتصادی یا نرخ‌های ثابت را از این بخش مدیریت کنید.',
  },
  {
    id: 'additional-costs',
    title: 'هزینه های جانبی',
    description: 'هزینه‌های ثابت یا درصدی مانند کارمزد اداری هزینه تشکیل پرونده و هزینه خدمات را در این بخش تعریف کنید.',
  },
  {
    id: 'discount',
    title: 'تنظیمات تخفیف',
    description: 'وضعیت تخفیف، شرایط اعمال و نحوه تسویه آن را مدیریت کنید.',
  },
  {
    id: 'penalty',
    title: 'تنظیمات جریمه',
    description: 'میزان جریمه تاخیر، مبنای محاسبه و دوره محاسبه جریمه را در این بخش مشخص کنید.',
  },
  {
    id: 'builder-penalty',
    title: 'جریمه سازنده',
    description: 'فعال‌سازی و تنظیم جریمه‌های مرتبط با تعهدات سازنده مانند تاخیر در تحویل، تغییر مشخصات و اختلاف متراژ.',
  },
  {
    id: 'builder-cancellation',
    title: 'تنظیمات فسخ سازنده',
    description: 'فعال‌سازی و تنظیم اختیارات فسخ سازنده در شرایطی مانند تاخیر در پرداخت، عدم انجام تعهدات مالی و نقص مدارک خریدار.',
  },
  {
    id: 'buyer-cancellation',
    title: 'تنظیمات فسخ خریدار',
    description: 'فعال‌سازی و تنظیم اختیارات فسخ خریدار در شرایطی مانند تاخیر در تحویل، تغییر مشخصات و اختلاف متراژ.',
  },
  {
    id: 'forgiveness',
    title: 'تنظیمات بخشودگی',
    description: 'در این بخش می‌توانید تنظیمات مربوط به بخشودگی را انجام دهید.',
  },
  {
    id: 'interest',
    title: 'سود دریافتی',
    description: 'نرخ سود، دوره محاسبه و بازه‌های اعمال سود برای قراردادهای تقسیطی را مشخص کنید.',
  },
]);

export const BANKS = fixMojibakeDeep([
  'مسکن',
  'تجارت',
  'ملت',
  'صادرات',
  'شهر',
  'رفاه کارگران',
  'سپه',
  'سامان',
  'دی',
  'ملی',
  'اقتصاد نوین',
  'پاسارگاد',
  'پارسیان',
  'کشاورزی',
  'صنعت و معدن',
  'کارآفرین',
  'قوامین',
  'مهر اقتصاد',
] as const);

export const RULE_CONFIGS: Record<ContractRuleId, RuleConfig> = fixMojibakeDeep({
  installments: {
    id: 'installments',
    title: 'تنظیمات اقساط',
    description: 'تعریف سیاست پرداخت پروژه برای مدل‌های منظم، نامنظم و مبتنی بر پیشرفت فیزیکی.',
    activationTitle: 'سیاست پرداخت اقساط پروژه را تعریف کنید.',
    activationDescription:
      'این بخش محل تعریف سیاست پروژه است؛ کارشناسان در زمان عقد قرارداد از این چارچوب استفاده می‌کنند و در صورت داشتن دسترسی می‌توانند آن را در سطح قرارداد تغییر دهند. در مدل مبتنی بر پیشرفت فیزیکی، این سیاست می‌تواند از برنامه پیشرفت فیزیکی پروژه نیز تغذیه شود.',
    detailsLabel: 'جزئیات تنظیمات اقساط',
    tabs: [
      {
        id: 'regular',
        title: 'اقساط منظم',
        description: 'در این روش مبلغ پیشنهادی هر قسط ثابت است و در بازه‌های زمانی منظم نمایش داده می‌شود.',
        fields: [
          { key: 'regularInterval', label: 'بازه زمانی اقساط', type: 'select', options: ['در بازه قابل تنظیم در زمان عقد قرارداد', 'دو هفته ای', 'ماهانه', 'دوماهه', 'سه ماهه', 'شش ماهه', 'سالانه'] },
          { key: 'regularLastDueDate', label: 'تاریخ آخرین قسط', type: 'text', placeholder: '۰۲ / ۱۱ / ۱۴۰۴' },
          { key: 'regularBalloonEnabled', label: 'پرداخت بالونی', type: 'switch' },
          { key: 'regularBalloonWindow', label: 'بازه زمانی پیشنهادی پرداخت بالونی', type: 'select', options: ['ماه آخر', '۳ ماه آخر', '۵ ماه آخر', '۷ ماه آخر'] },
          { key: 'regularBalloonPercent', label: 'درصد پیشنهادی سهم پرداخت بالونی', type: 'number', placeholder: '۲۰' },
        ],
      },
      {
        id: 'irregular',
        title: 'اقساط نامنظم',
        description: 'تاریخ هر قسط تا آن زمان به پایان می‌رسد. تعداد و مبلغ اقساط بر اساس این تاریخ محاسبه می‌شود.',
        fields: [
          { key: 'irregularLastDueDate', label: 'تاریخ آخرین قسط', type: 'text', placeholder: '۰۱ / ۲۶ / ۱۴۰۴' },
          { key: 'irregularBalloonEnabled', label: 'پرداخت بالونی', type: 'switch' },
          { key: 'irregularBalloonWindow', label: 'بازه زمانی پیشنهادی پرداخت بالونی', type: 'select', options: ['ماه آخر', '۳ ماه آخر', '۵ ماه آخر', '۷ ماه آخر'] },
          { key: 'irregularBalloonPercent', label: 'درصد پیشنهادی سهم پرداخت بالونی', type: 'number', placeholder: '۲۰' },
        ],
      },
      {
        id: 'progress-based',
        title: 'اقساط مبتنی بر پیشرفت فیزیکی',
        description: 'فعال‌سازی اقساطی که محرک آن به درصد پیشرفت یا تحقق مراحل فیزیکی پروژه وابسته است و در صورت نیاز از برنامه پیشرفت فیزیکی پروژه تغذیه می‌شود.',
        fields: [
          { key: 'progressAmountMode', label: 'روش محاسبه مبلغ', type: 'select', options: ['درصدی از مبلغ قرارداد', 'مبلغ ثابت'] },
          { key: 'progressCompletionAuthority', label: 'مرجع اعلام/تأیید پیشرفت', type: 'select', options: ['کارشناس پروژه', 'مدیر پروژه', 'گزارش رسمی پروژه'] },
          { key: 'progressMeasurementBasis', label: 'مبنای سنجش پیشرفت', type: 'select', options: ['پروژه', 'بلوک', 'برنامه', 'مرحله'] },
          { key: 'progressSelectedBlockId', label: 'بلوک منتخب', type: 'text', placeholder: 'block-id' },
          { key: 'progressSelectedScheduleKeys', label: 'برنامه‌های منتخب پیشرفت فیزیکی', type: 'text', placeholder: '[]' },
          { key: 'progressSelectedScheduleKey', label: 'برنامه منتخب پیشرفت فیزیکی', type: 'text', placeholder: 'schedule-key' },
          { key: 'progressPercentageRows', label: 'ردیف‌های مبتنی بر درصد پیشرفت', type: 'text', placeholder: '[]' },
          { key: 'progressMilestoneRows', label: 'ردیف‌های مبتنی بر مرحله فیزیکی', type: 'text', placeholder: '[]' },
          { key: 'progressAllowContractOverride', label: 'اجازه تغییر در سطح قرارداد', type: 'switch' },
        ],
      },
    ],
  },
  prepayment: {
    id: 'prepayment',
    title: 'پیش پرداخت',
    description: 'فلو فعال‌سازی، جزئیات و چهار تب اصلی مطابق مرجع.',
    activationTitle: 'نمایش پیش پرداخت در پیشنهاد فروش',
    activationDescription: 'اگر بخش فعال باشد، کاربر بین حالت درصدی، مبلغ ثابت، ترکیبی و اختیار کارشناس فروش انتخاب می‌کند.',
    detailsLabel: 'جزئیات تنظیمات پیش پرداخت',
    tabs: [
      {
        id: 'percent',
        title: 'درصدی',
        description: 'پیش‌پرداخت بر اساس درصدی از مبلغ قرارداد',
        fields: [
          { key: 'prePercent', label: 'درصدی از مبلغ کل قرارداد', type: 'number', placeholder: '20' },
          { key: 'prePercentMin', label: 'حداقل درصد مجاز', type: 'number', placeholder: '5' },
          { key: 'prePercentInstallmentEnabled', label: 'امکان پرداخت اقساطی پیش‌پرداخت', type: 'switch' },
          {
            key: 'prePercentInstallmentWindow',
            label: 'حداکثر بازه پیشنهادی پس از ثبت قرارداد',
            type: 'select',
            options: ['در اختیار مدیر فروش', 'یک هفته', 'دو هفته', 'یک ماه', 'چهل و پنج روز', 'دو ماه'],
          },
        ],
      },
      {
        id: 'fixed',
        title: 'مبلغ ثابت',
        description: 'پیش‌پرداخت ثابت برای همه قراردادها',
        fields: [
          { key: 'preFixedAmount', label: 'مبلغ ثابت', type: 'number', placeholder: '150000000' },
          { key: 'preFixedInstallmentEnabled', label: 'امکان پرداخت اقساطی پیش‌پرداخت', type: 'switch' },
          {
            key: 'preFixedInstallmentWindow',
            label: 'حداکثر بازه پیشنهادی پس از ثبت قرارداد',
            type: 'select',
            options: ['در اختیار مدیر فروش', 'یک هفته', 'دو هفته', 'یک ماه', 'چهل و پنج روز', 'دو ماه'],
          },
        ],
      },
      {
        id: 'combined',
        title: 'ترکیبی',
        description: 'ترکیب درصد و مبلغ ثابت در یک تنظیم',
        fields: [
          { key: 'preCombinedPercent', label: 'درصدی از مبلغ کل قرارداد', type: 'number', placeholder: '10' },
          { key: 'preCombinedAmount', label: 'مبلغ ثابت', type: 'number', placeholder: '50000000' },
          { key: 'preCombinedInstallmentEnabled', label: 'امکان پرداخت اقساطی پیش‌پرداخت', type: 'switch' },
          {
            key: 'preCombinedInstallmentWindow',
            label: 'حداکثر بازه پیشنهادی پس از ثبت قرارداد',
            type: 'select',
            options: ['در اختیار مدیر فروش', 'یک هفته', 'دو هفته', 'یک ماه', 'چهل و پنج روز', 'دو ماه'],
          },
        ],
      },
      {
        id: 'sales',
        title: 'اختیار کارشناس فروش',
        description: 'بازه مجاز برای تعیین پیش‌پرداخت توسط فروش',
        fields: [
          { key: 'preSalesEnabled', label: 'امکان ثبت پیش‌پرداخت با توجه به سیاست مدیر فروش', type: 'switch' },
          { key: 'preSalesInstallmentEnabled', label: 'امکان پرداخت اقساطی پیش‌پرداخت', type: 'switch' },
          {
            key: 'preSalesInstallmentWindow',
            label: 'حداکثر بازه پیشنهادی پس از ثبت قرارداد',
            type: 'select',
            options: ['در اختیار مدیر فروش', 'یک هفته', 'دو هفته', 'یک ماه', 'چهل و پنج روز', 'دو ماه'],
          },
        ],
      },
    ],
  },
  adjustment: {
    id: 'adjustment',
    title: 'تنظیمات تعدیل',
    description: 'فعال‌سازی تعدیل قیمت قرارداد، انتخاب زمان اثر و نوع شاخص.',
    activationTitle: 'فعال‌سازی چارچوب تعدیل قیمت قرارداد',
    activationDescription: 'در صورت فعال بودن، چارچوب پیشنهادی تعدیل قیمت قرارداد بر اساس شاخص‌ها یا درصد ثابت و در بازه‌های زمانی مشخص تعریف می‌شود.',
    detailsLabel: 'جزئیات تنظیمات تعدیل',
    chips: ['روزانه', 'ماهانه', 'سه ماهه', 'شش ماهه', 'سالانه'],
    tabs: [
      {
        id: 'fixed-percent',
        title: 'درصد ثابت',
        description: 'اعمال درصد مشخص در هر نوبت تعدیل',
        fields: [
          { key: 'adjustFixedPercent', label: 'درصد تعدیل', type: 'number', placeholder: '18' },
          { key: 'adjustFixedRound', label: 'قاعده گرد کردن', type: 'select', options: ['بدون گرد کردن', 'به بالا', 'به پایین'] },
        ],
      },
      {
        id: 'specific-indicator',
        title: 'یک شاخص مشخص',
        description: 'تعدیل بر اساس یک شاخص اقتصادی واحد',
        fields: [
          { key: 'adjustIndicatorName', label: 'نام شاخص', type: 'select', options: ['تورم بانک مرکزی', 'شاخص ساخت‌وساز', 'ارز توافقی'] },
          { key: 'adjustIndicatorSource', label: 'منبع شاخص', type: 'select', options: ['مرکز آمار', 'بانک مرکزی', 'ورود دستی'] },
        ],
      },
      {
        id: 'multi-indicator',
        title: 'چند شاخص',
        description: 'ترکیب چند شاخص برای فرمول تعدیل',
        fields: [
          { key: 'adjustMultiHousingWeight', label: 'وزن شاخص مسکن', type: 'number', placeholder: '40' },
          { key: 'adjustMultiLaborWeight', label: 'وزن شاخص دستمزد', type: 'number', placeholder: '30' },
          { key: 'adjustMultiMaterialWeight', label: 'وزن شاخص مصالح', type: 'number', placeholder: '30' },
          { key: 'adjustMultiManualOverride', label: 'اجازه بازنویسی دستی', type: 'switch' },
          { key: 'adjustMultiMaterialsOtherWeight', label: 'وزن مصالح', type: 'number', placeholder: '1' },
          { key: 'adjustMultiWageWeight', label: 'وزن دستمزد', type: 'number', placeholder: '0' },
          { key: 'adjustMultiEnergyWeight', label: 'وزن انرژی', type: 'number', placeholder: '0' },
          { key: 'adjustMultiGeneralPriceWeight', label: 'وزن شاخص عمومی قیمت', type: 'number', placeholder: '0' },
        ],
      },
    ],
  },
  'additional-costs': {
    id: 'additional-costs',
    title: 'هزینه های جانبی',
    description: 'فعال‌سازی و تنظیم انواع هزینه جانبی، شامل حالت‌های خاص و ترکیبی.',
    activationTitle: 'فعال کردن هزینه‌هایی است که خارج از مبلغ اصل قرارداد محاسبه می‌شوند.',
    activationDescription: 'هزینه‌های جانبی به‌صورت مستقل از اصل مبلغ و تعهدات اصلی طرفین تعیین می‌گردند.',
    tabs: [
      {
        id: 'amount',
        title: 'مبلغ ثابت',
        description: 'هزینه جانبی با مبلغ مشخص',
        fields: [
          { key: 'costAmountValue', label: 'مبلغ متنظر', type: 'number', placeholder: '100000' },
        ],
      },
      {
        id: 'contract-percent',
        title: 'درصدی از قرارداد',
        description: 'محاسبه هزینه جانبی از مبلغ کل قرارداد',
        fields: [
          { key: 'costPercentValue', label: 'درصد متنظر', type: 'number', placeholder: '2' },
        ],
      },
      {
        id: 'combined',
        title: 'ترکیبی',
        description: 'ترکیب مبلغ ثابت و درصدی برای یک هزینه',
        fields: [
          { key: 'costCombinedAmount', label: 'مبلغ متنظر', type: 'number', placeholder: '100000' },
          { key: 'costCombinedPercent', label: 'درصد متنظر', type: 'number', placeholder: '2' },
        ],
      },
      {
        id: 'per-installment-fixed',
        title: 'مبلغ ثابت به ازای هر قسط بر مانده بدهی',
        description: 'برای هر قسط بر اساس مانده بدهی یک مبلغ ثابت هزینه اعمال می‌شود.',
        fields: [
          { key: 'costPerInstallmentValue', label: 'مبلغ ثابت به ازای هر قسط', type: 'number', placeholder: '100000' },
        ],
      },
    ],
  },
  discount: {
    id: 'discount',
    title: 'تنظیمات تخفیف',
    description: 'فعال‌سازی تخفیف و مدیریت تخفیف روی اصل قرارداد یا تخفیف‌های موردی.',
    activationTitle: 'فعال‌سازی تخفیف',
    activationDescription: 'با فعال‌سازی این گزینه، می‌توانید انواع تخفیف را تعریف کنید.',
    tabs: [
      {
        id: 'early-payment',
        title: 'پرداخت زودهنگام',
        description: 'تخفیف بابت تسویه زودتر از موعد',
        fields: [
          { key: 'discountEarlyTarget', label: 'مبنای تخفیف', type: 'select', options: ['درصد', 'مبلغ'] },
          { key: 'discountEarlyValue', label: 'مقدار تخفیف', type: 'number', placeholder: '5' },
          { key: 'discountEarlyDeadline', label: 'آخرین مهلت استفاده', type: 'text', placeholder: 'تا 10 روز قبل از سررسید' },
          { key: 'discountEarlyKeepOnDelay', label: 'حفظ تخفیف در تاخیر جزئی', type: 'switch' },
          { key: 'discountScope', label: 'دامنه اعمال تخفیف', type: 'select', options: ['whole', 'itemized'] },
          { key: 'discountEntryId', label: 'آیتم تخفیف', type: 'select', options: ['all-dues', 'installments', 'unit-handover', 'advance-payment', 'document-handover', 'adjustment-payment', 'misc-costs', 'interest', 'early-payment'] },
          { key: 'discountValueMode', label: 'نوع تخفیف', type: 'select', options: ['percent', 'amount'] },
          { key: 'discountMinValue', label: 'حداقل تخفیف', type: 'number', placeholder: '0' },
          { key: 'discountMaxValue', label: 'حداکثر تخفیف', type: 'number', placeholder: '0' },
          { key: 'discountConditionConfigured', label: 'شرط تخفیف', type: 'switch' },
          { key: 'discountManagerApproval', label: 'تایید مدیر', type: 'switch' },
          { key: 'discountApprovalThreshold', label: 'آستانه تایید مدیر', type: 'number', placeholder: '0' },
        ],
      },
      {
        id: 'on-contract',
        title: 'روی قرارداد',
        description: 'تخفیف در زمان ثبت یا اصلاح قرارداد',
        fields: [
          { key: 'discountContractTarget', label: 'نوع تخفیف', type: 'select', options: ['درصد', 'مبلغ'] },
          { key: 'discountContractValue', label: 'مقدار تخفیف', type: 'number', placeholder: '100000000' },
          { key: 'discountContractSettlement', label: 'زمان تسویه در ابطال', type: 'select', options: ['همان روز', 'اولین قسط', 'آخرین قسط'] },
          { key: 'discountContractNeedApproval', label: 'نیاز به تایید مدیر فروش', type: 'switch' },
        ],
      },
    ],
  },
  penalty: {
    id: 'penalty',
    title: 'تنظیمات جریمه',
    description: 'فعال‌سازی جریمه‌ها و تعریف چارچوب محاسبه هر مورد مطابق قرارداد.',
    activationTitle: 'تنظیمات جریمه‌ها',
    activationDescription: 'در صورت فعال بودن، چارچوب پیشنهادی محاسبه جریمه تعریف می‌شود و در زمان ثبت یا اجرای قرارداد، در صورت وقوع تأخیر محاسبه و هشدار نمایش داده می‌شود.',
    tabs: [
      {
        id: 'fixed',
        title: 'مبلغ ثابت برای هر روز/ماه',
        description: 'در این روش برای هر روز، ماه یا سال تاخیر مبلغ ثابتی به‌عنوان جریمه محاسبه می‌شود.',
        fields: [
          { key: 'penaltyFixedPeriod', label: 'دوره محاسبه جریمه', type: 'select', options: ['روزانه', 'ماهانه', 'سالانه'] },
          { key: 'penaltyFixedAmount', label: 'مبلغ ثابت جریمه', type: 'number', placeholder: '100000' },
          { key: 'penaltyFixedGraceDays', label: 'مهلت تنفس (بدون جریمه)', type: 'number', placeholder: '2' },
          { key: 'penaltyFixedExtraFeeEnabled', label: 'هزینه دیرکرد', type: 'switch' },
          { key: 'penaltyFixedExtraFeeType', label: 'نوع هزینه دیرکرد', type: 'select', options: ['درصد', 'مبلغ ثابت'] },
          { key: 'penaltyFixedExtraFeeAmount', label: 'جریمه بالاسری', type: 'number', placeholder: '0.5' },
          { key: 'penaltyFixedExtraFeeRound', label: 'قاعده گرد کردن هزینه دیرکرد', type: 'select', options: ['0.0', '0.00', 'کسر 100', 'کسر 1000'] },
        ],
      },
      {
        id: 'debt-percent',
        title: 'درصدی از مانده بدهی معوق',
        description: 'در این روش مبلغ جریمه بر اساس درصدی از مانده بدهی خریدار محاسبه می‌شود.',
        fields: [
          { key: 'penaltyDebtPeriod', label: 'دوره محاسبه', type: 'select', options: ['روزانه', 'ماهانه', 'سالانه'] },
          { key: 'penaltyDebtPercent', label: 'درصد جریمه', type: 'number', placeholder: '25.2' },
          { key: 'penaltyDebtBankPercent', label: 'درصد سود بانکی', type: 'number', placeholder: '0' },
          { key: 'penaltyDebtGraceDays', label: 'مهلت تنفس (بدون جریمه)', type: 'number', placeholder: '2' },
          { key: 'penaltyDebtRound', label: 'قاعده گرد کردن مبلغ جریمه', type: 'select', options: ['0.0', '0.00', 'کسر 100', 'کسر 1000'] },
          { key: 'penaltyDebtExtraFeeEnabled', label: 'هزینه دیرکرد', type: 'switch' },
          { key: 'penaltyDebtExtraFeeType', label: 'نوع هزینه دیرکرد', type: 'select', options: ['درصد', 'مبلغ ثابت'] },
          { key: 'penaltyDebtExtraFeeAmount', label: 'جریمه بالاسری', type: 'number', placeholder: '0.5' },
          { key: 'penaltyDebtExtraFeeRound', label: 'قاعده گرد کردن هزینه دیرکرد', type: 'select', options: ['0.0', '0.00', 'کسر 100', 'کسر 1000'] },
        ],
      },
      {
        id: 'contract-percent',
        title: 'درصدی از کل قرارداد',
        description: 'در این روش مبلغ جریمه بر اساس درصدی از مبلغ کل قرارداد محاسبه می‌شود.',
        fields: [
          { key: 'penaltyContractPeriod', label: 'دوره محاسبه', type: 'select', options: ['روزانه', 'ماهانه', 'سالانه'] },
          { key: 'penaltyContractPercent', label: 'درصد جریمه', type: 'number', placeholder: '0.5' },
          { key: 'penaltyContractBankPercent', label: 'درصد سود بانکی', type: 'number', placeholder: '0' },
          { key: 'penaltyContractGraceDays', label: 'مهلت تنفس (بدون جریمه)', type: 'number', placeholder: '2' },
          { key: 'penaltyContractRound', label: 'قاعده گرد کردن مبلغ جریمه', type: 'select', options: ['0.0', '0.00', 'کسر 100', 'کسر 1000'] },
          { key: 'penaltyContractExtraFeeEnabled', label: 'هزینه دیرکرد', type: 'switch' },
          { key: 'penaltyContractExtraFeeType', label: 'نوع هزینه دیرکرد', type: 'select', options: ['درصد', 'مبلغ ثابت'] },
          { key: 'penaltyContractExtraFeeAmount', label: 'جریمه بالاسری', type: 'number', placeholder: '0.5' },
          { key: 'penaltyContractExtraFeeRound', label: 'قاعده گرد کردن هزینه دیرکرد', type: 'select', options: ['0.0', '0.00', 'کسر 100', 'کسر 1000'] },
        ],
      },
      {
        id: 'progressive',
        title: 'جریمه تصاعدی با روزهای تاخیر',
        description: 'در این روش با افزایش مدت تاخیر، نرخ جریمه بر اساس بازه‌های زمانی افزایش پیدا می‌کند.',
        fields: [
          { key: 'penaltyProgressivePeriod', label: 'دوره محاسبه جریمه', type: 'select', options: ['روزانه', 'ماهانه', 'سالانه'] },
          { key: 'penaltyProgressiveBankPercent', label: 'درصد سود بانکی', type: 'number', placeholder: '0' },
          { key: 'penaltyProgressiveGraceDays', label: 'مهلت تنفس (بدون جریمه)', type: 'number', placeholder: '2' },
          { key: 'penaltyProgressiveRound', label: 'قاعده گرد کردن مبلغ جریمه', type: 'select', options: ['0.0', '0.00', 'کسر 100', 'کسر 1000'] },
          { key: 'penaltyProgressiveRow1From', label: 'از روز ۱', type: 'number', placeholder: '1' },
          { key: 'penaltyProgressiveRow1To', label: 'تا روز ۱', type: 'number', placeholder: '4' },
          { key: 'penaltyProgressiveRow1Rate', label: 'نرخ جریمه ۱', type: 'number', placeholder: '0.5' },
          { key: 'penaltyProgressiveRow2From', label: 'از روز ۲', type: 'number', placeholder: '5' },
          { key: 'penaltyProgressiveRow2To', label: 'تا روز ۲', type: 'number', placeholder: '6' },
          { key: 'penaltyProgressiveRow2Rate', label: 'نرخ جریمه ۲', type: 'number', placeholder: '0.5' },
          { key: 'penaltyProgressiveRow3From', label: 'از روز ۳', type: 'number', placeholder: '7' },
          { key: 'penaltyProgressiveRow3To', label: 'تا روز ۳', type: 'number', placeholder: '45' },
          { key: 'penaltyProgressiveRow3Rate', label: 'نرخ جریمه ۳', type: 'number', placeholder: '3.3' },
          { key: 'penaltyProgressiveRow4From', label: 'از روز ۴', type: 'number', placeholder: '' },
          { key: 'penaltyProgressiveRow4To', label: 'تا روز ۴', type: 'number', placeholder: '' },
          { key: 'penaltyProgressiveRow4Rate', label: 'نرخ جریمه ۴', type: 'number', placeholder: '' },
          { key: 'penaltyProgressiveExtraFeeEnabled', label: 'هزینه دیرکرد', type: 'switch' },
          { key: 'penaltyProgressiveExtraFeeType', label: 'نوع هزینه دیرکرد', type: 'select', options: ['درصد', 'مبلغ ثابت'] },
          { key: 'penaltyProgressiveExtraFeeAmount', label: 'جریمه بالاسری', type: 'number', placeholder: '0.5' },
          { key: 'penaltyProgressiveExtraFeeRound', label: 'قاعده گرد کردن هزینه دیرکرد', type: 'select', options: ['0.0', '0.00', 'کسر 100', 'کسر 1000'] },
        ],
      },
    ],
  },
  'builder-penalty': {
    id: 'builder-penalty',
    title: 'جریمه سازنده',
    description: 'فعال‌سازی و مدیریت جریمه‌های مربوط به تعهدات سازنده در قرارداد.',
    activationTitle: 'فعال‌سازی جرائم سازنده',
    activationDescription: 'با فعال‌سازی این بخش، تنظیمات جریمه سازنده بر اساس پیکربندی برای قراردادهای جدید اعمال خواهد شد.',
    tabs: [
      {
        id: 'builder-penalty-overview',
        title: 'جرائم سازنده',
        description: 'مرور و مدیریت جریمه‌های سازنده.',
        fields: [
          { key: 'unitDeliveryDelayEnabled', label: 'تاخیر در تحویل واحد', type: 'switch' },
          { key: 'materialSpecsChangeEnabled', label: 'تغییرات مهم مصالح و مشخصات واحد', type: 'switch' },
          { key: 'areaDifferenceEnabled', label: 'اختلاف متراژ', type: 'switch' },
          { key: 'unitDeliveryDelayMode', label: 'روش محاسبه تاخیر در تحویل واحد', type: 'select', options: ['fixed', 'percent', 'progressive'] },
          { key: 'unitDeliveryDelayPeriod', label: 'دوره محاسبه تاخیر در تحویل واحد', type: 'select', options: ['روزانه', 'ماهانه', 'سالانه'] },
          { key: 'unitDeliveryDelayFixedAmount', label: 'مبلغ ثابت جریمه تاخیر در تحویل واحد', type: 'number', placeholder: '100000' },
          { key: 'unitDeliveryDelayPercentAmount', label: 'درصد جریمه تاخیر در تحویل واحد', type: 'number', placeholder: '2.5' },
          { key: 'unitDeliveryDelayPenaltyCap', label: 'سقف جریمه تاخیر در تحویل واحد', type: 'number', placeholder: '50000000' },
          { key: 'unitDeliveryDelayGraceDays', label: 'مهلت تنفس تاخیر در تحویل واحد', type: 'number', placeholder: '2' },
          { key: 'unitDeliveryDelayProgressiveRow1From', label: 'از روز ۱ تاخیر در تحویل واحد', type: 'number', placeholder: '1' },
          { key: 'unitDeliveryDelayProgressiveRow1To', label: 'تا روز ۱ تاخیر در تحویل واحد', type: 'number', placeholder: '4' },
          { key: 'unitDeliveryDelayProgressiveRow1Rate', label: 'نرخ ۱ تاخیر در تحویل واحد', type: 'number', placeholder: '0.5' },
          { key: 'unitDeliveryDelayProgressiveRow2From', label: 'از روز ۲ تاخیر در تحویل واحد', type: 'number', placeholder: '5' },
          { key: 'unitDeliveryDelayProgressiveRow2To', label: 'تا روز ۲ تاخیر در تحویل واحد', type: 'number', placeholder: '10' },
          { key: 'unitDeliveryDelayProgressiveRow2Rate', label: 'نرخ ۲ تاخیر در تحویل واحد', type: 'number', placeholder: '1' },
          { key: 'unitDeliveryDelayProgressiveRow3From', label: 'از روز ۳ تاخیر در تحویل واحد', type: 'number', placeholder: '11' },
          { key: 'unitDeliveryDelayProgressiveRow3To', label: 'تا روز ۳ تاخیر در تحویل واحد', type: 'number', placeholder: '30' },
          { key: 'unitDeliveryDelayProgressiveRow3Rate', label: 'نرخ ۳ تاخیر در تحویل واحد', type: 'number', placeholder: '2' },
          { key: 'materialSpecsChangeIncludedTypes', label: 'نوع تغییرات مشمول', type: 'text', placeholder: '[]' },
          {
            key: 'materialSpecsChangeImportanceLevel',
            label: 'سطح اهمیت تغییر',
            type: 'select',
            options: ['تغییر جزئی', 'تغییر مؤثر', 'تغییر اساسی'],
          },
          { key: 'materialSpecsChangeReferenceSources', label: 'مرجع مقایسه', type: 'text', placeholder: '[]' },
          { key: 'materialSpecsChangeEquivalentOrBetterAllowed', label: 'جایگزینی هم‌ارزش یا بهتر مجاز باشد', type: 'switch' },
          { key: 'materialSpecsChangeBuyerApprovalRequired', label: 'تغییرات مؤثر یا اساسی نیازمند تأیید خریدار است', type: 'switch' },
          { key: 'materialSpecsChangeViolationOutcomes', label: 'نتیجه قابل اعمال در صورت تخلف', type: 'text', placeholder: '[]' },
          { key: 'materialSpecsChangeRequiredDocuments', label: 'مستندات لازم برای بررسی تغییر', type: 'text', placeholder: '[]' },
          { key: 'areaDifferenceMode', label: 'روش محاسبه اختلاف متراژ', type: 'select', options: ['fixed', 'percent', 'progressive'] },
          { key: 'areaDifferencePeriod', label: 'دوره محاسبه اختلاف متراژ', type: 'select', options: ['روزانه', 'ماهانه', 'سالانه'] },
          { key: 'areaDifferenceFixedAmount', label: 'مبلغ ثابت جریمه اختلاف متراژ', type: 'number', placeholder: '100000' },
          { key: 'areaDifferencePercentAmount', label: 'درصد جریمه اختلاف متراژ', type: 'number', placeholder: '2.5' },
          { key: 'areaDifferencePenaltyCap', label: 'سقف جریمه اختلاف متراژ', type: 'number', placeholder: '50000000' },
          { key: 'areaDifferenceAllowedChange', label: 'میزان مجاز تغییر در متراژ', type: 'number', placeholder: '2' },
          { key: 'areaDifferenceProgressiveRow1From', label: 'از بازه ۱ اختلاف متراژ', type: 'number', placeholder: '1' },
          { key: 'areaDifferenceProgressiveRow1To', label: 'تا بازه ۱ اختلاف متراژ', type: 'number', placeholder: '4' },
          { key: 'areaDifferenceProgressiveRow1Rate', label: 'نرخ ۱ اختلاف متراژ', type: 'number', placeholder: '0.5' },
          { key: 'areaDifferenceProgressiveRow2From', label: 'از بازه ۲ اختلاف متراژ', type: 'number', placeholder: '5' },
          { key: 'areaDifferenceProgressiveRow2To', label: 'تا بازه ۲ اختلاف متراژ', type: 'number', placeholder: '10' },
          { key: 'areaDifferenceProgressiveRow2Rate', label: 'نرخ ۲ اختلاف متراژ', type: 'number', placeholder: '1' },
          { key: 'areaDifferenceProgressiveRow3From', label: 'از بازه ۳ اختلاف متراژ', type: 'number', placeholder: '11' },
          { key: 'areaDifferenceProgressiveRow3To', label: 'تا بازه ۳ اختلاف متراژ', type: 'number', placeholder: '30' },
          { key: 'areaDifferenceProgressiveRow3Rate', label: 'نرخ ۳ اختلاف متراژ', type: 'number', placeholder: '2' },
        ],
      },
    ],
  },
  'builder-cancellation': {
    id: 'builder-cancellation',
    title: 'تنظیمات فسخ سازنده',
    description: 'فعال‌سازی و مدیریت اختیارات فسخ قرارداد برای سازنده در سناریوهای مختلف.',
    activationTitle: 'فعال‌سازی اختیارات فسخ سازنده',
    activationDescription: 'با فعال‌سازی این بخش، تنظیمات فسخ سازنده بر اساس پیکربندی برای قراردادهای جدید اعمال خواهد شد.',
    tabs: [
      {
        id: 'builder-cancellation-overview',
        title: 'فسخ سازنده',
        description: 'مرور و مدیریت سناریوهای فسخ سازنده.',
        fields: [
          { key: 'builderCancellationPaymentDelayEnabled', label: 'تاخیر در پرداخت اقساط', type: 'switch' },
          { key: 'builderCancellationUnpaidFinancialEnabled', label: 'عدم انجام تعهدات مالی', type: 'switch' },
          { key: 'builderCancellationMissingDocumentsEnabled', label: 'نقص مدارک / تعهدات', type: 'switch' },
          { key: 'builderCancellationOtherBreachEnabled', label: 'نقض سایر تعهدات قراردادی', type: 'switch' },
          { key: 'builderCancellationNotificationEnabled', label: 'اطلاع رسانی', type: 'switch' },
          { key: 'builderCancellationDraftUsageEnabled', label: 'استفاده از پیش نویس', type: 'switch' },
          {
            key: 'builderCancellationPaymentDelayPreset',
            label: 'مهلت مجاز تاخیر در پرداخت',
            type: 'select',
            options: ['3 روز', '7 روز', '10 روز', '15 روز', '30 روز', 'روزانه'],
          },
          { key: 'builderCancellationPaymentDelayCustomDays', label: 'تعداد روز مجاز تاخیر در پرداخت', type: 'number', placeholder: '10' },
          {
            key: 'builderCancellationPaymentDelayBasis',
            label: 'مبنای تشخیص تاخیر در پرداخت',
            type: 'select',
            options: ['هر قسط پرداخت نشده'],
          },
          {
            key: 'builderCancellationPaymentDelayMinDebt',
            label: 'حداقل مبلغ بدهی برای فعال شدن فسخ',
            type: 'number',
            placeholder: '10000000',
          },
          {
            key: 'builderCancellationPaymentDelayPartialPaymentBehavior',
            label: 'نحوه برخورد با پرداخت ناقص',
            type: 'select',
            options: ['اگر قسط کامل نشده، فسخ فعال شود', 'اگر پرداخت ناقص باشد، فسخ فعال نشود', 'بر اساس مانده بدهی تصمیم گرفته شود'],
          },
          { key: 'builderCancellationUnpaidFinancialContractFees', label: 'تعهد مالی: هزینه‌های قراردادی', type: 'switch' },
          { key: 'builderCancellationUnpaidFinancialPenalties', label: 'تعهد مالی: جریمه‌های قراردادی', type: 'switch' },
          { key: 'builderCancellationUnpaidFinancialCustom', label: 'تعهد مالی: تعهد مالی سفارشی', type: 'switch' },
          {
            key: 'builderCancellationUnpaidFinancialGracePreset',
            label: 'مهلت مجاز برای ایفای تعهدات مالی',
            type: 'select',
            options: ['روزانه', '7 روز', '15 روز', '30 روز'],
          },
          { key: 'builderCancellationUnpaidFinancialGraceDays', label: 'تعداد روز مجاز برای ایفای تعهدات مالی', type: 'number', placeholder: '7' },
          { key: 'builderCancellationMissingDocsIdentity', label: 'نقص مدارک: مدارک هویتی', type: 'switch' },
          { key: 'builderCancellationMissingDocsSignature', label: 'نقص مدارک: تکمیل امضا', type: 'switch' },
          { key: 'builderCancellationMissingDocsLegal', label: 'نقص مدارک: مجوزهای حقوقی', type: 'switch' },
          {
            key: 'builderCancellationMissingDocsGracePreset',
            label: 'مهلت تکمیل مدارک / تعهدات',
            type: 'select',
            options: ['روزانه', '7 روز', '10 روز', '15 روز', '30 روز'],
          },
          { key: 'builderCancellationMissingDocsGraceDays', label: 'تعداد روز مجاز برای تکمیل مدارک / تعهدات', type: 'number', placeholder: '10' },
          { key: 'builderCancellationReminderEnabled', label: 'ارسال یادآوری قبل از فسخ', type: 'switch' },
          { key: 'builderCancellationFormalDemandEnabled', label: 'مطالبه رسمی قبل از فسخ', type: 'switch' },
        ],
      },
    ],
  },
  'buyer-cancellation': {
    id: 'buyer-cancellation',
    title: 'تنظیمات فسخ خریدار',
    description: 'فعال‌سازی و مدیریت اختیارات فسخ قرارداد برای خریدار در سناریوهای مختلف.',
    activationTitle: 'فعال‌سازی اختیارات فسخ خریدار',
    activationDescription: 'با فعال‌سازی این بخش، تنظیمات فسخ خریدار بر اساس پیکربندی برای قراردادهای جدید اعمال خواهد شد.',
    tabs: [
      {
        id: 'buyer-cancellation-overview',
        title: 'فسخ خریدار',
        description: 'مرور و مدیریت سناریوهای فسخ خریدار.',
        fields: [
          { key: 'buyerCancellationLateDeliveryEnabled', label: 'تاخیر در تحویل', type: 'switch' },
          { key: 'buyerCancellationSpecificationChangesEnabled', label: 'تغییر مشخصات', type: 'switch' },
          { key: 'buyerCancellationBreachEnabled', label: 'نقض تعهدات', type: 'switch' },
          { key: 'buyerCancellationAreaDiscrepancyEnabled', label: 'حق فسخ ناشی از اختلاف متراژ واحد', type: 'switch' },
          { key: 'buyerCancellationNotificationEnabled', label: 'اطلاع رسانی', type: 'switch' },
          { key: 'buyerCancellationDraftTemplateUsageEnabled', label: 'استفاده در پیش نویس', type: 'switch' },
        ],
      },
    ],
  },
  forgiveness: {
    id: 'forgiveness',
    title: 'تنظیمات بخشودگی',
    description: 'فعال‌سازی بخشودگی جرایم و مدیریت بخشودگی روی کل قرارداد یا آیتم‌های موردی.',
    activationTitle: 'فعال‌سازی بخش بخشودگی',
    activationDescription: 'در این بخش می‌توانید وضعیت فعال‌سازی بخشودگی جرایم را مدیریت کنید.',
    tabs: [
      {
        id: 'whole-contract',
        title: 'بخشودگی روی کل قرارداد',
        description: 'تعریف بخشودگی جرایم برای کل قرارداد',
        fields: [
          { key: 'forgiveMaxDelayCount', label: 'حداکثر تعداد دفعات تاخیر در یک قرارداد', type: 'number', placeholder: '3' },
          { key: 'forgiveScope', label: 'دامنه اعمال بخشودگی', type: 'select', options: ['whole', 'itemized'] },
          { key: 'forgiveEntryId', label: 'آیتم بخشودگی', type: 'select', options: ['whole-contract', 'unit-handover-delay', 'installment-delay', 'document-delay', 'advance-payment-delay', 'misc-cost-delay', 'adjustment-delay', 'penalty-payment-delay', 'bank-loan-case-delay', 'lawsuit-cost', 'document-transfer-followup'] },
          { key: 'forgiveValueMode', label: 'نوع مقدار بخشودگی', type: 'select', options: ['amount', 'percent'] },
          { key: 'forgiveMinValue', label: 'حداقل جریمه قابل بخشش', type: 'number', placeholder: '1000000' },
          { key: 'forgiveMaxValue', label: 'حداکثر جریمه قابل بخشش', type: 'number', placeholder: '10000000' },
          { key: 'forgiveOutsideBuyerControl', label: 'تاخیر خارج از اختیار خریدار', type: 'switch' },
          { key: 'forgiveManagerApproval', label: 'تایید مدیر برای بخشودگی‌های بزرگ', type: 'switch' },
        ],
      },
      {
        id: 'itemized',
        title: 'بخشودگی موردی قرارداد',
        description: 'تعریف بخشودگی برای آیتم‌های مشخص قرارداد',
        fields: [
          { key: 'forgiveAllowed', label: 'مجاز بودن بخشودگی', type: 'switch' },
        ],
      },
    ],
  },
  interest: {
    id: 'interest',
    title: 'سود دریافتی',
    description: 'تنظیم محاسبه سود قرارداد بر اساس سود ساده، مرکب یا سود بر مانده بدهی.',
    activationTitle: 'آیا دریافت سود در قرارداد فعال باشد یا خیر',
    activationDescription: 'اگر این گزینه فعال باشد، مبلغ اقساط بر اساس یکی از روش‌های محاسبه سود (ساده، مرکب یا بر مانده بدهی) محاسبه می‌شود.',
    detailsLabel: 'جزئیات تنظیمات سود',
    tabs: [
      {
        id: 'simple-interest',
        title: 'سود ساده',
        description: 'در این روش سود به صورت درصد ثابت روی مبلغ قرارداد محاسبه می‌شود و در طول دوره تغییر نمی‌کند.',
        fields: [
          { key: 'interestApr', label: 'نرخ سود سالیانه (APR)', type: 'number', placeholder: '44' },
          { key: 'interestPenaltyEnabled', label: 'اعمال جریمه بر مبلغ سود معوق', type: 'switch' },
          { key: 'interestRoundRule', label: 'قاعده گرد کردن مبلغ سود', type: 'select', options: ['0.0', '0.00', 'کسر 100', 'کسر 1000'] },
          { key: 'interestReducingPrincipal', label: 'سهم اصل ثابت سود کاهشی', type: 'switch' },
          { key: 'interestTogetherPayment', label: 'پرداخت همزمان اصل و سود', type: 'switch' },
          { key: 'interestPrincipalAtEnd', label: 'پرداخت فقط سود تسویه اصل در پایان', type: 'switch' },
        ],
      },
      {
        id: 'compound-interest',
        title: 'سود مرکب',
        description: 'در این روش سود به همراه سود قبلی محاسبه می‌شود بنابراین سود با گذشت زمان افزایش پیدا می‌کند.',
        fields: [
          { key: 'interestAprCompound', label: 'نرخ سود سالیانه (APR)', type: 'number', placeholder: '55' },
          { key: 'interestCompoundPeriod', label: 'انتخاب دوره محاسبه سود', type: 'select', options: ['روزانه', 'ماهانه', 'سه‌ماهه', 'سالانه'] },
          { key: 'interestPenaltyEnabledCompound', label: 'اعمال جریمه بر مبلغ سود معوق', type: 'switch' },
          { key: 'interestRoundRuleCompound', label: 'قاعده گرد کردن مبلغ سود', type: 'select', options: ['0.0', '0.00', 'کسر 100', 'کسر 1000'] },
          { key: 'interestReducingPrincipalCompound', label: 'سهم اصل ثابت سود کاهشی', type: 'switch' },
          { key: 'interestTogetherPaymentCompound', label: 'پرداخت همزمان اصل و سود', type: 'switch' },
          { key: 'interestPrincipalAtEndCompound', label: 'پرداخت فقط سود تسویه اصل در پایان', type: 'switch' },
        ],
      },
      {
        id: 'remaining-debt-interest',
        title: 'سود بر مانده بدهی',
        description: 'در این روش سود در هر دوره بر اساس مانده بدهی باقی‌مانده محاسبه می‌شود.',
        fields: [
          { key: 'interestAprRemaining', label: 'نرخ سود سالیانه (APR)', type: 'number', placeholder: '55' },
          { key: 'interestPenaltyEnabledRemaining', label: 'اعمال جریمه بر مبلغ سود معوق', type: 'switch' },
          { key: 'interestRoundRuleRemaining', label: 'قاعده گرد کردن مبلغ سود', type: 'select', options: ['0.0', '0.00', 'کسر 100', 'کسر 1000'] },
          { key: 'interestReducingPrincipalRemaining', label: 'سهم اصل ثابت سود کاهشی', type: 'switch' },
          { key: 'interestTogetherPaymentRemaining', label: 'پرداخت همزمان اصل و سود', type: 'switch' },
          { key: 'interestPrincipalAtEndRemaining', label: 'پرداخت فقط سود تسویه اصل در پایان', type: 'switch' },
        ],
      },
    ],
  },
});

export function createInitialRuleState(ruleId: ContractRuleId): ContractRuleState {
  const rule = RULE_CONFIGS[ruleId];
  const values: Record<string, string | boolean> = {};

  rule.tabs.forEach((tab) => {
    tab.fields.forEach((field) => {
      if (field.type === 'switch') {
        values[field.key] = false;
      } else if (field.type === 'select') {
        values[field.key] = field.options[0] ?? '';
      } else {
        values[field.key] = '';
      }
    });
  });

  return {
    active:
      ruleId === 'prepayment' ||
      ruleId === 'installments' ||
      ruleId === 'additional-costs' ||
      ruleId === 'adjustment' ||
      ruleId === 'discount' ||
      ruleId === 'penalty' ||
      ruleId === 'builder-penalty' ||
      ruleId === 'builder-cancellation' ||
      ruleId === 'buyer-cancellation'
        ? false
        : true,
    activeTab: rule.tabs[0]?.id ?? '',
    activeChip: rule.chips?.[0],
    values,
  };
}

export function createInitialLoanSettingsState(): LoanSettingsState {
  return {
    enabled: true,
    loanAmountMode: 'fixed',
    loanAmountSelectionMode: 'unselected',
    loanBankInterestEnabled: false,
    loanBankInterestRate: '',
    loanBankFeeBuyer: false,
    loanBankFeeSeller: false,
    loanBankFeeBankPolicyEnabled: true,
    loanBankFeeMode: 'fixed',
    loanBankFeeValue: '',
    loanParticipationBuyer: false,
    loanParticipationSeller: false,
    loanParticipationBankPolicyEnabled: true,
    loanParticipationRate: '',
    loanExpertBuyer: false,
    loanExpertSeller: false,
    loanExpertBankPolicyEnabled: true,
    loanExpertRate: '',
    loanPriorityBondBuyer: false,
    loanPriorityBondSeller: false,
    loanPriorityBondBankPolicyEnabled: true,
    loanPriorityBondRate: '',
    loanTiming: 'undated',
    loanReceivedDate: '',
    repaymentTiming: 'next-month',
    fixedAmount: '',
    percentAmount: '15',
    loanGracePeriod: '',
    selectedBank: 'ملت',
  };
}

export function normalizeRuleState(ruleId: ContractRuleId, payload: unknown): ContractRuleState {
  const initial = createInitialRuleState(ruleId);
  const rule = RULE_CONFIGS[ruleId];
  const input = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const valuesInput = input.values && typeof input.values === 'object' ? (input.values as Record<string, unknown>) : {};
  const values = { ...initial.values };

  rule.tabs.forEach((tab) => {
    tab.fields.forEach((field) => {
      const rawValue = valuesInput[field.key];
      if (field.type === 'switch') {
        values[field.key] = Boolean(rawValue);
      } else if (field.type === 'select') {
        values[field.key] = typeof rawValue === 'string' && field.options.includes(rawValue) ? rawValue : field.options[0] ?? '';
      } else {
        values[field.key] = typeof rawValue === 'string' ? rawValue : '';
      }
    });
  });

  if (ruleId === 'discount') {
    const extraDiscountKeys = [
      'discountConditionMaxDelayCount',
      'discountConditionGraceDays',
      'discountConditionDueBasis',
      'discountConditionSettlementTiming',
    ];
    extraDiscountKeys.forEach((key) => {
      const rawValue = valuesInput[key];
      values[key] = typeof rawValue === 'string' ? rawValue : '';
    });
    ['discountConditionKeepOnDelay', 'discountConditionPenaltyOnDiscount'].forEach((key) => {
      values[key] = Boolean(valuesInput[key]);
    });
  }

  const activeTab = typeof input.activeTab === 'string' && rule.tabs.some((tab) => tab.id === input.activeTab) ? input.activeTab : initial.activeTab;
  const activeChip =
    rule.chips && typeof input.activeChip === 'string' && rule.chips.includes(input.activeChip)
      ? input.activeChip
      : initial.activeChip;

  return {
    active: typeof input.active === 'boolean' ? input.active : initial.active,
    activeTab,
    activeChip,
    values,
  };
}

export function normalizeLoanSettingsState(payload: unknown): LoanSettingsState {
  const initial = createInitialLoanSettingsState();
  const input = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const inferredLoanAmountSelectionMode =
    input.loanAmountSelectionMode === 'fixed' || input.loanAmountSelectionMode === 'contract-time'
      ? input.loanAmountSelectionMode
      : typeof input.fixedAmount === 'string' && input.fixedAmount.trim()
        ? 'fixed'
        : input.loanAmountMode === 'percent'
          ? 'contract-time'
          : 'unselected';

  return {
    enabled: typeof input.enabled === 'boolean' ? input.enabled : initial.enabled,
    loanAmountMode: input.loanAmountMode === 'percent' ? 'percent' : 'fixed',
    loanAmountSelectionMode: inferredLoanAmountSelectionMode,
    loanBankInterestEnabled: typeof input.loanBankInterestEnabled === 'boolean' ? input.loanBankInterestEnabled : initial.loanBankInterestEnabled,
    loanBankInterestRate: typeof input.loanBankInterestRate === 'string' ? input.loanBankInterestRate : initial.loanBankInterestRate,
    loanBankFeeBuyer: typeof input.loanBankFeeBuyer === 'boolean' ? input.loanBankFeeBuyer : initial.loanBankFeeBuyer,
    loanBankFeeSeller: typeof input.loanBankFeeSeller === 'boolean' ? input.loanBankFeeSeller : initial.loanBankFeeSeller,
    loanBankFeeBankPolicyEnabled:
      typeof input.loanBankFeeBankPolicyEnabled === 'boolean' ? input.loanBankFeeBankPolicyEnabled : initial.loanBankFeeBankPolicyEnabled,
    loanBankFeeMode:
      input.loanBankFeeMode === 'percent' || input.loanBankFeeMode === 'combined' ? input.loanBankFeeMode : 'fixed',
    loanBankFeeValue: typeof input.loanBankFeeValue === 'string' ? input.loanBankFeeValue : initial.loanBankFeeValue,
    loanParticipationBuyer: typeof input.loanParticipationBuyer === 'boolean' ? input.loanParticipationBuyer : initial.loanParticipationBuyer,
    loanParticipationSeller: typeof input.loanParticipationSeller === 'boolean' ? input.loanParticipationSeller : initial.loanParticipationSeller,
    loanParticipationBankPolicyEnabled:
      typeof input.loanParticipationBankPolicyEnabled === 'boolean'
        ? input.loanParticipationBankPolicyEnabled
        : initial.loanParticipationBankPolicyEnabled,
    loanParticipationRate: typeof input.loanParticipationRate === 'string' ? input.loanParticipationRate : initial.loanParticipationRate,
    loanExpertBuyer: typeof input.loanExpertBuyer === 'boolean' ? input.loanExpertBuyer : initial.loanExpertBuyer,
    loanExpertSeller: typeof input.loanExpertSeller === 'boolean' ? input.loanExpertSeller : initial.loanExpertSeller,
    loanExpertBankPolicyEnabled:
      typeof input.loanExpertBankPolicyEnabled === 'boolean' ? input.loanExpertBankPolicyEnabled : initial.loanExpertBankPolicyEnabled,
    loanExpertRate: typeof input.loanExpertRate === 'string' ? input.loanExpertRate : initial.loanExpertRate,
    loanPriorityBondBuyer: typeof input.loanPriorityBondBuyer === 'boolean' ? input.loanPriorityBondBuyer : initial.loanPriorityBondBuyer,
    loanPriorityBondSeller: typeof input.loanPriorityBondSeller === 'boolean' ? input.loanPriorityBondSeller : initial.loanPriorityBondSeller,
    loanPriorityBondBankPolicyEnabled:
      typeof input.loanPriorityBondBankPolicyEnabled === 'boolean'
        ? input.loanPriorityBondBankPolicyEnabled
        : initial.loanPriorityBondBankPolicyEnabled,
    loanPriorityBondRate: typeof input.loanPriorityBondRate === 'string' ? input.loanPriorityBondRate : initial.loanPriorityBondRate,
    loanTiming:
      input.loanTiming === 'contract-date' ||
      input.loanTiming === 'before-contract' ||
      input.loanTiming === 'dated' ||
      input.loanTiming === 'undated'
        ? input.loanTiming
        : input.loanTiming === 'after-sign'
          ? 'contract-date'
          : input.loanTiming === 'before-sign'
            ? 'before-contract'
            : 'undated',
    loanReceivedDate: typeof input.loanReceivedDate === 'string' ? input.loanReceivedDate : initial.loanReceivedDate,
    repaymentTiming:
      input.repaymentTiming === 'after-two-months' || input.repaymentTiming === 'custom'
        ? input.repaymentTiming
        : 'next-month',
    fixedAmount: typeof input.fixedAmount === 'string' ? input.fixedAmount : initial.fixedAmount,
    percentAmount: typeof input.percentAmount === 'string' ? input.percentAmount : initial.percentAmount,
    loanGracePeriod: typeof input.loanGracePeriod === 'string' ? input.loanGracePeriod : initial.loanGracePeriod,
    selectedBank:
      typeof input.selectedBank === 'string' && BANKS.includes(input.selectedBank as (typeof BANKS)[number])
        ? input.selectedBank
        : initial.selectedBank,
  };
}
