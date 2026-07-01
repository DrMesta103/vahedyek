import { ChevronLeft } from 'lucide-react';

export default function BottomPanel() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-400 to-green-500 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ChevronLeft className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-lg">6.6.88</span>
        </div>
        <button className="bg-white text-green-600 px-6 py-2 rounded-[8px] font-medium hover:bg-gray-50 transition-colors">
          بازگشت به بالا
        </button>
        <div className="text-white text-sm">
          نسخه جاری 6.6.88 آماده استفاده است
        </div>
      </div>
    </div>
  );
}

