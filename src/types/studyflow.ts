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

export const FOCUS_PRESETS = [25, 30, 45, 60, 75, 90] as const;
export const WORKOUT_PRESETS = [5, 10, 15, 20, 30] as const;

export const DEFAULT_YOUTUBE_LINKS: Omit<YoutubeLink, 'id' | 'createdAt'>[] = [
  // 5 minute workouts (minimum 3 different videos)
  {
    title: '5 Min Morning Stretch',
    url: 'https://www.youtube.com/watch?v=4pKly2JojMw',
    isActive: true,
  },
  {
    title: '5 Min Quick Stretch',
    url: 'https://www.youtube.com/watch?v=l2ADeM1HD88',
    isActive: false,
  },
  {
    title: '5 Min Desk Break',
    url: 'https://www.youtube.com/watch?v=lXIKQMWcdLA',
    isActive: false,
  },
  {
    title: '5 Min Energy Boost',
    url: 'https://www.youtube.com/watch?v=zwSRF3QkG7Q',
    isActive: false,
  },
  // 10 minute workouts (minimum 3 different videos)
  {
    title: '10 Min Desk Stretch',
    url: 'https://www.youtube.com/watch?v=PqqJBaE4srs',
    isActive: false,
  },
  {
    title: '10 Min Standing Stretch',
    url: 'https://www.youtube.com/watch?v=jaGmxOELPvE',
    isActive: false,
  },
  {
    title: '10 Min Full Body Workout',
    url: 'https://www.youtube.com/watch?v=ZDuNYCd5ay0',
    isActive: false,
  },
  {
    title: '10 Min Core Strength',
    url: 'https://www.youtube.com/watch?v=auaC_Ir4C3o',
    isActive: false,
  },
  // 15 minute workouts (minimum 3 different videos)
  {
    title: '15 Min Full Body Mobility',
    url: 'https://www.youtube.com/watch?v=-j9aak0bwo0',
    isActive: false,
  },
  {
    title: '15 Min HIIT Workout',
    url: 'https://www.youtube.com/watch?v=OGPmzWHsnOQ',
    isActive: false,
  },
  {
    title: '15 Min Yoga Flow',
    url: 'https://www.youtube.com/watch?v=CamSXRh01EI',
    isActive: false,
  },
  {
    title: '15 Min Low Impact HIIT',
    url: 'https://www.youtube.com/watch?v=098s2SclfjQ',
    isActive: false,
  },
  // 20 minute workouts (minimum 3 different videos)
  {
    title: '20 Min Full Body HIIT',
    url: 'https://www.youtube.com/watch?v=SwfkF65vzXQ',
    isActive: false,
  },
  {
    title: '20 Min HIIT Workout',
    url: 'https://www.youtube.com/watch?v=YC3Vu4ZD6hQ',
    isActive: false,
  },
  {
    title: '20 Min No Repeat Workout',
    url: 'https://www.youtube.com/watch?v=rTC3-TltvbE',
    isActive: false,
  },
  {
    title: '20 Min Standing Arms & Abs',
    url: 'https://www.youtube.com/watch?v=DagwbO8HBi4',
    isActive: false,
  },
  // 25 minute workouts (minimum 3 different videos)
  {
    title: '25 Min Full Body Calisthenics',
    url: 'https://www.youtube.com/watch?v=t1uZG3OhH4c',
    isActive: false,
  },
  {
    title: '25 Min Unilateral HIIT',
    url: 'https://www.youtube.com/watch?v=mTKsxyHs2Jc',
    isActive: false,
  },
  {
    title: '25 Min Total Body Burn',
    url: 'https://www.youtube.com/watch?v=TEuCYPrLdsA',
    isActive: false,
  },
  {
    title: '25 Min Full Body Strength',
    url: 'https://www.youtube.com/watch?v=j8uNQi0FDS0',
    isActive: false,
  },
  // 30 minute workouts (minimum 3 different videos)
  {
    title: '30 Min Full Body Workout',
    url: 'https://www.youtube.com/watch?v=KjzbHCbrnWQ',
    isActive: false,
  },
  {
    title: '30 Min Apartment Friendly',
    url: 'https://www.youtube.com/watch?v=73NEi4HzHPs',
    isActive: false,
  },
  {
    title: '30 Min Bodyweight Strength',
    url: 'https://www.youtube.com/watch?v=FmzcYWpzAS8',
    isActive: false,
  },
  {
    title: '30 Min HIIT with Weights',
    url: 'https://www.youtube.com/watch?v=qciUTVwZUn4',
    isActive: false,
  },
];
