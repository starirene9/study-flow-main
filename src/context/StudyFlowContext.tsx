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
} from '@/lib/storage';

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
  
  // Settings
  const [settings, setSettings] = useState<UserSettings>({
    focusMinutes: 60,
    workoutMinutes: 20,
    activeYoutubeUrl: null,
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
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [loadedSettings, loadedLinks, loadedLogs] = await Promise.all([
          getSettings(),
          getYoutubeLinks(),
          getSessionLogs(getTodayDate()),
        ]);
        setSettings(loadedSettings);
        setYoutubeLinks(loadedLinks);
        setTodayLogs(loadedLogs);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);
  
  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettings(updated);
  }, [settings]);
  
  // YouTube Link management
  const addYoutubeLink = useCallback(async (url: string, title?: string) => {
    await addLinkStorage(url, title);
    const updatedLinks = await getYoutubeLinks();
    setYoutubeLinks(updatedLinks);
  }, []);
  
  const deleteYoutubeLink = useCallback(async (id: string) => {
    await deleteLinkStorage(id);
    const updatedLinks = await getYoutubeLinks();
    setYoutubeLinks(updatedLinks);
  }, []);
  
  const activateYoutubeLink = useCallback(async (id: string) => {
    await activateLinkStorage(id);
    const [updatedLinks, updatedSettings] = await Promise.all([
      getYoutubeLinks(),
      getSettings(),
    ]);
    setYoutubeLinks(updatedLinks);
    setSettings(updatedSettings);
  }, []);
  
  // Log session completion
  const logSession = useCallback(async (type: SessionType, startTime: Date, endTime: Date, videoUrl?: string) => {
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    const log = await saveSessionLog({
      sessionDate: getTodayDate(),
      type,
      startTime,
      endTime,
      durationMinutes,
      youtubeUrl: type === 'WORKOUT' ? videoUrl : undefined,
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
    // Log partial session
    if (sessionStartRef.current) {
      const endTime = new Date();
      const elapsed = (endTime.getTime() - sessionStartRef.current.getTime()) / 1000;
      const sessionDuration = currentSessionType === 'FOCUS' 
        ? settings.focusMinutes * 60 
        : settings.workoutMinutes * 60;
      
      // Only log if significant time passed (at least 1 minute)
      if (elapsed >= 60) {
        await logSession(currentSessionType, sessionStartRef.current, endTime);
      }
    }
    
    setSessionStatus('stopped');
    setTimeRemaining(0);
    sessionStartRef.current = null;
    navigate('/summary');
  }, [currentSessionType, settings, logSession, navigate]);
  
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
