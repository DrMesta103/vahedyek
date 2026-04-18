import { Home, Bell, Settings, Moon } from 'lucide-react';

interface HeaderProps {
  username: string;
}

export default function Header({ username }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Right side - User info */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">
            ع
          </div>
          <span className="text-gray-700 font-medium">علیشاپور بزر</span>
        </div>

        {/* Center - Navigation */}
        <div className="flex items-center gap-6">
          <button className="text-gray-600 hover:text-gray-900">
            جزئیات مجتمع
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            خانه
          </button>
        </div>

        {/* Left side - Icons */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full bg-teal-100">
            <Moon className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full bg-teal-100">
            <Home className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
}
