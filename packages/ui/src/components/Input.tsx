import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  startAdornmentClassName?: string;
  endAdornmentClassName?: string;
  containerClassName?: string;
  startAdornmentWrapperClassName?: string;
  endAdornmentWrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      startAdornment,
      endAdornment,
      startAdornmentClassName = '',
      endAdornmentClassName = '',
      containerClassName = '',
      startAdornmentWrapperClassName = '',
      endAdornmentWrapperClassName = '',
      ...props
    },
    ref,
  ) => {
    const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true';
    const baseClassName = `h-10 w-full rounded-lg border bg-white px-3 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
      invalid
        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
    }`;
    const inputClassName = `${baseClassName} ${startAdornment ? 'pl-11' : ''} ${endAdornment ? 'pr-11' : ''} ${className}`;

    if (!startAdornment && !endAdornment) {
      return <input ref={ref} className={inputClassName} {...props} />;
    }

    return (
      <div className={`relative w-full ${containerClassName}`}>
        {startAdornment ? (
          <span
            className={`pointer-events-none absolute left-3 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center ${startAdornmentWrapperClassName} ${startAdornmentClassName}`}
          >
            {startAdornment}
          </span>
        ) : null}
        <input ref={ref} className={inputClassName} {...props} />
        {endAdornment ? (
          <span
            className={`pointer-events-none absolute right-3 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center ${endAdornmentWrapperClassName} ${endAdornmentClassName}`}
          >
            {endAdornment}
          </span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

