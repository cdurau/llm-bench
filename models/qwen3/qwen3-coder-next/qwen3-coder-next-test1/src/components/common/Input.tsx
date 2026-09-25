import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          className={`w-full px-3 py-2 border rounded-lg transition-colors bg-white dark:bg-slate-800
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500'
            } text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${className}`}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
