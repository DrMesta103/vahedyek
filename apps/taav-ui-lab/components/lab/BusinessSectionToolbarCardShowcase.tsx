'use client';

import { TaavBusinessSectionToolbarCard } from '@repo/ui/taav/business';
import { SECTION_TOOLBAR_CARD_DEMO_ITEMS } from '@/lib/demo/business-section-toolbar-card-demo';

export function BusinessSectionToolbarCardGallery() {
  return (
    <div dir="rtl" className="grid gap-4">
      {SECTION_TOOLBAR_CARD_DEMO_ITEMS.map((item) => (
        <TaavBusinessSectionToolbarCard
          key={item.id}
          title={item.title}
          description={item.description}
          icon={item.icon}
          href="#"
          onArrowClick={() => undefined}
          search={{
            placeholder: item.placeholder,
            onChange: () => undefined,
          }}
          action={{
            label: item.actionLabel,
            onClick: () => undefined,
          }}
        />
      ))}
    </div>
  );
}
