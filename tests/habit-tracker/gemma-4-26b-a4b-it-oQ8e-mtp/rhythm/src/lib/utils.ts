import type { HabitLog } from './db';

export function calculateStreaks(habitId: string, logs: HabitLog[]): { current: number; longest: number } {
  const habitLogs = logs
    .filter(log => log.habitId === habitId)
    .map(log => log.date)
    .sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

  return calculateStreaksRefined(habitLogs);
}

function calculateStreaksRefined(sortedDates: string[]): { current: number; longest: number } {
  if (sortedDates.length === 0) return { current: 0, longest: 0 };

  let longest = 0;
  let current = 0;
  
  // Group consecutive dates
  let groups: string[][] = [];
  let currentGroup: string[] = [sortedDates[0]];

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i-1]);
    const curr = new Date(sortedDates[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      currentGroup.push(sortedDates[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [sortedDates[i]];
    }
  }
  groups.push(currentGroup);

  // Longest streak
  longest = Math.max(...groups.map(g => g.length));

  // Current streak
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const latestLog = sortedDates[0];
  if (latestLog === today || latestLog === yesterday) {
    // The first group in our sorted (descending) list is the most recent one
    current = groups[0].length;
  } else {
    current = 0;
  }

  return { current, longest };
}
