import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => {
  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true';
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-lg border bg-white px-3 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
        invalid ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
      } ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

