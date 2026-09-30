import { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        w-full px-4 py-2.5
        bg-white border border-gray-300
        rounded-lg
        text-gray-900 placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
      {...props}
    />
  );
}

export function Label({ children, className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label 
      className={`
        block text-sm font-medium text-gray-700 mb-2
        ${className}
      `}
      {...props}
    >
      {children}
    </label>
  );
}
