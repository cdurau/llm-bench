import { Card } from '@/components/common/Card';

interface CategoryStatsProps {
  stats: Record<string, { completed: number; total: number }>;
}

export function CategoryStats({ stats }: CategoryStatsProps) {
  const categories = Object.entries(stats).sort((a, b) => (b[1] as { total: number }).total - (a[1] as { total: number }).total);
  
  if (categories.length === 0) {
    return (
      <Card title="Kategorien">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Noch keine Aktivitäten mit Kategorien
        </div>
      </Card>
    );
  }

  return (
    <Card title="Nach Kategorien">
      <div className="space-y-4">
        {categories.map(([category, { completed, total }]) => {
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          return (
            <div key={category} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{completed}/{total}</span>
                  <span className="text-gray-400 dark:text-gray-500">({percent}%)</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    percent === 100 
                      ? 'bg-green-500' 
                      : 'bg-blue-600 dark:bg-blue-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
