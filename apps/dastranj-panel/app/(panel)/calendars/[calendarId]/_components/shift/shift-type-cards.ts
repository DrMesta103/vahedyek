import { Clock3, GitBranch, Hourglass, RefreshCw, Timer } from 'lucide-react';
import type { CalendarShiftType } from '../../../../../lib/calendar-shifts';

export const SHIFT_TYPE_CARDS: Array<{
  id: CalendarShiftType;
  label: string;
  icon: typeof Clock3;
  tone: 'green' | 'blue' | 'cyan' | 'amber' | 'purple';
  description: string;
  example: string;
  tooltip: string;
}> = [
  {
    id: 'fixed',
    label: 'شیفت ثابت',
    icon: Clock3,
    tone: 'green',
    description: 'برای تیم‌هایی که ساعت شروع و پایان مشخص و تکرارشونده دارند.',
    example: 'مانند ساعت ۸:۰۰ تا ۱۶:۳۰',
    tooltip: 'برای زمانی که ورود و خروج کارکنان در ساعت مشخص انجام می‌شود.',
  },
  {
    id: 'float-day',
    label: 'شیفت شناور شروع روز',
    icon: Hourglass,
    tone: 'blue',
    description: 'کارمند در یک بازه مشخص وارد می‌شود و باید مدت معینی کار کند.',
    example: 'ورود بین ۷:۰۰ تا ۹:۰۰ و تکمیل ۸ ساعت کار',
    tooltip: 'برای زمانی که کارمند می‌تواند در یک بازه وارد شود، اما باید مدت مشخصی کار کند.',
  },
  {
    id: 'float-abs',
    label: 'شیفت شناور مطلق',
    icon: Timer,
    tone: 'cyan',
    description: 'ساعت شروع و پایان ثابت ندارد و مجموع زمان کار روزانه ملاک است.',
    example: '',
    tooltip: 'برای زمانی که ساعت ورود و خروج مهم نیست و فقط مجموع کارکرد روزانه محاسبه می‌شود.',
  },
  {
    id: 'split',
    label: 'شیفت دو تکه',
    icon: GitBranch,
    tone: 'amber',
    description: 'کار در دو بازه زمانی مستقل انجام می‌شود.',
    example: '۸:۰۰ تا ۱۲:۰۰ و ۱۶:۰۰ تا ۲۰:۰۰',
    tooltip: 'برای کسب‌وکارهایی که یک روز کاری را در دو نوبت جداگانه مدیریت می‌کنند و فاصله بین نوبت‌ها را نباید به‌عنوان استراحت ثابت در نظر گرفت.',
  },
  {
    id: 'rotate',
    label: 'شیفت چرخشی',
    icon: RefreshCw,
    tone: 'purple',
    description: 'برای الگوهایی که شیفت بین روزها یا افراد جابه‌جا می‌شود.',
    example: '',
    tooltip: 'در دست توسعه و خارج از این فاز.',
  },
];
