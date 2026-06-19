'use client';

import { DastRanjNavPath } from './DastRanjNavPathProvider';

type CalendarNavPathProps = {
  calendarTitle: string;
};

export function CalendarNavPath({ calendarTitle }: CalendarNavPathProps) {
  return (
    <DastRanjNavPath
      tail={[
        { label: 'جزئیات تقویم', id: 'calendar-details' },
        { label: calendarTitle, id: `calendar-${calendarTitle}` },
      ]}
    />
  );
}
