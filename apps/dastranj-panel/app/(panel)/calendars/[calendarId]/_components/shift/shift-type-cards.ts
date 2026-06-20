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
    description: 'برای تیم‌هایی که ساعت ورود و خروج مشخص و یکسان دارند.',
    example: 'مثال: ۸:۰۰ تا ۱۶:۳۰',
    tooltip: 'برای زمانی که ورود و خروج کارکنان در ساعت مشخص انجام می‌شود.',
  },
  {
    id: 'float-day',
    label: 'شیفت شناور شروع روز',
    icon: Hourglass,
    tone: 'blue',
    description: 'ورود در بازه مجاز است و سپس مدت کار مشخص باید کامل شود.',
    example: 'مثال: بازه ورود ۷:۰۰ تا ۹:۰۰، مدت کار ۸ ساعت',
    tooltip: 'برای زمانی که کارمند می‌تواند در یک بازه وارد شود، اما باید مدت مشخصی کار کند.',
  },
  {
    id: 'float-abs',
    label: 'شیفت شناور مطلق',
    icon: Timer,
    tone: 'cyan',
    description: 'فقط مجموع کارکرد روزانه مهم است و ساعت شروع و پایان ثابت نیست.',
    example: 'مثال: ۶ ساعت کار در هر زمان از روز',
    tooltip: 'برای زمانی که ساعت ورود و خروج مهم نیست و فقط مجموع کارکرد روزانه محاسبه می‌شود.',
  },
  {
    id: 'split',
    label: 'شیفت دو تکه',
    icon: GitBranch,
    tone: 'amber',
    description: 'برای روزهایی که کار در دو بازه جدا انجام می‌شود؛ مثل صبح و عصر.',
    example: 'مثال: ۸ تا ۱۲ و ۱۶ تا ۲۰',
    tooltip: 'برای کسب‌وکارهایی که یک روز کاری را در دو نوبت جداگانه مدیریت می‌کنند و فاصله بین نوبت‌ها را نباید به‌عنوان استراحت ثابت در نظر گرفت.',
  },
  {
    id: 'rotate',
    label: 'شیفت چرخشی',
    icon: RefreshCw,
    tone: 'purple',
    description: 'برای الگوهایی که شیفت بین روزها یا افراد جابه‌جا می‌شود.',
    example: '',
    tooltip: 'پیشرفته و خارج از این فاز.',
  },
];
