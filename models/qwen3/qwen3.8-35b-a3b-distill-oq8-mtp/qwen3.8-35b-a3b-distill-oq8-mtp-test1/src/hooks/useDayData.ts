import { useMemo } from 'react';
import {
  getCompletionsForDate,
  getIsComplete,
  getToday,
  getYesterday,
  getTomorrow,
  getAllCategories,
  isFutureDate,
  markComplete,
} from '../lib/storage';
import type { AppData, CompletionRecord, Tab } from '../types';

interface UseDayDataOptions {
  selectedDate: string;
  selectedCategory: string | null;
  tab: Tab;
  onDateChange: (date: string) => void;
  onCategoryChange: (cat: string | null) => void;
  onTabChange: (tab: Tab) => void;
}

interface CategoryStat {
  name: string;
  total: number;
  done: number;
}

interface UseDayDataReturn {
  tab: Tab;
  setTab: (tab: Tab) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  completionRecord: CompletionRecord | undefined;
  isToday: boolean;
  isFuture: boolean;
  yesterday: string;
  tomorrow: string;
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  activities: { activity: AppData['activities'][number]; isComplete: boolean }[];
  categoryStats: CategoryStat[];
  stats: {
    completed: number;
    open: number;
    percentage: number;
  };
  toggleComplete: (activityId: string, completed: boolean) => AppData;
  deleteActivity: (activityId: string) => AppData;
}

export function useDayData(data: AppData, options: UseDayDataOptions): UseDayDataReturn {
  const { selectedDate, selectedCategory, tab } = options;

  const today = getToday();
  const yesterday = getYesterday(selectedDate);
  const tomorrow = getTomorrow(selectedDate);
  const isTodayFlag = selectedDate === today;
  const isFuture = isFutureDate(selectedDate);

  const completionRecord = useMemo(
    () => getCompletionsForDate(data, selectedDate),
    [data, selectedDate]
  );

  const categories = useMemo(() => getAllCategories(data), [data]);

  const activities = useMemo(() => {
    return data.activities
      .filter((a) => !selectedCategory || a.category === selectedCategory)
      .map((activity) => ({
        activity,
        isComplete: getIsComplete(data, selectedDate, activity.id),
      }));
  }, [data, selectedDate, selectedCategory]);

  const categoryStats = useMemo(() => {
    const result: Record<string, { total: number; done: number }> = {};
    for (const a of data.activities) {
      if (!result[a.category]) {
        result[a.category] = { total: 0, done: 0 };
      }
      const entry = result[a.category]!;
      entry.total++;
      if (getIsComplete(data, selectedDate, a.id)) {
        entry.done++;
      }
    }
    return Object.entries(result).map(([name, { total, done }]) => ({
      name,
      total,
      done,
    }));
  }, [data, selectedDate]);

  const stats = useMemo(() => {
    const completed = activities.filter((a) => a.isComplete).length;
    const total = activities.length;
    const open = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, open, percentage };
  }, [activities]);

  const toggleComplete = (activityId: string, completed: boolean): AppData => {
    return markComplete(data, selectedDate, activityId, completed);
  };

  const deleteActivity = (activityId: string): AppData => {
    return {
      ...data,
      activities: data.activities.filter((a) => a.id !== activityId),
      completions: data.completions.map((c) => {
        const newCompletions = { ...c.completions };
        delete newCompletions[activityId];
        return { ...c, completions: newCompletions };
      }).filter((c) => Object.keys(c.completions).length > 0),
    };
  };

  return {
    tab,
    setTab: options.onTabChange,
    selectedDate,
    setSelectedDate: options.onDateChange,
    completionRecord,
    isToday: isTodayFlag,
    isFuture,
    yesterday,
    tomorrow,
    categories,
    selectedCategory,
    setSelectedCategory: options.onCategoryChange,
    activities,
    categoryStats,
    stats,
    toggleComplete,
    deleteActivity,
  };
}
