
import React from 'react';

interface FormBoxProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const FormBox: React.FC<FormBoxProps> = ({ title, description, children }) => {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 mb-4">{description}</p>
      <div>{children}</div>
    </div>
  );
};
