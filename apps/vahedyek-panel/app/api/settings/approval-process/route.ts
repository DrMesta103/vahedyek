import { NextResponse } from 'next/server';

/**
 * Legacy tenant JSON approval config API — replaced by ApprovalWorkflow + Server Actions.
 * Kept as a stub so old clients fail loudly instead of writing stale data.
 */
export async function GET() {
  return NextResponse.json(
    {
      deprecated: true,
      message:
        'این API حذف شده است. فرایند تأیید از مسیر «تنظیمات کسب‌وکار → فرایند تأیید» و مدل ApprovalWorkflow مدیریت می‌شود.',
      config: {},
    },
    { status: 410 },
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      deprecated: true,
      message: 'ذخیرهٔ مسیر تأیید از طریق این endpoint پشتیبانی نمی‌شود. از صفحهٔ فرایند تأیید در پنل استفاده کنید.',
    },
    { status: 410 },
  );
}
