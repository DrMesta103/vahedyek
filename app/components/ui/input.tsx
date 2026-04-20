import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`app-control text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
