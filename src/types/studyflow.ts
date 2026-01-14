export type SessionType = 'FOCUS' | 'WORKOUT';
export type SessionStatus = 'idle' | 'running' | 'paused' | 'stopped';

export interface UserSettings {
  focusMinutes: number;
  workoutMinutes: number;
  activeYoutubeUrl: string | null;
}

export interface YoutubeLink {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  createdAt: Date;
}

export interface SessionLog {
  id: string;
  sessionDate: string; // YYYY-MM-DD
  type: SessionType;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  youtubeUrl?: string;
}

export interface HourlyBucket {
  hour: number;
  focusMinutes: number;
  workoutMinutes: number;
  dominantType: 'FOCUS' | 'WORKOUT' | 'IDLE';
}

export interface DailySummary {
  date: string;
  totalFocusMinutes: number;
  totalWorkoutMinutes: number;
  completedCycles: number;
  isSuccess: boolean;
  hourlyBuckets: HourlyBucket[];
}

export const FOCUS_PRESETS = [30, 45, 60, 75, 90] as const;
export const WORKOUT_PRESETS = [10, 15, 20, 30] as const;

export const DEFAULT_YOUTUBE_LINKS: Omit<YoutubeLink, 'id' | 'createdAt'>[] = [
  {
    title: '5 Min Morning Stretch',
    url: 'https://www.youtube.com/watch?v=4pKly2JojMw',
    isActive: true,
  },
  {
    title: '7 Min Full Body Stretch',
    url: 'https://www.youtube.com/watch?v=g_tea8ZNk5A',
    isActive: false,
  },
  // 10 minute workouts (3 videos)
  {
    title: '10 Min Desk Stretch',
    url: 'https://www.youtube.com/watch?v=tAUf7aajBWE',
    isActive: false,
  },
  {
    title: '10 Min Standing Stretch',
    url: 'https://www.youtube.com/watch?v=L_xrDAtykMI',
    isActive: false,
  },
  {
    title: '10 Min Full Body Workout',
    url: 'https://www.youtube.com/watch?v=UItWltVZZmE',
    isActive: false,
  },
  {
    title: '12 Min Neck & Shoulder Relief',
    url: 'https://www.youtube.com/watch?v=SedzswEwpPw',
    isActive: false,
  },
  // 15 minute workouts (3 videos)
  {
    title: '15 Min Full Body Mobility',
    url: 'https://www.youtube.com/watch?v=Yzm3fA2HhkQ',
    isActive: false,
  },
  {
    title: '15 Min HIIT Workout',
    url: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
    isActive: false,
  },
  {
    title: '15 Min Yoga Flow',
    url: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
    isActive: false,
  },
  // 20 minute workouts (3 videos)
  {
    title: '20 Min Yoga Flow',
    url: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
    isActive: false,
  },
  {
    title: '20 Min Cardio Workout',
    url: 'https://www.youtube.com/watch?v=UItWltVZZmE',
    isActive: false,
  },
  {
    title: '20 Min Strength Training',
    url: 'https://www.youtube.com/watch?v=Yzm3fA2HhkQ',
    isActive: false,
  },
  {
    title: '30 Min Full Body Workout',
    url: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
    isActive: false,
  },
];
