import React from 'react';
import { Brain, Dumbbell, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DailySummary } from '@/types/studyflow';

interface TodayMiniSummaryProps {
  summary: DailySummary;
}

const TodayMiniSummary: React.FC<TodayMiniSummaryProps> = ({ summary }) => {
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };
  
  return (
    <div className="glass-card rounded-xl p-3 sm:p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Today's Progress</h3>
        {summary.isSuccess && (
          <div className="flex items-center gap-1 text-workout">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs font-medium">Success!</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          </div>
          <p className="text-base sm:text-lg font-bold text-primary">{formatTime(summary.totalFocusMinutes)}</p>
          <p className="text-xs text-muted-foreground">Study</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-workout" />
          </div>
          <p className="text-base sm:text-lg font-bold text-workout">{formatTime(summary.totalWorkoutMinutes)}</p>
          <p className="text-xs text-muted-foreground">Workout</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
              {summary.completedCycles}
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold">{summary.completedCycles}</p>
          <p className="text-xs text-muted-foreground">Cycles</p>
        </div>
      </div>
    </div>
  );
};

export default TodayMiniSummary;
