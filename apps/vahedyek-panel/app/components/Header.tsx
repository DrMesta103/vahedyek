import { Home, Bell, Settings } from 'lucide-react';
import { ThemeToggle } from './theme/ThemeToggle';

interface HeaderProps {
  username: string;
}

export default function Header({ username }: HeaderProps) {
  void username;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-400 font-bold text-white">ع</div>
          <span className="font-medium text-gray-700">علیشاپور بزرگ</span>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-gray-600 hover:text-gray-900">خانه</button>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full p-2 hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
          <ThemeToggle collapsed />
          <button className="rounded-full p-2 hover:bg-gray-100">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
          <button className="rounded-full bg-teal-100 p-2 hover:bg-gray-100">
            <Home className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
}
