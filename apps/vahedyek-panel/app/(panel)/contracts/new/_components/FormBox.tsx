import React from 'react';

interface FormBoxProps {
  title: string;
  description: string;
  children: React.ReactNode;
  invalid?: boolean;
}

export const FormBox: React.FC<FormBoxProps> = ({ title, description, children, invalid = false }) => {
  return (
    <div
      className={`rounded-xl border bg-white shadow-[0_8px_28px_rgba(15,23,42,0.04)] ${
        invalid ? 'border-rose-300' : 'border-slate-200'
      }`}
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-[15px] font-extrabold text-slate-900">{title}</p>
        <p className="mt-1 text-[13px] leading-6 text-slate-500">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

