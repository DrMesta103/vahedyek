'use client';

import { useState } from 'react';
import { TaavCommunicationChannels } from '@repo/ui/taav/business';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const PROPS = [
  { name: 'channels', type: 'TaavCommunicationChannel[]', description: 'کانال‌های ارتباطی قابل نمایش' },
  { name: 'expandedId / defaultExpandedId', type: 'string', defaultValue: 'social', description: 'کانال بازشده' },
  { name: 'onExpandedChange', type: '(channelId) => void', description: 'رویداد باز و بسته شدن کانال' },
  { name: 'content / emptyText', type: 'ReactNode', description: 'محتوای کانال یا پیام حالت خالی' },
  { name: 'onBack / backLabel', type: 'function / string', description: 'دکمه‌ی بازگشت' },
  { name: 'disabled', type: 'boolean', description: 'وضعیت غیرفعال کامپوننت' },
];

const PRIMARY_CHANNEL = [{ id: 'mobile', label: 'شماره تلفن همراه' }];
const SOCIAL_CHANNEL = [{ id: 'social', label: 'شبکه‌های اجتماعی' }];
const GRID_CHANNELS = [
  { id: 'mobile', label: 'شماره تلفن‌های همراه' },
  { id: 'landline', label: 'تلفن ثابت' },
  { id: 'fax', label: 'شماره فکس' },
  { id: 'email', label: 'ایمیل' },
  { id: 'website', label: 'وبسایت' },
  { id: 'social', label: 'شبکه‌های اجتماعی' },
];

function ChannelPreview({ channels, initialExpandedId, withBack = false }: { channels: typeof GRID_CHANNELS; initialExpandedId?: string; withBack?: boolean }) {
  const [expandedId, setExpandedId] = useState(initialExpandedId);
  return <TaavCommunicationChannels themeMode="light" channels={channels} expandedId={expandedId} onExpandedChange={setExpandedId} onBack={withBack ? () => undefined : undefined} />;
}

export default function CommunicationChannelsPage() {
  return (
    <div dir="rtl" className="text-right">
      <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کسب‌وکار', href: '/business' }, { label: 'اطلاعات تماس' }]}>
        <DocPageHeader eyebrow="کامپوننت‌های کسب‌وکار" title="اطلاعات تماس" description="مدیریت اطلاعات تماس و راه‌های ارتباطی کسب‌وکار در قالبی راست‌چین." importCode={`import { TaavCommunicationChannels } from '@repo/ui/taav/business';`} />
        <DocSection title="کامپوننت اصلی">
          <DocPreview label="شماره تلفن همراه">
            <ChannelPreview channels={PRIMARY_CHANNEL} />
          </DocPreview>
        </DocSection>
        <DocSection title="توکن شبکه‌های اجتماعی">
          <DocPreview label="شبکه‌های اجتماعی">
            <ChannelPreview channels={SOCIAL_CHANNEL} initialExpandedId="social" />
          </DocPreview>
        </DocSection>
        <DocSection title="گریدبندی">
          <DocPreview label="همه راه‌های ارتباطی">
            <ChannelPreview channels={GRID_CHANNELS} initialExpandedId="social" withBack />
          </DocPreview>
        </DocSection>
        <DocSection title="ویژگی‌های کامپوننت"><DocPropsTable rows={PROPS} /></DocSection>
      </DocPageShell>
    </div>
  );
}
