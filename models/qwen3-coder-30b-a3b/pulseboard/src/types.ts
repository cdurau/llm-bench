export interface Activity {
  id: string;
  name: string;
  description?: string;
  category?: string;
  completed?: boolean;
}

export interface DateState {
  currentDate: string;
  selectedDate: string;
}