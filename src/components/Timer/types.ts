export interface TimeEntry {
  id: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  project?: string;
  tags?: string[];
  color?: string;
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  totalDuration: number;
  entries: TimeEntry[];
}

export interface TimerState {
  isRunning: boolean;
  currentDescription: string;
  startTime?: Date;
  elapsedTime: number;
}

export type ViewMode = "calendar" | "list" | "timesheet";

export interface Goal {
  id: string;
  title: string;
  target: number; // in hours
  current: number; // in hours
}

export interface Favorite {
  id: string;
  description: string;
  project?: string;
  tags?: string[];
}
