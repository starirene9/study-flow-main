import { UserSettings, YoutubeLink, SessionLog, DEFAULT_YOUTUBE_LINKS } from '@/types/studyflow';

const STORAGE_KEYS = {
  SETTINGS: 'studyflow_settings',
  YOUTUBE_LINKS: 'studyflow_youtube_links',
  SESSION_LOGS: 'studyflow_session_logs',
} as const;

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Settings
export const getSettings = (): UserSettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    focusMinutes: 60,
    workoutMinutes: 20,
    activeYoutubeUrl: DEFAULT_YOUTUBE_LINKS[0].url,
  };
};

export const saveSettings = (settings: UserSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// YouTube Links
export const getYoutubeLinks = (): YoutubeLink[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.YOUTUBE_LINKS);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default links
  const defaultLinks: YoutubeLink[] = DEFAULT_YOUTUBE_LINKS.map((link) => ({
    ...link,
    id: generateId(),
    createdAt: new Date(),
  }));
  saveYoutubeLinks(defaultLinks);
  return defaultLinks;
};

export const saveYoutubeLinks = (links: YoutubeLink[]): void => {
  localStorage.setItem(STORAGE_KEYS.YOUTUBE_LINKS, JSON.stringify(links));
};

export const addYoutubeLink = (url: string, title?: string): YoutubeLink => {
  const links = getYoutubeLinks();
  const newLink: YoutubeLink = {
    id: generateId(),
    url,
    title: title || extractVideoTitle(url),
    isActive: false,
    createdAt: new Date(),
  };
  links.push(newLink);
  saveYoutubeLinks(links);
  return newLink;
};

export const deleteYoutubeLink = (id: string): void => {
  const links = getYoutubeLinks().filter((link) => link.id !== id);
  saveYoutubeLinks(links);
};

export const activateYoutubeLink = (id: string): void => {
  const links = getYoutubeLinks().map((link) => ({
    ...link,
    isActive: link.id === id,
  }));
  saveYoutubeLinks(links);
  
  const activeLink = links.find((l) => l.id === id);
  if (activeLink) {
    const settings = getSettings();
    settings.activeYoutubeUrl = activeLink.url;
    saveSettings(settings);
  }
};

// Session Logs
export const getSessionLogs = (date?: string): SessionLog[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSION_LOGS);
  const logs: SessionLog[] = stored ? JSON.parse(stored) : [];
  
  if (date) {
    return logs.filter((log) => log.sessionDate === date);
  }
  return logs;
};

export const saveSessionLog = (log: Omit<SessionLog, 'id'>): SessionLog => {
  const logs = getSessionLogs();
  const newLog: SessionLog = {
    ...log,
    id: generateId(),
  };
  logs.push(newLog);
  localStorage.setItem(STORAGE_KEYS.SESSION_LOGS, JSON.stringify(logs));
  return newLog;
};

// Helpers
export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Extract duration from video title
export const extractDurationFromTitle = (title: string): number | null => {
  const match = title.match(/(\d+)\s*(?:min|분|minute|minutes)/i);
  return match ? parseInt(match[1], 10) : null;
};

// Get filtered videos based on workout duration
export const getFilteredVideos = (workoutMinutes: number): YoutubeLink[] => {
  const links = getYoutubeLinks();
  return links.filter((link) => {
    const videoDuration = extractDurationFromTitle(link.title);
    return videoDuration === null || videoDuration <= workoutMinutes;
  });
};

// Get random video from filtered list
export const getRandomVideo = (workoutMinutes: number): YoutubeLink | null => {
  const filtered = getFilteredVideos(workoutMinutes);
  if (filtered.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};

export const extractVideoTitle = (url: string): string => {
  const videoId = extractVideoId(url);
  return videoId ? `Video ${videoId.slice(0, 6)}...` : 'YouTube Video';
};

export const getEmbedUrl = (url: string): string | null => {
  const videoId = extractVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
};
