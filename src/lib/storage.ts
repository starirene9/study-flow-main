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

// Generate unique ID (UUID v4 format)
export const generateId = (): string => {
  // Generate UUID v4 format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
      // Supabase에서 가져온 설정과 localStorage의 커스텀 설정 병합
      const localSettings = getSettingsLocal();
      // Use the stored values directly - user has explicitly set these values
      // Only enforce minimums for new users (when data doesn't exist)
      return {
        focusMinutes: data.focus_minutes,
        workoutMinutes: data.workout_minutes,
        activeYoutubeUrl: data.active_youtube_url,
        primaryColorTheme: localSettings.primaryColorTheme || 'blue',
        customFocusMessage: localSettings.customFocusMessage,
        soundEnabled: localSettings.soundEnabled !== undefined ? localSettings.soundEnabled : true,
      };
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return getSettingsLocal();
  }

  // Default settings
  const defaultSettings = {
    focusMinutes: 45,
    workoutMinutes: 15,
    activeYoutubeUrl: DEFAULT_YOUTUBE_LINKS[0].url,
    primaryColorTheme: 'blue' as const,
    soundEnabled: true,
  };
  
  // Save default to Supabase
  await saveSettings(defaultSettings);
  return defaultSettings;
};

export const getSettingsLocal = (): UserSettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Use stored values directly - user has explicitly set these values
    // Only enforce minimums for new users (when no stored data exists)
    return parsed;
  }
  return {
    focusMinutes: 45,
    workoutMinutes: 15,
    activeYoutubeUrl: DEFAULT_YOUTUBE_LINKS[0].url,
    primaryColorTheme: 'blue' as const,
    soundEnabled: true,
  };
};

export const saveSettings = async (settings: UserSettings): Promise<void> => {
  // 색상 테마는 localStorage에만 저장 (Supabase 스키마에 없을 수 있음)
  saveSettingsLocal(settings);
  
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
    }
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const saveSettingsLocal = (settings: UserSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// YouTube Links
export const getYoutubeLinks = async (): Promise<YoutubeLink[]> => {
  // 기본 링크는 항상 메모리에서 생성 (Supabase에 저장하지 않음)
  const defaultLinks: YoutubeLink[] = DEFAULT_YOUTUBE_LINKS.map((link) => ({
    ...link,
    id: `default-${link.url}`, // 기본 링크는 URL 기반 고정 ID 사용
    createdAt: new Date(0), // 기본 링크는 오래된 날짜로 설정
  }));

  try {
    // Supabase에서 사용자가 추가한 링크만 가져오기
    const { data, error } = await supabase
      .from("youtube_links")
      .select("*")
      .eq("user_id", getUserId())
      .order("created_at", { ascending: true });

    if (error) {
      console.error('Error fetching YouTube links from Supabase:', error);
      // 에러 발생 시 기본 링크만 반환
      return defaultLinks;
    }

    // 사용자가 추가한 링크를 YoutubeLink 형식으로 변환
    const userAddedLinks: YoutubeLink[] = (data || []).map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      isActive: link.is_active,
      createdAt: new Date(link.created_at || ''),
    }));

    // 기본 링크와 사용자가 추가한 링크를 합쳐서 반환
    // 기본 링크가 먼저 오고, 그 다음 사용자가 추가한 링크가 오도록 정렬
    const allLinks = [...defaultLinks, ...userAddedLinks];
    
    // Remove duplicates by URL (keep the first occurrence, prefer default links)
    const seenUrls = new Set<string>();
    const seenVideoIds = new Set<string>();
    const uniqueLinks: YoutubeLink[] = [];
    
    for (const link of allLinks) {
      const normalizedUrl = link.url.trim();
      const videoId = extractVideoId(normalizedUrl);
      
      // Check if URL or video ID already exists
      const urlExists = seenUrls.has(normalizedUrl);
      const videoIdExists = videoId && seenVideoIds.has(videoId);
      
      if (!urlExists && !videoIdExists) {
        seenUrls.add(normalizedUrl);
        if (videoId) {
          seenVideoIds.add(videoId);
        }
        uniqueLinks.push(link);
      } else {
        // If duplicate found and it's a user-added link, we should remove it from database
        // But for now, just skip it in the list
        console.warn('Duplicate link detected and removed:', normalizedUrl);
      }
    }
    
    // 활성 링크가 있으면 그 링크만 활성으로 설정
    const activeLink = uniqueLinks.find(link => link.isActive);
    if (activeLink) {
      return uniqueLinks.map(link => ({
        ...link,
        isActive: link.id === activeLink.id,
      }));
    }

    return uniqueLinks;
  } catch (error) {
    console.error('Error fetching YouTube links:', error);
    // 에러 발생 시 기본 링크만 반환
    return defaultLinks;
  }
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
    // Remove duplicates before saving
    const seenUrls = new Set<string>();
    const seenVideoIds = new Set<string>();
    const uniqueLinks: YoutubeLink[] = [];
    
    for (const link of links) {
      const normalizedUrl = link.url.trim();
      const videoId = extractVideoId(normalizedUrl);
      const urlExists = seenUrls.has(normalizedUrl);
      const videoIdExists = videoId && seenVideoIds.has(videoId);
      
      if (!urlExists && !videoIdExists) {
        seenUrls.add(normalizedUrl);
        if (videoId) {
          seenVideoIds.add(videoId);
        }
        uniqueLinks.push(link);
      }
    }
    
    // 기본 링크와 사용자가 추가한 링크를 구분
    // 기본 링크는 ID가 'default-'로 시작하거나 createdAt이 1970년 이전인 링크
    const defaultLinkIds = new Set(DEFAULT_YOUTUBE_LINKS.map(link => `default-${link.url}`));
    const userAddedLinks = uniqueLinks.filter(
      link => !defaultLinkIds.has(link.id) && link.createdAt.getTime() > 0
    );

    // 기존 사용자 추가 링크 삭제
    await supabase
      .from("youtube_links")
      .delete()
      .eq("user_id", getUserId());

    // 사용자가 추가한 링크만 Supabase에 저장
    if (userAddedLinks.length > 0) {
      const { error } = await supabase
        .from("youtube_links")
        .insert(
          userAddedLinks.map((link) => ({
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
  // Check for duplicate URL (both in user-added links and default links)
  const existingLinks = await getYoutubeLinks();
  const normalizedUrl = url.trim();
  const duplicateLink = existingLinks.find(link => {
    const existingUrl = link.url.trim();
    // Compare URLs directly and also by video ID
    const existingVideoId = extractVideoId(existingUrl);
    const newVideoId = extractVideoId(normalizedUrl);
    return existingUrl === normalizedUrl || (existingVideoId && newVideoId && existingVideoId === newVideoId);
  });

  if (duplicateLink) {
    console.warn('Duplicate YouTube link detected:', normalizedUrl);
    throw new Error('This video URL already exists');
  }

  const newLink: YoutubeLink = {
    id: generateId(),
    url: normalizedUrl,
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
    // Re-throw if it's a duplicate error
    if (error instanceof Error && error.message === 'This video URL already exists') {
      throw error;
    }
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
    // 모든 링크 가져오기 (기본 링크 + 사용자 추가 링크)
    const allLinks = await getYoutubeLinks();
    const linkToActivate = allLinks.find(link => link.id === id);
    
    if (!linkToActivate) {
      console.error('Link not found:', id);
      return;
    }

    // Get video duration from title
    const videoDuration = extractDurationFromTitle(linkToActivate.title);
    if (!videoDuration) {
      console.error('Cannot extract duration from video title:', linkToActivate.title);
      throw new Error('Cannot determine video duration from title');
    }

    // Get current settings
    const settings = await getSettings();
    
    // If video duration doesn't match current workout duration, update workout duration to match video
    if (videoDuration !== settings.workoutMinutes) {
      console.log(`Video duration (${videoDuration} min) doesn't match workout duration (${settings.workoutMinutes} min). Updating workout duration to ${videoDuration} min.`);
      settings.workoutMinutes = videoDuration;
      await saveSettings(settings);
    }

    // 사용자가 추가한 링크인지 확인 (기본 링크는 ID가 'default-'로 시작)
    const isDefaultLink = id.startsWith('default-');
    
    if (!isDefaultLink) {
      // 사용자가 추가한 링크인 경우 Supabase에서 업데이트
      // 모든 사용자 추가 링크를 비활성화
      const { error: updateAllError } = await supabase
        .from("youtube_links")
        .update({ is_active: false })
        .eq("user_id", getUserId());

      if (updateAllError) {
        console.error('Error deactivating all links:', updateAllError);
      }

      // 선택한 링크를 활성화
      const { error: updateError, data: updateData } = await supabase
        .from("youtube_links")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", getUserId())
        .select()
        .single();

      if (updateError) {
        console.error('Error activating YouTube link:', updateError);
        throw updateError;
      }
    }

    // 설정에 활성 링크 URL 저장 (기본 링크든 사용자 추가 링크든 상관없이)
    settings.activeYoutubeUrl = linkToActivate.url;
    await saveSettings(settings);
  } catch (error) {
    console.error('Error activating YouTube link:', error);
    // Fallback: 링크 목록을 가져와서 활성 링크만 설정
    const links = await getYoutubeLinks();
    const activeLink = links.find((l) => l.id === id);
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

// Get filtered videos based on workout duration (must match exactly)
export const getFilteredVideos = async (workoutMinutes: number): Promise<YoutubeLink[]> => {
  const links = await getYoutubeLinks();
  return links.filter((link) => {
    const videoDuration = extractDurationFromTitle(link.title);
    return videoDuration === workoutMinutes; // Must match exactly
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
