import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Home, Brain, Dumbbell, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudyFlow } from '@/context/StudyFlowContext';
import HourlyTimelineGrid from '@/components/studyflow/HourlyTimelineGrid';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import type { DailySummary } from '@/types/studyflow';

const Summary = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getDailySummary } = useStudyFlow();
  
  const [summary, setSummary] = useState<DailySummary>({
    date: '',
    totalFocusMinutes: 0,
    totalWorkoutMinutes: 0,
    completedCycles: 0,
    isSuccess: false,
    hourlyBuckets: [],
  });

  useEffect(() => {
    const loadSummary = async () => {
      const data = await getDailySummary();
      setSummary(data);
    };
    loadSummary();
  }, [getDailySummary]);
  
  const formatTime = (minutes: number) => {
    // Handle decimal minutes (for second-level precision)
    const totalSeconds = Math.round(minutes * 60);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      if (secs > 0) {
        return `${hrs}h ${mins}m ${secs}s`;
      }
      return `${hrs}h ${mins}m`;
    }
    if (mins > 0) {
      if (secs > 0) {
        return `${mins}m ${secs}s`;
      }
      return `${mins}m`;
    }
    return `${secs}s`;
  };
  
  const today = new Date().toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-2xl px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <h1 className="text-base sm:text-lg font-semibold">{t('summary.dailySummary')}</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <LanguageToggle />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container max-w-2xl px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Date */}
        <div className="text-center animate-fade-in">
          <p className="text-muted-foreground">{today}</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-slide-up">
          {/* Focus Card */}
          <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-soft mx-auto mb-2 sm:mb-3 flex items-center justify-center">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">
              {formatTime(summary.totalFocusMinutes)}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('summary.totalStudyTime')}</p>
          </div>
          
          {/* Workout Card */}
          <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-workout-soft mx-auto mb-2 sm:mb-3 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-workout" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-workout mb-1">
              {formatTime(summary.totalWorkoutMinutes)}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('summary.totalWorkoutTime')}</p>
          </div>
        </div>
        
        {/* Hourly Timeline */}
        <section className="space-y-3 sm:space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-base sm:text-lg font-semibold text-center">{t('summary.todayTimeline')}</h2>
          <div className="glass-card rounded-xl p-3 sm:p-5 overflow-x-auto">
            <HourlyTimelineGrid buckets={summary.hourlyBuckets} />
          </div>
        </section>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2 sm:pt-4 pb-6 sm:pb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-workout hover:from-primary-glow hover:to-workout-glow touch-manipulation"
          >
            {t('summary.startNewCycle')}
          </Button>
        </div>
        
        {/* Empty State */}
        {summary.totalFocusMinutes === 0 && summary.totalWorkoutMinutes === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">{t('summary.noSessions')}</p>
            <p className="text-muted-foreground">
              {t('summary.startFirstCycle')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Summary;
