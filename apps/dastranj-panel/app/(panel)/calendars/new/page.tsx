import { redirect } from 'next/navigation';

export default function NewCalendarPage() {
  redirect('/calendars?create=1');
}
