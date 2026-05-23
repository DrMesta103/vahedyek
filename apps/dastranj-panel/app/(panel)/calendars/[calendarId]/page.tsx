import { notFound } from 'next/navigation';
import { getCalendarDetails } from '../../../lib/data';
import { CalendarDetailsView } from './_components/CalendarDetailsView';

type CalendarDetailsPageProps = {
  params: Promise<{
    calendarId: string;
  }>;
  searchParams: Promise<{
    jy?: string;
    jm?: string;
  }>;
};

export default async function CalendarDetailsPage({ params, searchParams }: CalendarDetailsPageProps) {
  const { calendarId } = await params;
  const query = await searchParams;
  const viewYear = query.jy ? Number(query.jy) : undefined;
  const viewMonth = query.jm ? Number(query.jm) : undefined;

  const calendar = await getCalendarDetails(calendarId, {
    viewYear: Number.isFinite(viewYear) ? viewYear : undefined,
    viewMonth: Number.isFinite(viewMonth) ? viewMonth : undefined,
  });

  if (!calendar) {
    notFound();
  }

  return <CalendarDetailsView calendar={calendar} />;
}
