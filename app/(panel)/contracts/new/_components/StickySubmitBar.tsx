
import React from 'react';

interface StickySubmitBarProps {
  label: string;
  onClick: () => void;
}

export const StickySubmitBar: React.FC<StickySubmitBarProps> = ({ label, onClick }) => {
  return (
    <div className="sticky bottom-0 -mx-8 -mb-8 mt-8 bg-white/80 backdrop-blur-sm">
        <div className="flex justify-end p-4 border-t">
            <button
                onClick={onClick}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700"
            >
                {label}
            </button>
        </div>
    </div>
  );
};
