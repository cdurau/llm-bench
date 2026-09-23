import { Card } from '@/components/common/Card';

interface ProgressCardProps {
  completed: number;
  total: number;
  percent: number;
}

export function ProgressCard({ completed, total, percent }: ProgressCardProps) {
  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tagesfortschritt
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {completed} von {total} Aktivitäten erledigt
          </p>
        </div>
        
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {percent}%
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      
      {percent === 100 && total > 0 && (
        <p className="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Alle Aufgaben erledigt! 🎉
        </p>
      )}
    </Card>
  );
}
