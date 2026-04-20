
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
        className={`inline-flex min-h-[34px] items-center justify-end gap-1 rounded-full border-[0.5px] px-[13px] py-[6px] text-right text-[12px] transition-all sm:px-[13px] ${
          active
            ? 'border-[#292929] bg-[#a6e8ef] font-semibold text-[#123b69]'
            : 'border-[#292929] bg-white font-medium text-[#27415f] hover:bg-slate-50'
        }`}
      >
        {active ? <Check className="order-[-1] h-3 w-3 shrink-0 stroke-[2.75]" /> : null}
        <span>{title}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border-[0.5px] p-4 text-center transition-colors ${
        active
          ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
          : 'bg-gray-50 border-[#ededed] text-gray-600 hover:bg-gray-100'
      }`}
    >
      {title}
    </button>
  );
};
