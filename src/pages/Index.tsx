import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Brain, Dumbbell, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudyFlow } from '@/context/StudyFlowContext';
import TimePresetButtons from '@/components/studyflow/TimePresetButtons';
import SliderTimePicker from '@/components/studyflow/SliderTimePicker';
import YoutubeLinkManager from '@/components/studyflow/YoutubeLinkManager';
import TodayMiniSummary from '@/components/studyflow/TodayMiniSummary';
import ThemeToggle from '@/components/ThemeToggle';
import { FOCUS_PRESETS, WORKOUT_PRESETS } from '@/types/studyflow';
import type { DailySummary } from '@/types/studyflow';

const Index = () => {
  const navigate = useNavigate();
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

  const hasActiveVideo = !!activeLink;
  
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
                <p className="text-xs text-muted-foreground">Focus. Move. Repeat.</p>
              </div>
            </div>
            <ThemeToggle />
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
          </div>
          
          <div className="glass-card rounded-xl p-5 space-y-5">
            <SliderTimePicker
              min={30}
              max={90}
              step={5}
              value={settings.focusMinutes}
              onChange={(value) => updateSettings({ focusMinutes: value })}
              variant="focus"
              label="Duration"
            />
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick Select</p>
              <TimePresetButtons
                options={FOCUS_PRESETS}
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
              min={10}
              max={30}
              step={5}
              value={settings.workoutMinutes}
              onChange={(value) => updateSettings({ workoutMinutes: value })}
              variant="workout"
              label="Duration"
            />
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick Select</p>
              <TimePresetButtons
                options={WORKOUT_PRESETS}
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
