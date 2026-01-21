import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { FOCUS_PRESETS, WORKOUT_PRESETS, FOCUS_PRESETS_TEST, WORKOUT_PRESETS_TEST, IS_TEST_MODE } from '@/types/studyflow';
import type { DailySummary } from '@/types/studyflow';
import { resetToDefaultColor } from '@/lib/colorTheme';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // 테스트 모드에 따라 프리셋과 최소값 선택
  const focusPresets = IS_TEST_MODE ? FOCUS_PRESETS_TEST : FOCUS_PRESETS;
  const workoutPresets = IS_TEST_MODE ? WORKOUT_PRESETS_TEST : WORKOUT_PRESETS;
  const focusMin = IS_TEST_MODE ? 1 : 30;
  const workoutMin = IS_TEST_MODE ? 1 : 10;
  const focusStep = IS_TEST_MODE ? 1 : 5;
  const workoutStep = IS_TEST_MODE ? 1 : 5;
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
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-2xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-workout flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">StudyFlow</h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Focus. Move. Repeat.</p>
                  {user?.email && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs font-medium text-primary">
                        {user.email}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container max-w-2xl py-6 space-y-8">
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
                View Full Summary →
              </Button>
            </div>
          </section>
        )}
        
        {/* Focus Time */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Focus Time</h2>
            {IS_TEST_MODE && (
              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full font-medium">
                TEST MODE
              </span>
            )}
          </div>
          
          <div className="glass-card rounded-xl p-5 space-y-5">
            <SliderTimePicker
              min={focusMin}
              max={90}
              step={focusStep}
              value={settings.focusMinutes}
              onChange={(value) => updateSettings({ focusMinutes: value })}
              variant="focus"
              label="Duration"
            />
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick Select</p>
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
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-workout" />
            <h2 className="text-lg font-semibold">Workout Time</h2>
          </div>
          
          <div className="glass-card rounded-xl p-5 space-y-5">
            <SliderTimePicker
              min={workoutMin}
              max={30}
              step={workoutStep}
              value={settings.workoutMinutes}
              onChange={(value) => updateSettings({ workoutMinutes: value })}
              variant="workout"
              label="Duration"
            />
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick Select</p>
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
          <div className="glass-card rounded-xl p-5">
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
        <section className="pt-4 pb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button
            onClick={startCycle}
            disabled={!hasActiveVideo}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-workout hover:from-primary-glow hover:to-workout-glow shadow-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Cycle
          </Button>
          
          {!hasActiveVideo && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              Select a workout video to start
            </p>
          )}
          
          <p className="text-center text-xs text-muted-foreground mt-4">
            {settings.focusMinutes} min focus → {settings.workoutMinutes} min workout → repeat
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
