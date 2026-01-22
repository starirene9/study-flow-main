export type SessionType = 'FOCUS' | 'WORKOUT';
export type SessionStatus = 'idle' | 'running' | 'paused' | 'stopped';

export type PrimaryColorTheme = 'blue' | 'red' | 'green' | 'purple' | 'orange';

export interface ColorThemeConfig {
  hue: number;
  saturation: number;
  lightness: number;
  name: string;
}

export const COLOR_THEMES: Record<PrimaryColorTheme, ColorThemeConfig> = {
  blue: { hue: 220, saturation: 70, lightness: 50, name: 'Blue' },
  red: { hue: 0, saturation: 75, lightness: 50, name: 'Red' },
  green: { hue: 142, saturation: 70, lightness: 45, name: 'Green' },
  purple: { hue: 270, saturation: 70, lightness: 50, name: 'Purple' },
  orange: { hue: 25, saturation: 95, lightness: 50, name: 'Orange' },
};

export interface UserSettings {
  focusMinutes: number;
  workoutMinutes: number;
  activeYoutubeUrl: string | null;
  primaryColorTheme?: PrimaryColorTheme;
  customFocusMessage?: string;
  soundEnabled?: boolean;
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
  isCompleted?: boolean; // true if session completed naturally, false if stopped manually
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

// 테스트 모드용 프리셋 (1분 단위 테스트)
export const FOCUS_PRESETS_TEST = [1, 5, 10, 15, 30] as const;
export const WORKOUT_PRESETS_TEST = [3, 5, 10, 15, 20] as const;

// 테스트 모드 확인 (환경 변수 또는 개발 모드)
export const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true' || import.meta.env.DEV;

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
  // 3 minute workouts (3 videos - Shorts)
  {
    title: '3 Min Quick Stretch',
    url: 'https://www.youtube.com/watch?v=4pKly2JojMw',
    isActive: false,
  },
  {
    title: '3 Min Desk Break',
    url: 'https://www.youtube.com/watch?v=g_tea8ZNk5A',
    isActive: false,
  },
  {
    title: '3 Min Energy Boost',
    url: 'https://www.youtube.com/watch?v=tAUf7aajBWE',
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
  // 25 minute workouts (3 videos)
  {
    title: '25 Min Full Body HIIT',
    url: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
    isActive: false,
  },
  {
    title: '25 Min Cardio Blast',
    url: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
    isActive: false,
  },
  {
    title: '25 Min Strength & Cardio',
    url: 'https://www.youtube.com/watch?v=UItWltVZZmE',
    isActive: false,
  },
  // 30 minute workouts (3 videos)
  {
    title: '30 Min Full Body Workout',
    url: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
    isActive: false,
  },
  {
    title: '30 Min HIIT Training',
    url: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
    isActive: false,
  },
  {
    title: '30 Min Cardio & Strength',
    url: 'https://www.youtube.com/watch?v=UItWltVZZmE',
    isActive: false,
  },
];
