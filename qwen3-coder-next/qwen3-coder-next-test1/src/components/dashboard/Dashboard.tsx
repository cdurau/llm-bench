import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ProgressCard } from './ProgressCard';
import { CategoryStats } from './CategoryStats';

export function Dashboard() {
  const { getCompletedCount, getTotalCount, getProgressPercent, getCategoryStats, appState } = useApp();
  
  const stats = useMemo(() => getCategoryStats(appState.currentViewDate), [appState.currentViewDate, getCategoryStats]);
  
  const completed = getCompletedCount();
  const total = getTotalCount();
  const percent = getProgressPercent();
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
      
      <ProgressCard completed={completed} total={total} percent={percent} />
      
      <CategoryStats stats={stats} />
    </div>
  );
}
