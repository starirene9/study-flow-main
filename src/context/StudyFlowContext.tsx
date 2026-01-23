import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserSettings,
  YoutubeLink,
  SessionLog,
  SessionType,
  SessionStatus,
  HourlyBucket,
  DailySummary,
} from '@/types/studyflow';
// 색상 테마는 Focus 페이지에서만 적용됩니다.
import {
  getSettings,
  saveSettings,
  getYoutubeLinks,
  saveYoutubeLinks,
  getSessionLogs,
  saveSessionLog,
  getTodayDate,
  activateYoutubeLink as activateLinkStorage,
  addYoutubeLink as addLinkStorage,
  deleteYoutubeLink as deleteLinkStorage,
  getRandomVideo,
  setCurrentUserId,
} from '@/lib/storage';
import { DEFAULT_YOUTUBE_LINKS } from '@/types/studyflow';
import { useAuth } from '@/context/AuthContext';
import { playBeepSound } from '@/lib/sound';

interface StudyFlowContextType {
  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // YouTube Links
  youtubeLinks: YoutubeLink[];
  addYoutubeLink: (url: string, title?: string) => Promise<void>;
  deleteYoutubeLink: (id: string) => Promise<void>;
  activateYoutubeLink: (id: string) => Promise<void>;
  activeLink: YoutubeLink | null;
  currentWorkoutVideo: YoutubeLink | null; // Random video for current workout
  // Session State
  sessionStatus: SessionStatus;
  currentSessionType: SessionType;
  cycleCount: number;
  timeRemaining: number;
  totalTime: number;
  
  // Session Controls
  startCycle: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  
  // Session Logs
  todayLogs: SessionLog[];
  getDailySummary: (date?: string) => Promise<DailySummary>;
  isLoading: boolean;
}

const StudyFlowContext = createContext<StudyFlowContextType | null>(null);

export const useStudyFlow = () => {
  const context = useContext(StudyFlowContext);
  if (!context) {
    throw new Error('useStudyFlow must be used within StudyFlowProvider');
  }
  return context;
};

export const StudyFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Settings
  const [settings, setSettings] = useState<UserSettings>({
    focusMinutes: 60,
    workoutMinutes: 20,
    activeYoutubeUrl: null,
    soundEnabled: true,
  });
  const [youtubeLinks, setYoutubeLinks] = useState<YoutubeLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Session State
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [currentSessionType, setCurrentSessionType] = useState<SessionType>('FOCUS');
  const [cycleCount, setCycleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  
  // Session tracking
  const sessionStartRef = useRef<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Session Logs
  const [todayLogs, setTodayLogs] = useState<SessionLog[]>([]);
  
  // Current workout video (randomly selected each workout session)
  const [currentWorkoutVideo, setCurrentWorkoutVideo] = useState<YoutubeLink | null>(null);
  
  // Get active YouTube link (for display purposes)
  const activeLink = youtubeLinks.find((link) => link.isActive) || null;
  
  // 사용자 ID 동기화
  useEffect(() => {
    if (user) {
      setCurrentUserId(user.id);
    } else {
      setCurrentUserId(null);
    }
  }, [user]);
  
  // Load initial data - 사용자 변경 시마다 다시 로드
  useEffect(() => {
    const loadInitialData = async () => {
      // 사용자가 없으면 로딩하지 않음
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // 사용자 ID 설정
        setCurrentUserId(user.id);
        
        const [loadedSettings, loadedLinks, loadedLogs] = await Promise.all([
          getSettings(),
          getYoutubeLinks(),
          getSessionLogs(getTodayDate()),
        ]);
        setSettings(loadedSettings);
        setYoutubeLinks(loadedLinks);
        setTodayLogs(loadedLogs);
        
        // 색상 테마는 Focus 페이지에서만 적용됩니다.
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [user?.id]); // 사용자 ID가 변경될 때마다 다시 로드
  
  // 색상 테마는 Focus 페이지에서만 적용됩니다.
  
  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettings(updated);
  }, [settings]);
  
  // YouTube Link management
  const addYoutubeLink = useCallback(async (url: string, title?: string) => {
    try {
      console.log('Context: Adding video', { url, title });
      const newLink = await addLinkStorage(url, title);
      console.log('Context: Video added to storage', newLink);
      
      // Longer delay to ensure database update is complete and propagated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Force refresh links from storage multiple times to ensure we get the latest
      let updatedLinks = await getYoutubeLinks();
      console.log('Context: First fetch', updatedLinks.length, 'links');
      
      // If new link not found, try again
      if (!updatedLinks.find(l => l.id === newLink.id || l.url === newLink.url)) {
        console.log('Context: New link not found, retrying...');
        await new Promise(resolve => setTimeout(resolve, 200));
        updatedLinks = await getYoutubeLinks();
        console.log('Context: Second fetch', updatedLinks.length, 'links');
      }
      
      console.log('Context: Final links', updatedLinks.map(l => ({ 
        id: l.id, 
        title: l.title, 
        url: l.url,
        isUserAdded: !DEFAULT_YOUTUBE_LINKS.some(d => d.url === l.url) 
      })));
      
      // Create new array reference to trigger re-render
      setYoutubeLinks([...updatedLinks]);
    } catch (error) {
      console.error('Error in addYoutubeLink:', error);
      // Still try to refresh
      const updatedLinks = await getYoutubeLinks();
      setYoutubeLinks([...updatedLinks]);
    }
  }, []);
  
  const deleteYoutubeLink = useCallback(async (id: string) => {
    await deleteLinkStorage(id);
    const updatedLinks = await getYoutubeLinks();
    setYoutubeLinks(updatedLinks);
  }, []);
  
  const activateYoutubeLink = useCallback(async (id: string) => {
    try {
      console.log('Context: Activating link', id);
      await activateLinkStorage(id);
      console.log('Context: Link activated in storage');
      
      // Small delay to ensure database update is complete
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Force refresh both links and settings
      const [updatedLinks, updatedSettings] = await Promise.all([
        getYoutubeLinks(),
        getSettings(),
      ]);
      
      console.log('Context: Fetched updated links', updatedLinks.map(l => ({ id: l.id, title: l.title, isActive: l.isActive })));
      
      // Ensure only one link is active
      const normalizedLinks = updatedLinks.map(link => ({
        ...link,
        isActive: link.id === id, // Force the clicked link to be active
      }));
      
      console.log('Context: Setting normalized links', normalizedLinks.map(l => ({ id: l.id, title: l.title, isActive: l.isActive })));
      
      // Update state directly - this will trigger re-render
      setYoutubeLinks(normalizedLinks);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error in activateYoutubeLink:', error);
      // Still try to refresh the data
      const [updatedLinks, updatedSettings] = await Promise.all([
        getYoutubeLinks(),
        getSettings(),
      ]);
      // Ensure only clicked link is active
      const normalizedLinks = updatedLinks.map(link => ({
        ...link,
        isActive: link.id === id,
      }));
      setYoutubeLinks(normalizedLinks);
      setSettings(updatedSettings);
    }
  }, []);
  
  // Log session completion
  const logSession = useCallback(async (type: SessionType, startTime: Date, endTime: Date, videoUrl?: string, isCompleted: boolean = true) => {
    // Calculate duration in seconds, then convert to minutes with decimal precision
    const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
    const durationMinutes = durationSeconds / 60; // Keep decimal precision for seconds
    const log = await saveSessionLog({
      sessionDate: getTodayDate(),
      type,
      startTime,
      endTime,
      durationMinutes,
      youtubeUrl: type === 'WORKOUT' ? videoUrl : undefined,
      isCompleted,
    });
    setTodayLogs((prev) => [...prev, log]);
    // Refresh today's logs
    const updatedLogs = await getSessionLogs(getTodayDate());
    setTodayLogs(updatedLogs);
  }, []);
  
  // Session transition
  const transitionToNextSession = useCallback(async () => {
    if (!sessionStartRef.current) return;
    
    const endTime = new Date();
    
    // Play beep sound if enabled
    if (settings.soundEnabled !== false) {
      playBeepSound();
    }
    
    if (currentSessionType === 'FOCUS') {
      await logSession('FOCUS', sessionStartRef.current, endTime);
      
      // Move to workout - select random video
      const randomVideo = await getRandomVideo(settings.workoutMinutes);
      setCurrentWorkoutVideo(randomVideo);
      
      setCurrentSessionType('WORKOUT');
      const newTime = settings.workoutMinutes * 60;
      setTimeRemaining(newTime);
      setTotalTime(newTime);
      sessionStartRef.current = new Date();
      navigate('/workout');
    } else {
      // Log workout with the video that was used
      await logSession('WORKOUT', sessionStartRef.current, endTime, currentWorkoutVideo?.url);
      
      // Move to focus (next cycle)
      setCycleCount((prev) => prev + 1);
      setCurrentSessionType('FOCUS');
      setCurrentWorkoutVideo(null);
      const newTime = settings.focusMinutes * 60;
      setTimeRemaining(newTime);
      setTotalTime(newTime);
      sessionStartRef.current = new Date();
      navigate('/focus');
    }
  }, [currentSessionType, settings, logSession, navigate, currentWorkoutVideo]);
  
  // Timer effect
  useEffect(() => {
    if (sessionStatus === 'running' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            transitionToNextSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionStatus, transitionToNextSession]);
  
  // Session Controls
  const startCycle = useCallback(() => {
    setCurrentSessionType('FOCUS');
    setCycleCount(0);
    const time = settings.focusMinutes * 60;
    setTimeRemaining(time);
    setTotalTime(time);
    setSessionStatus('running');
    sessionStartRef.current = new Date();
    navigate('/focus');
  }, [settings.focusMinutes, navigate]);
  
  const pauseSession = useCallback(() => {
    setSessionStatus('paused');
  }, []);
  
  const resumeSession = useCallback(() => {
    setSessionStatus('running');
  }, []);
  
  const stopSession = useCallback(async () => {
    // Log partial session with second-level precision
    if (sessionStartRef.current) {
      const endTime = new Date();
      const elapsed = (endTime.getTime() - sessionStartRef.current.getTime()) / 1000;
      
      // Log any session that has elapsed time (even less than 1 minute)
      if (elapsed > 0) {
        const videoUrl = currentSessionType === 'WORKOUT' ? currentWorkoutVideo?.url : undefined;
        await logSession(currentSessionType, sessionStartRef.current, endTime, videoUrl, false);
      }
    }
    
    setSessionStatus('stopped');
    setTimeRemaining(0);
    sessionStartRef.current = null;
    navigate('/summary');
  }, [currentSessionType, currentWorkoutVideo, logSession, navigate]);
  
  // Calculate daily summary
  const getDailySummary = useCallback(async (date?: string): Promise<DailySummary> => {
    const targetDate = date || getTodayDate();
    const logs = date ? await getSessionLogs(date) : todayLogs;
    
    let totalFocusMinutes = 0;
    let totalWorkoutMinutes = 0;
    
    // Initialize hourly buckets
    const hourlyBuckets: HourlyBucket[] = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      focusMinutes: 0,
      workoutMinutes: 0,
      dominantType: 'IDLE' as const,
    }));
    
    // Process logs
    logs.forEach((log) => {
      const startHour = new Date(log.startTime).getHours();
      const endHour = new Date(log.endTime).getHours();
      
      if (log.type === 'FOCUS') {
        totalFocusMinutes += log.durationMinutes;
      } else {
        totalWorkoutMinutes += log.durationMinutes;
      }
      
      // Distribute time across hours (simplified)
      for (let h = startHour; h <= endHour && h < 24; h++) {
        const bucket = hourlyBuckets[h];
        const minutesInHour = h === startHour && h === endHour 
          ? log.durationMinutes 
          : h === startHour 
            ? 60 - new Date(log.startTime).getMinutes()
            : h === endHour 
              ? new Date(log.endTime).getMinutes() 
              : 60;
        
        if (log.type === 'FOCUS') {
          bucket.focusMinutes += Math.min(minutesInHour, log.durationMinutes);
        } else {
          bucket.workoutMinutes += Math.min(minutesInHour, log.durationMinutes);
        }
      }
    });
    
    // Determine dominant type for each hour
    hourlyBuckets.forEach((bucket) => {
      if (bucket.focusMinutes > 0 || bucket.workoutMinutes > 0) {
        bucket.dominantType = bucket.focusMinutes >= bucket.workoutMinutes ? 'FOCUS' : 'WORKOUT';
      }
    });
    
    // Count completed cycles (a cycle = 1 focus + 1 workout)
    const focusSessions = logs.filter((l) => l.type === 'FOCUS').length;
    const workoutSessions = logs.filter((l) => l.type === 'WORKOUT').length;
    const completedCycles = Math.min(focusSessions, workoutSessions);
    
    // Success if at least 1 full cycle completed
    const isSuccess = completedCycles >= 1;
    
    return {
      date: targetDate,
      totalFocusMinutes,
      totalWorkoutMinutes,
      completedCycles,
      isSuccess,
      hourlyBuckets,
    };
  }, [todayLogs]);
  
  // Refresh today's logs when date changes
  useEffect(() => {
    const checkDate = async () => {
      const today = getTodayDate();
      const currentLogs = await getSessionLogs(today);
      setTodayLogs(currentLogs);
    };
    
    checkDate();
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <StudyFlowContext.Provider
      value={{
        settings,
        updateSettings,
        youtubeLinks,
        addYoutubeLink,
        deleteYoutubeLink,
        activateYoutubeLink,
        activeLink,
        currentWorkoutVideo,
        sessionStatus,
        currentSessionType,
        cycleCount,
        timeRemaining,
        totalTime,
        startCycle,
        pauseSession,
        resumeSession,
        stopSession,
        todayLogs,
        getDailySummary,
        isLoading,
      }}
    >
      {children}
    </StudyFlowContext.Provider>
  );
};
