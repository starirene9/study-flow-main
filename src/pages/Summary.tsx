import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Brain, Dumbbell, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudyFlow } from '@/context/StudyFlowContext';
import HourlyTimelineGrid from '@/components/studyflow/HourlyTimelineGrid';
import ThemeToggle from '@/components/ThemeToggle';
import type { DailySummary } from '@/types/studyflow';

const Summary = () => {
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
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins} min`;
  };
  
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-2xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">Daily Summary</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <Home className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container max-w-2xl py-6 space-y-8">
        {/* Date */}
        <div className="text-center animate-fade-in">
          <p className="text-muted-foreground">{today}</p>
        </div>
        
        {/* Success Badge */}
        {summary.isSuccess && (
          <div className="flex justify-center animate-scale-in">
            <div className="flex items-center gap-3 px-6 py-3 bg-workout-soft rounded-full shadow-glow-workout">
              <Trophy className="w-6 h-6 text-workout" />
              <span className="font-bold text-workout text-lg">Success Day!</span>
            </div>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 animate-slide-up">
          {/* Focus Card */}
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-soft mx-auto mb-3 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary mb-1">
              {formatTime(summary.totalFocusMinutes)}
            </p>
            <p className="text-sm text-muted-foreground">Total Study Time</p>
          </div>
          
          {/* Workout Card */}
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-workout-soft mx-auto mb-3 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-workout" />
            </div>
            <p className="text-3xl font-bold text-workout mb-1">
              {formatTime(summary.totalWorkoutMinutes)}
            </p>
            <p className="text-sm text-muted-foreground">Total Workout Time</p>
          </div>
        </div>
        
        {/* Cycles */}
        <div className="glass-card rounded-xl p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-5xl font-bold mb-2">{summary.completedCycles}</p>
          <p className="text-muted-foreground">Completed Cycles</p>
        </div>
        
        {/* Hourly Timeline */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-semibold text-center">Today's Timeline</h2>
          <div className="glass-card rounded-xl p-5">
            <HourlyTimelineGrid buckets={summary.hourlyBuckets} />
          </div>
        </section>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4 pb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-workout hover:from-primary-glow hover:to-workout-glow"
          >
            Start New Cycle
          </Button>
        </div>
        
        {/* Empty State */}
        {summary.totalFocusMinutes === 0 && summary.totalWorkoutMinutes === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No sessions yet</p>
            <p className="text-muted-foreground">
              Start your first focus cycle to see your progress here
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Summary;
