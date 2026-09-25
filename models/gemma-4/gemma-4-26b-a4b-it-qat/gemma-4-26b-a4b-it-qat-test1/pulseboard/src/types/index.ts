export type Category = string;

export interface Activity {
  id: string;
  name: string;
  description?: string;
  category: Category;
  targetValue?: number;
}

export interface DayStatus {
  completedActivityIds: string[];
  completedValues: Record<string, number>; // activityId -> value
}

export interface AppState {
  version: string;
  activities: Activity[];
  dailyStatuses: Record<string, DayStatus>; // date (YYYY-MM-DD) -> status
}
