import { UserSettings, YoutubeLink, SessionLog, DEFAULT_YOUTUBE_LINKS } from "@/types/studyflow";
import { supabase } from "./supabase";

const STORAGE_KEYS = {
  SETTINGS: "studyflow_settings",
  YOUTUBE_LINKS: "studyflow_youtube_links",
  SESSION_LOGS: "studyflow_session_logs",
} as const;

const DEFAULT_USER_ID = "default";
let currentUserId = DEFAULT_USER_ID;

export const setCurrentUserId = (userId: string | null) => {
  currentUserId = userId || DEFAULT_USER_ID;
};

const getUserId = () => currentUserId;

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Settings
export const getSettings = async (): Promise<UserSettings> => {
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", getUserId())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings from Supabase:', error);
      // Fallback to localStorage
      return getSettingsLocal();
    }

    if (data) {
      return {
        focusMinutes: data.focus_minutes,
        workoutMinutes: data.workout_minutes,
        activeYoutubeUrl: data.active_youtube_url,
      };
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return getSettingsLocal();
  }

  // Default settings
  const defaultSettings = {
    focusMinutes: 60,
    workoutMinutes: 20,
    activeYoutubeUrl: DEFAULT_YOUTUBE_LINKS[0].url,
  };
  
  // Save default to Supabase
  await saveSettings(defaultSettings);
  return defaultSettings;
};

export const getSettingsLocal = (): UserSettings => {
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

export const saveSettings = async (settings: UserSettings): Promise<void> => {
  try {
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: getUserId(),
          focus_minutes: settings.focusMinutes,
          workout_minutes: settings.workoutMinutes,
          active_youtube_url: settings.activeYoutubeUrl,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

    if (error) {
      console.error('Error saving settings to Supabase:', error);
      // Fallback to localStorage
      saveSettingsLocal(settings);
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    saveSettingsLocal(settings);
  }
};

export const saveSettingsLocal = (settings: UserSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// YouTube Links
export const getYoutubeLinks = async (): Promise<YoutubeLink[]> => {
  try {
    const { data, error } = await supabase
      .from("youtube_links")
      .select("*")
      .eq("user_id", getUserId())
      .order("created_at", { ascending: true });

    if (error) {
      console.error('Error fetching YouTube links from Supabase:', error);
      return getYoutubeLinksLocal();
    }

    if (data && data.length > 0) {
      return data.map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        isActive: link.is_active,
        createdAt: new Date(link.created_at || ''),
      }));
    }
  } catch (error) {
    console.error('Error fetching YouTube links:', error);
    return getYoutubeLinksLocal();
  }

  // Initialize with default links
  const defaultLinks: YoutubeLink[] = DEFAULT_YOUTUBE_LINKS.map((link) => ({
    ...link,
    id: generateId(),
    createdAt: new Date(),
  }));
  await saveYoutubeLinks(defaultLinks);
  return defaultLinks;
};

export const getYoutubeLinksLocal = (): YoutubeLink[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.YOUTUBE_LINKS);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const saveYoutubeLinks = async (links: YoutubeLink[]): Promise<void> => {
  try {
    // Delete existing links
    await supabase
      .from("youtube_links")
      .delete()
      .eq("user_id", getUserId());

    // Insert new links
    const { error } = await supabase
      .from("youtube_links")
      .insert(
        links.map((link) => ({
          id: link.id,
          user_id: getUserId(),
          title: link.title,
          url: link.url,
          is_active: link.isActive,
          created_at: link.createdAt.toISOString(),
        }))
      );

    if (error) {
      console.error('Error saving YouTube links to Supabase:', error);
      saveYoutubeLinksLocal(links);
    }
  } catch (error) {
    console.error('Error saving YouTube links:', error);
    saveYoutubeLinksLocal(links);
  }
};

export const saveYoutubeLinksLocal = (links: YoutubeLink[]): void => {
  localStorage.setItem(STORAGE_KEYS.YOUTUBE_LINKS, JSON.stringify(links));
};

export const addYoutubeLink = async (url: string, title?: string): Promise<YoutubeLink> => {
  const newLink: YoutubeLink = {
    id: generateId(),
    url,
    title: title || extractVideoTitle(url),
    isActive: false,
    createdAt: new Date(),
  };

  try {
    const { error } = await supabase
      .from("youtube_links")
      .insert({
        id: newLink.id,
        user_id: getUserId(),
        title: newLink.title,
        url: newLink.url,
        is_active: newLink.isActive,
        created_at: newLink.createdAt.toISOString(),
      });

    if (error) {
      console.error('Error adding YouTube link to Supabase:', error);
      const links = await getYoutubeLinks();
      links.push(newLink);
      await saveYoutubeLinks(links);
    }
  } catch (error) {
    console.error('Error adding YouTube link:', error);
    const links = await getYoutubeLinks();
    links.push(newLink);
    await saveYoutubeLinks(links);
  }

  return newLink;
};

export const deleteYoutubeLink = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("youtube_links")
      .delete()
      .eq("id", id)
      .eq("user_id", getUserId());

    if (error) {
      console.error('Error deleting YouTube link from Supabase:', error);
      const links = await getYoutubeLinks();
      const filtered = links.filter((link) => link.id !== id);
      await saveYoutubeLinks(filtered);
    }
  } catch (error) {
    console.error('Error deleting YouTube link:', error);
    const links = await getYoutubeLinks();
    const filtered = links.filter((link) => link.id !== id);
    await saveYoutubeLinks(filtered);
  }
};

export const activateYoutubeLink = async (id: string): Promise<void> => {
  try {
    // Update all links to set is_active
    await supabase
      .from("youtube_links")
      .update({ is_active: false })
      .eq("user_id", getUserId());

    await supabase
      .from("youtube_links")
      .update({ is_active: true })
      .eq("id", id)
      .eq("user_id", getUserId());

    // Get active link and update settings
    const { data } = await supabase
      .from("youtube_links")
      .select("url")
      .eq("id", id)
      .single();

    if (data) {
      const settings = await getSettings();
      settings.activeYoutubeUrl = data.url;
      await saveSettings(settings);
    }
  } catch (error) {
    console.error('Error activating YouTube link:', error);
    const links = await getYoutubeLinks();
    const updated = links.map((link) => ({
      ...link,
      isActive: link.id === id,
    }));
    await saveYoutubeLinks(updated);
    
    const activeLink = updated.find((l) => l.id === id);
    if (activeLink) {
      const settings = await getSettings();
      settings.activeYoutubeUrl = activeLink.url;
      await saveSettings(settings);
    }
  }
};

// Session Logs
export const getSessionLogs = async (date?: string): Promise<SessionLog[]> => {
  try {
    let query = supabase
      .from("session_logs")
      .select("*")
      .eq("user_id", getUserId())
      .order("start_time", { ascending: false });

    if (date) {
      query = query.eq("session_date", date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching session logs from Supabase:', error);
      return getSessionLogsLocal(date);
    }

    if (data) {
      return data.map((log) => ({
        id: log.id,
        sessionDate: log.session_date,
        type: log.type as 'FOCUS' | 'WORKOUT',
        startTime: new Date(log.start_time),
        endTime: new Date(log.end_time),
        durationMinutes: log.duration_minutes,
        youtubeUrl: log.youtube_url || undefined,
      }));
    }
  } catch (error) {
    console.error('Error fetching session logs:', error);
    return getSessionLogsLocal(date);
  }

  return [];
};

export const getSessionLogsLocal = (date?: string): SessionLog[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSION_LOGS);
  const logs: SessionLog[] = stored ? JSON.parse(stored) : [];
  
  if (date) {
    return logs.filter((log) => log.sessionDate === date);
  }
  return logs;
};

export const saveSessionLog = async (log: Omit<SessionLog, 'id'>): Promise<SessionLog> => {
  const newLog: SessionLog = {
    ...log,
    id: generateId(),
  };

  try {
    const { error } = await supabase
      .from("session_logs")
      .insert({
        id: newLog.id,
        user_id: getUserId(),
        session_date: newLog.sessionDate,
        type: newLog.type,
        start_time: newLog.startTime.toISOString(),
        end_time: newLog.endTime.toISOString(),
        duration_minutes: newLog.durationMinutes,
        youtube_url: newLog.youtubeUrl || null,
      });

    if (error) {
      console.error('Error saving session log to Supabase:', error);
      const logs = await getSessionLogs();
      logs.push(newLog);
      saveSessionLogLocal(newLog);
    }
  } catch (error) {
    console.error('Error saving session log:', error);
    saveSessionLogLocal(newLog);
  }

  return newLog;
};

export const saveSessionLogLocal = (log: SessionLog): void => {
  const logs = getSessionLogsLocal();
  logs.push(log);
  localStorage.setItem(STORAGE_KEYS.SESSION_LOGS, JSON.stringify(logs));
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
export const getFilteredVideos = async (workoutMinutes: number): Promise<YoutubeLink[]> => {
  const links = await getYoutubeLinks();
  return links.filter((link) => {
    const videoDuration = extractDurationFromTitle(link.title);
    return videoDuration === null || videoDuration <= workoutMinutes;
  });
};

// Get random video from filtered list
export const getRandomVideo = async (workoutMinutes: number): Promise<YoutubeLink | null> => {
  const filtered = await getFilteredVideos(workoutMinutes);
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
