import React from 'react';
import { Check } from 'lucide-react';

interface ChoiceCardProps {
  title: string;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | 'pill';
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({ title, active, onClick, variant = 'default' }) => {
  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex h-8 items-center gap-1.5 rounded-[8px] border px-3.5 text-[13px] font-medium transition-all ${
          active
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        {active ? <Check className="h-3 w-3 shrink-0 stroke-[2.5]" /> : null}
        {title}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[8px] border px-4 py-2.5 text-center text-[13px] font-medium transition-all ${
        active
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {title}
    </button>
  );
};

