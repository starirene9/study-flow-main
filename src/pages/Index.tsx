import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play, Brain, Dumbbell, Zap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useStudyFlow } from '@/context/StudyFlowContext';
import { useAuth } from '@/context/AuthContext';
import TimePresetButtons from '@/components/studyflow/TimePresetButtons';
import SliderTimePicker from '@/components/studyflow/SliderTimePicker';
import YoutubeLinkManager from '@/components/studyflow/YoutubeLinkManager';
import TodayMiniSummary from '@/components/studyflow/TodayMiniSummary';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { FOCUS_PRESETS, WORKOUT_PRESETS } from '@/types/studyflow';
import type { DailySummary } from '@/types/studyflow';
import { resetToDefaultColor } from '@/lib/colorTheme';

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // 프리셋과 최소값 설정
  const focusPresets = FOCUS_PRESETS;
  const workoutPresets = WORKOUT_PRESETS;
  const focusMin = 25;
  const workoutMin = 5;
  const focusStep = 5;
  const workoutStep = 5;
  const {
    settings,
    updateSettings,
    youtubeLinks,
    addYoutubeLink,
    deleteYoutubeLink,
    activateYoutubeLink,
    activeLink,
    startCycle,
    getDailySummary,
  } = useStudyFlow();
  
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

  // Index 페이지가 마운트될 때 기본 색상으로 복원
  useEffect(() => {
    resetToDefaultColor();
  }, []);

  const hasActiveVideo = !!activeLink;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      // Silently handle error - no console log
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border pt-safe">
        <div className="container max-w-2xl px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-workout flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold truncate">StudyFlow</h1>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{t('index.tagline')}</p>
                  {user?.email && (
                    <>
                      <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                      <p className="text-xs font-medium text-primary truncate max-w-[120px] sm:max-w-none">
                        {user.email}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {user && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground touch-manipulation"
                    >
                      <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('common.signOut')}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container max-w-2xl px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Today's Summary */}
        {(summary.totalFocusMinutes > 0 || summary.totalWorkoutMinutes > 0) && (
          <section className="animate-fade-in">
            <TodayMiniSummary summary={summary} />
            <div className="mt-3 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/summary')}
                className="text-muted-foreground hover:text-foreground"
              >
                {t('index.viewFullSummary')}
              </Button>
            </div>
          </section>
        )}
        
        {/* Focus Time */}
        <section className="space-y-3 sm:space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <Brain className="w-5 h-5 text-primary flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold">{t('index.focusTime')}</h2>
          </div>
          
          <div className="glass-card rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-5">
            <SliderTimePicker
              min={focusMin}
              max={90}
              step={focusStep}
              value={settings.focusMinutes}
              onChange={(value) => updateSettings({ focusMinutes: value })}
              variant="focus"
              label={t('index.duration')}
            />
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('index.quickSelect')}</p>
              <TimePresetButtons
                options={focusPresets}
                selected={settings.focusMinutes}
                onSelect={(value) => updateSettings({ focusMinutes: value })}
                variant="focus"
              />
            </div>
          </div>
        </section>
        
        {/* Workout Time */}
        <section className="space-y-3 sm:space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-workout flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold">{t('index.workoutTime')}</h2>
          </div>
          
          <div className="glass-card rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-5">
            <SliderTimePicker
              min={workoutMin}
              max={30}
              step={workoutStep}
              value={settings.workoutMinutes}
              onChange={(value) => updateSettings({ workoutMinutes: value })}
              variant="workout"
              label={t('index.duration')}
            />
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('index.quickSelect')}</p>
              <TimePresetButtons
                options={workoutPresets}
                selected={settings.workoutMinutes}
                onSelect={(value) => updateSettings({ workoutMinutes: value })}
                variant="workout"
              />
            </div>
          </div>
        </section>
        
        {/* YouTube Links */}
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass-card rounded-xl p-4 sm:p-5">
            <YoutubeLinkManager
              links={youtubeLinks}
              onAdd={addYoutubeLink}
              onActivate={activateYoutubeLink}
              onDelete={deleteYoutubeLink}
              workoutMinutes={settings.workoutMinutes}
            />
          </div>
        </section>
        
        {/* Start Button */}
        <section className="pt-2 sm:pt-4 pb-6 sm:pb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button
            onClick={startCycle}
            disabled={!hasActiveVideo}
            size="lg"
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-workout hover:from-primary-glow hover:to-workout-glow shadow-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {t('index.startCycle')}
          </Button>
          
          {!hasActiveVideo && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              {t('index.selectWorkoutVideo')}
            </p>
          )}
          
          <p className="text-center text-xs text-muted-foreground mt-4">
            {t('index.cycleDescription', { focus: settings.focusMinutes, workout: settings.workoutMinutes })}
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
