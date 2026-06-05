import { Clock3, GitBranch, Hourglass, RefreshCw, Timer } from 'lucide-react';
import type { CalendarShiftType } from '../../../../../lib/calendar-shifts';

export const SHIFT_TYPE_CARDS: Array<{
  id: CalendarShiftType;
  label: string;
  icon: typeof Clock3;
  tone: 'green' | 'blue' | 'cyan' | 'amber' | 'purple';
  description: string;
  example: string;
}> = [
  {
    id: 'fixed',
    label: 'شیفت ثابت',
    icon: Clock3,
    tone: 'green',
    description: 'شیفت ثابت برای تیم‌هایی مناسب است که ساعت ورود و خروج مشخص و تکرارشونده دارند.',
    example: 'مثال: ۸:۰۰ تا ۱۶:۳۰',
  },
  {
    id: 'float-day',
    label: 'شیفت شناور شروع روز',
    icon: Hourglass,
    tone: 'blue',
    description: 'در این نوع شیفت، کارمند می‌تواند در یک بازه مشخص وارد شود، اما باید مدت کار موظف را کامل کند. ساعت خروج بر اساس زمان ورود واقعی محاسبه می‌شود.',
    example: 'مثال: بازه ورود ۷:۰۰ تا ۹:۰۰، مدت کار موظف ۸ ساعت و ورود ۸:۳۰ با خروج ۱۶:۳۰.',
  },
  {
    id: 'float-abs',
    label: 'شیفت شناور مطلق',
    icon: Timer,
    tone: 'cyan',
    description: 'برای تیم‌هایی که فقط مجموع زمان کار روزانه اهمیت دارد.',
    example: '',
  },
  {
    id: 'split',
    label: 'شیفت دو تکه',
    icon: GitBranch,
    tone: 'amber',
    description: 'وقتی ساعت کاری در دو بازه جدا از هم انجام می‌شود.',
    example: '',
  },
  {
    id: 'rotate',
    label: 'شیفت چرخشی',
    icon: RefreshCw,
    tone: 'purple',
    description: 'برای مجموعه‌هایی که الگوی شیفت بین افراد یا روزها جابه‌جا می‌شود.',
    example: '',
  },
];
