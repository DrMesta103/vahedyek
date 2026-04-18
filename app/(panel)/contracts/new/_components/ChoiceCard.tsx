
import React from 'react';

interface ChoiceCardProps {
  title: string;
  active: boolean;
  onClick: () => void;
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({ title, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-lg border text-center transition-colors ${
        active
          ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
      }`}
    >
      {title}
    </button>
  );
};
