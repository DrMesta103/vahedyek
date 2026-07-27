export type AiLabTooltipDef = {
  text: string;
  example?: string;
};

export const AI_LAB_TOOLTIPS = {
  nav: {
    home: {
      text: 'داشبورد فضای کاری فعال؛ خلاصه مصرف توکن و منوی چرخشی دسترسی سریع.',
      example: 'ورود به tenant «بازرگانی فراتک» و مشاهده orbit menu',
    },
    'ai-tools': {
      text: 'کاتالوگ ابزارهای هوش مصنوعی tenant؛ در فاز ۱ OCR فعال است.',
      example: 'OCR / Document AI برای استخراج فاکتور',
    },
    ocr: {
      text: 'شبیه‌ساز OCR برای ثبت سند، مشاهده job و خروجی ساختارمند.',
      example: 'آپلود فاکتور فروش و استخراج مبلغ و تاریخ',
    },
    products: {
      text: 'محصولات AI تاو که روی این tenant فعال شده‌اند.',
      example: 'تاویا برای چت‌بات پشتیبانی برند',
    },
    businesses: {
      text: 'فهرست tenantهای شما؛ هر فضای کاری جداست و برای هر سناریو به‌صورت مستقل استفاده می‌شود.',
      example: 'انتخاب «آزمایشگاه نام و نام خانوادگی خریدار» از بین کسب‌وکارهای شما',
    },
    'businesses-new': {
      text: 'ایجاد tenant جدید با نام، لوگو و سقف توکن.',
      example: 'tenant «آزمایشگاه OCR» با ۲۵۰٬۰۰۰ توکن',
    },
    settings: {
      text: 'تنظیمات سراسری پلتفرم؛ قیمت مدل‌ها و نرخ دلار.',
      example: 'تغییر قیمت GPT-4.5 به ازای هر ۱۰۰ توکن',
    },
  },
  shell: {
    logout: {
      text: 'خروج از حساب و پاک‌کردن session فعلی.',
      example: 'بازگشت به صفحه ورود /login',
    },
    tenantSwitch: {
      text: 'تغییر tenant فعال و بازگشت به فهرست کسب‌وکارها.',
      example: 'جابه‌جایی از tenant A به tenant B',
    },
    phaseBadge: {
      text: 'فاز ۱ آزمایشگاه؛ AI/OCR شبیه‌سازی‌شده و داده در PostgreSQL ذخیره می‌شود.',
      example: 'Admin Agent با پاسخ rule-based فارسی',
    },
  },
  businesses: {
    pageTitle: {
      text: 'این بخش برای ساخت و آزمایش کسب‌وکارهای نمونه است؛ سناریوهای مختلف بر پایه tenantهای جداگانه در همین‌جا آماده می‌شوند.',
      example: 'ساخت چند tenant برای تست سناریوهای متفاوت',
    },
    addNew: {
      text: 'tenant جدید با مالکیت شما ایجاد می‌کند.',
      example: 'ایجاد «فروشگاه آنلاین X»',
    },
    statusActive: {
      text: 'مصرف توکن زیر سقف است و tenant قابل استفاده است.',
      example: '۱۵٪ از ۲۵۰٬۰۰۰ توکن مصرف شده',
    },
    statusWarning: {
      text: 'مصرف توکن نزدیک سقف است؛ تست‌های جدید ممکن است محدود شوند.',
      example: '۷۲٪ سقف مصرف شده',
    },
    statusExpired: {
      text: 'سقف توکن تمام شده؛ برای ادامه تست باید سقف افزایش یابد.',
      example: '۲۵۰٬۰۰۰ از ۲۵۰٬۰۰۰ توکن',
    },
    packageName: {
      text: 'نام بسته اشتراک tenant (شبیه‌سازی).',
      example: 'starter · ماهانه',
    },
    tokenLimit: {
      text: 'حداکثر توکن قابل مصرف در این tenant.',
      example: '۲۵۰٬۰۰۰ توکن',
    },
    ocrTests: {
      text: 'تعداد jobهای OCR ثبت‌شده برای این tenant.',
      example: '۱۲ تست OCR',
    },
    usageMeter: {
      text: 'نسبت توکن مصرف‌شده به سقف؛ رنگ بر اساس وضعیت تغییر می‌کند.',
      example: '۴۵٬۰۰۰ / ۲۵۰٬۰۰۰ (۱۸٪)',
    },
    lastActivity: {
      text: 'آخرین تعامل با این tenant.',
      example: '۲ ساعت پیش · job OCR جدید',
    },
  },
  workspace: {
    tokenLimit: {
      text: 'بودجه توکن اختصاص‌یافته به tenant برای تست AI.',
      example: '۲۵۰٬۰۰۰ توکن برای کل فضای کاری',
    },
    usedTokens: {
      text: 'مجموع توکن مصرف‌شده در OCR و سایر ابزارها (شبیه‌سازی).',
      example: '۱۸٬۴۰۰ توکن پس از ۵ job OCR',
    },
    ocrTests: {
      text: 'تعداد اجراهای OCR ثبت‌شده.',
      example: '۸ job در تاریخچه OCR',
    },
    lastActivity: {
      text: 'آخرین رویداد در این workspace.',
      example: 'ایجاد برند تاویا · ۱ روز پیش',
    },
  },
  auth: {
    identifier: {
      text: 'ایمیل یا موبایل ایران (۱۰ رقم بدون صفر اول) برای ورود.',
      example: 'admin@local.dev یا 9123456789',
    },
    password: {
      text: 'رمز عبور حساب؛ حداقل ۶ کاراکتر در ثبت‌نام.',
      example: '123456 (کاربر seed)',
    },
    firstName: {
      text: 'نام کوچک برای نمایش در sidebar.',
      example: 'علی',
    },
    lastName: {
      text: 'نام خانوادگی برای پروفایل.',
      example: 'محمدی',
    },
    mobile: {
      text: 'وقتی با ایمیل ثبت‌نام می‌کنید، موبایل جداگانه الزامی است.',
      example: '9352720114',
    },
    adminUsername: {
      text: 'نام کاربری gate مدیر برای ویرایش تنظیمات سراسری.',
      example: 'admin',
    },
    adminPassword: {
      text: 'رمز gate مدیر؛ دسترسی write موقت فعال می‌شود.',
      example: '123456 (پس از db:seed)',
    },
  },
  forms: {
    businessName: {
      text: 'نام نمایشی tenant در لیست و sidebar.',
      example: 'بازرگانی فراتک',
    },
    businessLogo: {
      text: 'تصویر لوگو؛ PNG/JPG/WEBP/SVG تا ۵ مگابایت.',
      example: 'logo.png ۲۴۰×۲۴۰',
    },
    tokenLimit: {
      text: 'سقف کل توکن tenant از زمان ایجاد.',
      example: '250000',
    },
    brandName: {
      text: 'نام برند در محصول تاویا؛ هر برند یک Admin Agent دارد.',
      example: 'برند پوشاک «آریا»',
    },
    ocrSourceTitle: {
      text: 'عنوان دلخواه برای کار در تاریخچه نویسه‌خوانی.',
      example: 'فاکتور فروش تیر ۱۴۰۴',
    },
    ocrUpload: {
      text: 'فایل واقعی جایگزین نمونه؛ متن txt/md/json برای شبیه‌سازی بهتر.',
      example: 'فاکتور.txt حداکثر ۲۰ مگابایت',
    },
    usdRate: {
      text: 'هر ۱ دلار معادل چند تومان؛ در محاسبه هزینه توکن.',
      example: '920000 تومان',
    },
  },
  ocr: {
    hubTitle: {
      text: 'مرکز نویسه‌خوانی این فضای کاری؛ گزارش اجراها و تاریخچه کارها.',
      example: 'مشاهده ۱۵ کار و میانگین دقت ۸۷٪',
    },
    statTotal: {
      text: 'تعداد کل کارهای نویسه‌خوانی ثبت‌شده.',
      example: '۱۵ اجرا',
    },
    statCompleted: {
      text: 'کارهای با وضعیت تکمیل‌شده.',
      example: '۱۲ تکمیل · ۲ در حال پردازش',
    },
    statProcessing: {
      text: 'کارهای در صف یا در حال شبیه‌سازی.',
      example: '۱ کار · به‌روزرسانی هر ۹۰۰ میلی‌ثانیه',
    },
    statAvgConfidence: {
      text: 'میانگین سطح اطمینان خروجی کارهای تکمیل‌شده.',
      example: '۸۷٪',
    },
    statTokens: {
      text: 'مجموع توکن مصرف‌شده در همه کارها.',
      example: '۴۲٬۰۰۰ توکن',
    },
    statFailed: {
      text: 'کارهای ناموفق یا سناریوی عدم تشخیص.',
      example: '۱ کار · تشخیص ندهد',
    },
    laneQuick: {
      text: 'نمونه‌های تک‌صفحه‌ای برای تست سریع رابط.',
      example: 'فاکتور، کارت ملی، رسید',
    },
    laneLong: {
      text: 'سند چندصفحه‌ای با پردازش طولانی‌تر شبیه‌سازی.',
      example: 'قرارداد واحد · ۸ صفحه',
    },
    templatePreview: {
      text: 'ساختار ورودی و خروجی قالب هوش مصنوعی اسناد.',
      example: 'فیلدها و قواعد اعتبارسنجی فاکتور',
    },
    contractDialog: {
      text: 'قرارداد ارتباط Domain Backend (.NET) با Document AI (Python) برای نوع سند انتخاب‌شده.',
      example: 'درخواست sync · پاسخ structured · REST یا gRPC',
    },
    contractTransportRest: {
      text: 'درخواست/پاسخ JSON بین .NET و Python از مسیر POST /api/v1/documents/extract/sync.',
      example: 'tenant_id · file.download_url · extraction.schema',
    },
    contractTransportGrpcStream: {
      text: 'RPC ExtractDocumentStream — رویدادهای ExtractDocumentStreamResponse از Python به .NET.',
      example: 'event_type · progress_percent · final_response',
    },
    contractTransportGrpcUnary: {
      text: 'RPC ExtractDocument — یک ExtractDocumentResponse کامل از Python به .NET.',
      example: 'ExtractDocumentRequest → ExtractDocumentResponse',
    },
    scenarioRecognize: {
      text: 'شبیه‌سازی تشخیص موفق کارت ملی.',
      example: 'سطح اطمینان بالا · فیلدهای پر',
    },
    scenarioMiss: {
      text: 'شبیه‌سازی عدم تشخیص یا سطح اطمینان پایین.',
      example: 'هشدار نیاز به بازبینی',
    },
    jobProgress: {
      text: 'پیشرفت شبیه‌سازی پردازش کار.',
      example: 'در صف ← در حال پردازش ← تکمیل شده',
    },
    jobConfidence: {
      text: 'درصد اطمینان مدل به استخراج.',
      example: '۸۴٪',
    },
    jobPages: {
      text: 'تعداد صفحات پردازش‌شده.',
      example: '۳ صفحه',
    },
    jobTokens: {
      text: 'توکن مصرفی این کار.',
      example: '۲٬۶۰۰ توکن',
    },
    extractedPreview: {
      text: 'متن خام استخراج‌شده از سند.',
      example: 'خطوط نویسه‌خوانی از فاکتور',
    },
    extractedJson: {
      text: 'خروجی ساختاریافته هوش مصنوعی اسناد.',
      example: 'فیلدها · وضعیت کلی · اعتبارسنجی',
    },
    extractedFields: {
      text: 'فیلدهای کلید-مقدار همراه سطح اطمینان هر فیلد.',
      example: 'شماره فاکتور: ۱۰۴۸',
    },
    badgeOcr: {
      text: 'نشانگر ابزار نویسه‌خوانی هوشمند در این فضای کاری.',
      example: 'شبیه‌سازی استخراج ساختارمند',
    },
    newTest: {
      text: 'شروع ویزارد ثبت کار جدید نویسه‌خوانی.',
      example: 'انتخاب فاکتور · آپلود فایل · اجرا',
    },
    historySection: {
      text: 'فهرست کارهای ثبت‌شده؛ برای جزئیات کلیک کنید.',
      example: 'فاکتور تیر · ۸۷٪ · ۲۶۰۰ توکن',
    },
    historyStatus: {
      text: 'چرخه حیات کار: صف، پردازش، تکمیل یا خطا.',
      example: 'در حال پردازش ← تکمیل شده',
    },
    backToHistory: {
      text: 'بازگشت به فهرست کارها و گزارشات.',
      example: 'صفحه تاریخچه نویسه‌خوانی',
    },
    sourceSample: {
      text: 'کار از نمونه آماده ساخته شده، بدون آپلود فایل.',
      example: 'نمونه فاکتور · مسیر سریع',
    },
    sourceUpload: {
      text: 'کار از فایل آپلودشده کاربر ساخته شده.',
      example: 'فاکتور.txt آپلود شده',
    },
    scenarioBadge: {
      text: 'سناریوی شبیه‌سازی برای کارت ملی.',
      example: 'تشخیص بدهد / تشخیص ندهد',
    },
    overallStatus: {
      text: 'وضعیت کلی خروجی هوش مصنوعی اسناد.',
      example: 'تکمیل · نیاز به بازبینی',
    },
    documentChip: {
      text: 'نوع سند از کتابخانه نمونه‌ها.',
      example: 'فاکتور فروش · کارت ملی',
    },
    templateSelected: {
      text: 'قالب فعال برای استخراج فیلدها.',
      example: 'قالب فاکتور · نسخه ۱',
    },
    laneTabQuick: {
      text: 'تب مسیر سریع؛ نمونه‌های تک‌صفحه‌ای.',
      example: 'فاکتور · کارت ملی · رسید',
    },
    laneTabLong: {
      text: 'تب مسیر زمان‌بر؛ سند چندصفحه‌ای.',
      example: 'قرارداد ۸ صفحه',
    },
    removeFile: {
      text: 'حذف فایل آپلود شده و بازگشت به نمونه.',
      example: 'پاک کردن فاکتور.pdf',
    },
    selectFile: {
      text: 'انتخاب فایل از سیستم.',
      example: 'مرور · پی‌دی‌اف یا متن',
    },
    dropzone: {
      text: 'رها کردن فایل یا کلیک برای انتخاب.',
      example: 'رها کردن فایل در این ناحیه',
    },
    stickyBar: {
      text: 'نوار ثابت پایین برای جابه‌جایی بین مراحل ویزارد.',
      example: 'مرحله ۲ از ۳ · منبع و عنوان',
    },
    emptyState: {
      text: 'هنوز کاری ثبت نشده؛ اولین تست را شروع کنید.',
      example: 'ثبت نویسه‌خوانی ← مشاهده تاریخچه',
    },
    processingPlaceholder: {
      text: 'خروجی کامل پس از اتمام پردازش نمایش داده می‌شود.',
      example: 'به‌روزرسانی هر ۹۰۰ میلی‌ثانیه',
    },
    warningPanel: {
      text: 'هشدارهای شبیه‌سازی که نیاز به بررسی دارند.',
      example: 'سطح اطمینان پایین · نیاز به بازبینی',
    },
    jsonInputTab: {
      text: 'ساختار ورودی قالب هوش مصنوعی اسناد.',
      example: 'فیلدها · قواعد اعتبارسنجی',
    },
    jsonOutputTab: {
      text: 'خروجی ساختاریافته شبیه‌سازی‌شده.',
      example: 'وضعیت کلی · سطح اطمینان',
    },
    copyJson: {
      text: 'کپی ساختار داده به حافظه.',
      example: 'برای استفاده در ویرایشگر',
    },
    templatePrompt: {
      text: 'دستورالعمل ارسالی به مدل نویسه‌خوانی.',
      example: 'استخراج فیلدهای فاکتور فروش',
    },
    fieldConfidence: {
      text: 'درصد اطمینان استخراج هر فیلد.',
      example: '۹۲٪ برای شماره فاکتور',
    },
    fieldNormalized: {
      text: 'مقدار نرمال‌شده فیلد پس از پردازش.',
      example: '۱۴۰۴/۰۳/۱۵ ← ۲۰۲۵-۰۶-۰۵',
    },
    wizardRegister: {
      text: 'ویزارد سه‌مرحله‌ای ثبت نویسه‌خوانی.',
      example: 'نوع سند ← منبع ← بررسی',
    },
    scenarioPanel: {
      text: 'انتخاب رفتار هوش مصنوعی برای کارت ملی آپلود شده.',
      example: 'عدم تشخیص در برابر تشخیص موفق',
    },
    jobDetailMeta: {
      text: 'برچسب‌های خلاصه منبع، قالب، سناریو و وضعیت خروجی.',
      example: 'نمونه · قرارداد واحد · تکمیل',
    },
    historyRow: {
      text: 'خلاصه هر کار: منبع، وضعیت، دقت و توکن.',
      example: 'آپلود · ۹۵٪ · ۵۱۰۰ توکن',
    },
  },
  products: {
    taavia: {
      text: 'چت‌بات پشتیبانی برند با Admin Agent و نالج‌بیس.',
      example: 'Agent راه‌اندازی FAQ برند',
    },
    unit1: {
      text: 'محصول بعدی؛ اتصال OCR به جریان عملیاتی.',
      example: 'خروجی OCR → قرارداد واحد',
    },
    future: {
      text: 'محصولات در roadmap بعدی آزمایشگاه.',
      example: 'تحلیل گزارش، agent عملیاتی',
    },
    brands: {
      text: 'مدیریت برندها و ورود به Admin Agent.',
      example: 'برند «آریا» → چت راه‌اندازی',
    },
    reports: {
      text: 'گزارش عملکرد چت‌بات (placeholder).',
      example: 'نرخ پاسخ‌گویی · رضایت کاربر',
    },
    operators: {
      text: 'هم‌افزایی اپراتور انسانی با bot (placeholder).',
      example: 'ارجاع مکالمه به اپراتور',
    },
  },
  aiTools: {
    ocr: {
      text: 'ورود به شبیه‌ساز OCR؛ ثبت سند و مشاهده نتیجه.',
      example: 'تست فاکتور نمونه quick lane',
    },
    future: {
      text: 'ابزارهای بعدی: طبقه‌بندی، خلاصه‌سازی، agent.',
      example: 'طبقه‌بندی خودکار اسناد',
    },
  },
  taavia: {
    adminAgent: {
      text: 'گفتگو برای جمع‌آوری دانش برند؛ پاسخ‌ها فعلاً mock هستند.',
      example: '«ما فروشگاه پوشاک هستیم» → سوال FAQ',
    },
    chatGoal: {
      text: 'اهداف راه‌اندازی: معرفی برند، FAQ، نالج‌بیس.',
      example: 'لیست سوالات پرتکرار مشتریان',
    },
    simBadge: {
      text: 'پاسخ‌ها rule-based در Next.js؛ بدون LLM واقعی.',
      example: 'ذکر «قیمت» → درخواست جزئیات محصول',
    },
    messageInput: {
      text: 'Enter ارسال · Shift+Enter خط جدید.',
      example: '«ما در حوزه لوازم خانگی فعالیت می‌کنیم»',
    },
    modelSettingsPage: {
      text: 'برای هر کاربرد برند، یک ارائه‌دهنده و یک مدل انتخاب کنید. گزینه‌های پیشنهادی با برچسب «پیشنهادی» مشخص شده‌اند.',
      example: 'چت و پاسخ‌گویی → OpenAI → GPT-4.5',
    },
    modelProvider: {
      text: 'شرکتی که سرویس هوش مصنوعی را فراهم می‌کند؛ مثل OpenAI یا Gemini.',
      example: 'اگر OpenAI را انتخاب کنید، فقط مدل‌های همان حساب دیده می‌شوند.',
    },
    modelChoice: {
      text: 'نسخهٔ مشخصی از هوش مصنوعی که کار را انجام می‌دهد. مدل پیشنهادی معمولاً تعادل خوبی بین کیفیت و هزینه دارد.',
      example: 'GPT-4o OCR برای خواندن سند و تصویر',
    },
    purposeTextGeneration: {
      text: 'این مدل مثل «مغز متنی» برند شماست. سؤال مشتری را می‌خواند و جواب مناسب می‌نویسد.',
      example: 'مشتری می‌پرسد «ساعات کاری‌تان چیست؟» → چت‌بات جواب متنی می‌دهد.',
    },
    purposeSpeechToText: {
      text: 'اگر مشتری به‌جای تایپ، صدا بفرستد، این مدل صدا را به نوشته تبدیل می‌کند.',
      example: 'ویس مشتری: «قیمت این محصول چقدره؟» → سیستم آن را به متن تبدیل می‌کند.',
    },
    purposeTextToSpeech: {
      text: 'اگر بخواهید جواب چت‌بات با صدا پخش شود، این مدل متن را به گفتار تبدیل می‌کند.',
      example: 'متن «سفارش شما ثبت شد» → همان جمله با صدا برای مشتری پخش می‌شود.',
    },
    purposeDocumentExtraction: {
      text: 'این مدل متن و اطلاعات داخل عکس یا PDF را می‌خواند؛ مثل اینکه کسی سند را برایتان تایپ کند.',
      example: 'آپلود عکس کاتالوگ یا فاکتور → نام، قیمت و مشخصات استخراج می‌شود.',
    },
  },
  settings: {
    hub: {
      text: 'تنظیمات سراسری برای همه tenantها.',
      example: 'تغییر نرخ دلار ۹۲۰٬۰۰۰',
    },
    tokenPricing: {
      text: 'قیمت USD هر ۱۰۰ توکن برای مدل‌های OpenAI، Gemini و…',
      example: 'GPT-4.5 · $0.03 / 100 token',
    },
    usdRate: {
      text: 'نرخ تبدیل برای نمایش هزینه به تومان.',
      example: '۱۰۰۰ توکن ≈ ۲۷٬۶۰۰ تومان',
    },
    aiAccounts: {
      text: 'مدیریت اکانت‌های Provider و API Keyهای سراسری برای OCR، تاویا و سایر سرویس‌های AI.',
      example: 'OpenAI Main · $100 اعتبار · masked key',
    },
    aiAccountName: {
      text: 'نام نمایشی اکانت برای شناسایی در پنل ادمین.',
      example: 'OpenAI Main Account',
    },
    aiAccountProvider: {
      text: 'ارائه‌دهنده مدل یا سرویس هوش مصنوعی.',
      example: 'OpenAI، DeepSeek، Gemini',
    },
    aiAccountApiKey: {
      text: 'کلید دسترسی Provider؛ پس از ذخیره فقط masked نمایش داده می‌شود.',
      example: 'sk-••••••••••••ab12',
    },
    aiAccountPurchaseEmail: {
      text: 'ایمیلی که با آن اعتبار یا اشتراک Provider خریداری شده است.',
      example: 'billing@company.com',
    },
    aiAccountOrgId: {
      text: 'شناسه سازمان یا پروژه در Provider (اختیاری).',
      example: 'org_abc123',
    },
    aiAccountCredit: {
      text: 'اعتبار دلاری خریداری‌شده برای این اکانت.',
      example: '$100.00',
    },
    aiAccountInputTokenPrice: {
      text: 'هزینه دلاری به ازای هر ۱ توکن ورودی؛ مقادیر اعشاری کوچک پشتیبانی می‌شود.',
      example: '$0.00000015',
    },
    aiAccountOutputTokenPrice: {
      text: 'هزینه دلاری به ازای هر ۱ توکن خروجی؛ مقادیر اعشاری کوچک پشتیبانی می‌شود.',
      example: '$0.00000060',
    },
    aiAccountNotes: {
      text: 'یادداشت داخلی برای تیم ادمین.',
      example: 'اکانت production اصلی',
    },
    aiAccountStatus: {
      text: 'اکانت‌های غیرفعال در routing بعدی استفاده نمی‌شوند.',
      example: 'فعال / غیرفعال',
    },
    aiAccountModelsPage: {
      text: 'تعریف مدل‌ها، قیمت‌ها و قابلیت‌ها برای این اکانت Provider؛ پایه Document AI و strategy resolver.',
      example: 'GPT-4.1 Mini · Chat · $0.40 / 1M input',
    },
    aiModelDisplayName: {
      text: 'نام نمایشی مدل در پنل ادمین.',
      example: 'GPT-4.1 Mini',
    },
    aiModelProviderName: {
      text: 'شناسه دقیق مدل در Provider؛ باید در همان اکانت یکتا باشد.',
      example: 'gpt-4.1-mini',
    },
    aiModelType: {
      text: 'نوع کاربرد مدل؛ OCR و استخراج ساخت‌یافته بعداً در Document AI استفاده می‌شوند.',
      example: 'Chat، OCR، Vision',
    },
    aiModelPricingUnit: {
      text: 'واحد اصلی قیمت‌گذاری؛ در فاز ۲ فقط پیکربندی است و مصرف واقعی محاسبه نمی‌شود.',
      example: 'توکن، صفحه، درخواست',
    },
    aiModelInputPrice: {
      text: 'هزینه دلاری به ازای هر ۱ میلیون توکن ورودی.',
      example: '$0.40',
    },
    aiModelOutputPrice: {
      text: 'هزینه دلاری به ازای هر ۱ میلیون توکن خروجی.',
      example: '$1.60',
    },
    businesses: {
      text: 'فهرست سراسری همه کسب‌وکارهای پلتفرم با مالک، مصرف توکن و وضعیت.',
      example: 'جستجو بر اساس نام کسب‌وکار یا صاحب آن',
    },
    users: {
      text: 'فهرست سراسری همه کاربران در همه tenantها با امکان جستجو، فیلتر کسب‌وکار و ثبت کاربر جدید.',
      example: 'ساخت کاربر عضو کسب‌وکار یا کاربر سیستم تاو',
    },
    modelCount: {
      text: 'تعداد مدل‌های فعال در جدول قیمت.',
      example: '۱۲ مدل',
    },
    apiKeyCount: {
      text: 'کلیدهای API ثبت‌شده (masked در UI).',
      example: '۴ key · OpenAI production',
    },
    providerCount: {
      text: 'ارائه‌دهندگان مدل AI.',
      example: 'OpenAI، Google، xAI',
    },
    pricePer100: {
      text: 'هزینه USD به ازای هر ۱۰۰ توکن مدل.',
      example: '$0.015',
    },
    sim1000Tokens: {
      text: 'برآورد هزینه ۱۰۰۰ توکن با نرخ دلار فعلی.',
      example: '$0.15 ≈ ۱۳۸٬۰۰۰ تومان',
    },
    apiKeyReveal: {
      text: 'نمایش کامل key در UI.',
      example: 'sk-proj-…',
    },
  },
} as const satisfies Record<string, Record<string, AiLabTooltipDef>>;

export type AiLabTooltipKey = keyof typeof AI_LAB_TOOLTIPS;
