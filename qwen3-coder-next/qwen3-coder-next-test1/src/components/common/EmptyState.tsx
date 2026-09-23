import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 p-4 bg-gray-100 dark:bg-slate-700 rounded-full">
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <div className="flex gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
