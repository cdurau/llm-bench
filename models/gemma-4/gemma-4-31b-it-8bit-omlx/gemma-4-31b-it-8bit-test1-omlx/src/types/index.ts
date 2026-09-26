export interface Activity {
  id: string;
  name: string;
  description?: string;
  category: string;
  dailyGoal?: number;
  createdAt: number;
}

export interface DailyStatus {
  [date: string]: {
    [activityId: string]: boolean;
  };
}

export interface AppData {
  version: number;
  activities: Activity[];
  dailyStatus: DailyStatus;
}
