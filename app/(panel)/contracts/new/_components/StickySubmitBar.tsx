import React from 'react';

interface StickySubmitBarProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loadingLabel?: string;
}

export const StickySubmitBar: React.FC<StickySubmitBarProps> = ({
  label,
  onClick,
  disabled = false,
  loadingLabel,
}) => {
  return (
    <div className="sticky bottom-0 -mx-8 -mb-8 mt-8 bg-white/80 backdrop-blur-sm">
      <div className="flex justify-end border-t p-4">
        <button
          onClick={onClick}
          disabled={disabled}
          className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {disabled && loadingLabel ? loadingLabel : label}
        </button>
      </div>
    </div>
  );
};
