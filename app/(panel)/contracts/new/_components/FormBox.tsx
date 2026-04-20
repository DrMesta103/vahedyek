import React from 'react';

interface FormBoxProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const FormBox: React.FC<FormBoxProps> = ({ title, description, children }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">{title}</p>
        <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};
