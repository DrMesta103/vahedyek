import type { AppendixTagKey, ContractAppendixTagDefinition } from '../types/contract';

export const CONTRACT_APPENDIX_TAG_GROUPS: Array<{
  key: ContractAppendixTagDefinition['groupKey'];
  title: string;
  helper: string;
  tags: ContractAppendixTagDefinition[];
}> = [
  {
    key: 'financial',
    title: 'انتخاب نوع الحاقیه های مالی',
    helper: 'در این بخش می‌توانید مشخص کنید که چه الحاقیه مالی را می‌خواهید به قرارداد خود اضافه کنید',
    tags: [
      { key: 'loan', groupKey: 'financial', title: 'وام', description: 'تغییر یا ثبت اطلاعات وام' },
      { key: 'adjustment', groupKey: 'financial', title: 'تعدیل', description: 'اعمال تعدیل در ارقام قرارداد' },
      {
        key: 'contract-base-costs',
        groupKey: 'financial',
        title: 'هزینه های اصل قرارداد',
        description: 'اصلاح ردیف مالی مبلغ اصل قرارداد',
      },
      { key: 'side-costs', groupKey: 'financial', title: 'هزینه های جانبی', description: 'افزودن یا اصلاح هزینه‌های جانبی' },
      { key: 'unit-delivery', groupKey: 'financial', title: 'تحویل واحد', description: 'تغییرات مالی مرتبط با تحویل واحد' },
      { key: 'forgiveness', groupKey: 'financial', title: 'بخشودگی', description: 'بخشودگی اقلام قرارداد' },
      { key: 'contract-costs', groupKey: 'financial', title: 'هزینه مربوط به قرارداد', description: 'هزینه‌های جدید مربوط به قرارداد' },
      { key: 'penalty-waiver', groupKey: 'financial', title: 'جرائم کارفرما', description: 'اصلاح جرائم یا وجه التزام' },
    ],
  },
  {
    key: 'conditions',
    title: 'انتخاب نوع الحاقیه های شرایط',
    helper: 'در این بخش می‌توانید مشخص کنید که چه الحاقیه شرطی را می‌خواهید به قرارداد خود اضافه کنید',
    tags: [
      { key: 'workshop-conditions', groupKey: 'conditions', title: 'شرایط ساخت', description: 'اصلاح شرایط ساخت و تعهدات پروژه' },
      { key: 'arbitration', groupKey: 'conditions', title: 'داوری', description: 'تغییر در بندهای داوری و حل اختلاف' },
    ],
  },
  {
    key: 'quality',
    title: 'تغییرات کیفی و مشخصات واحد',
    helper: 'در این بخش می‌توانید پرونده تغییر مصالح، مشخصات و نتایج قراردادی ناشی از آن را ثبت و پیگیری کنید.',
    tags: [
      {
        key: 'material-specs-change',
        groupKey: 'quality',
        title: 'تغییر مصالح و مشخصات',
        description: 'ثبت پرونده تغییر مصالح یا مشخصات واحد و فعال‌سازی نتیجه قراردادی بر اساس آن',
      },
    ],
  },
  {
    key: 'parties',
    title: 'طرفین',
    helper: 'در این بخش مشخص کنید الحاقیه برای اصلاح یا تکمیل اطلاعات کدام طرف قرارداد است.',
    tags: [
      { key: 'first-party', groupKey: 'parties', title: 'طرف اول', description: 'اصلاح اطلاعات یا تعهدات طرف اول' },
      { key: 'second-party', groupKey: 'parties', title: 'طرف دوم', description: 'اصلاح اطلاعات یا تعهدات طرف دوم' },
    ],
  },
  {
    key: 'dates',
    title: 'انتخاب نوع الحاقیه تاریخ',
    helper: 'در این بخش می‌توانید مشخص کنید که چه الحاقیه تاریخی را می‌خواهید به قرارداد خود اضافه کنید',
    tags: [
      { key: 'due-dates', groupKey: 'dates', title: 'تاریخ سررسید ها', description: 'تغییر در تاریخ سررسیدها' },
      { key: 'commitment-date', groupKey: 'dates', title: 'تاریخ وجه التزام', description: 'تغییر در تاریخ‌های وجه التزام' },
      { key: 'unit-delivery-date', groupKey: 'dates', title: 'تاریخ تحویل واحد', description: 'تغییر تاریخ تحویل واحد' },
    ],
  },
];

export const CONTRACT_APPENDIX_TAG_MAP = new Map<AppendixTagKey, ContractAppendixTagDefinition>(
  CONTRACT_APPENDIX_TAG_GROUPS.flatMap((group) => group.tags.map((tag) => [tag.key, tag] as const)),
);

export function getAppendixTagDefinition(tagKey: AppendixTagKey) {
  return CONTRACT_APPENDIX_TAG_MAP.get(tagKey) ?? null;
}

export function getAppendixTagTitle(tagKey: AppendixTagKey) {
  return getAppendixTagDefinition(tagKey)?.title ?? tagKey;
}
