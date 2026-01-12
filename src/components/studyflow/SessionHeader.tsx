import React from 'react';
import { cn } from '@/lib/utils';
import { Brain, Dumbbell } from 'lucide-react';
import { SessionType } from '@/types/studyflow';

interface SessionHeaderProps {
  cycleCount: number;
  sessionType: SessionType;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({ cycleCount, sessionType }) => {
  const isFocus = sessionType === 'FOCUS';
  
  return (
    <div className="flex flex-col items-center gap-2 animate-fade-in">
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
          isFocus 
            ? 'bg-primary-soft text-primary' 
            : 'bg-workout-soft text-workout'
        )}
      >
        {isFocus ? (
          <Brain className="w-4 h-4" />
        ) : (
          <Dumbbell className="w-4 h-4" />
        )}
        <span>{isFocus ? 'Focus Session' : 'Workout Session'}</span>
      </div>
      
      <p className="text-muted-foreground text-sm">
        Cycle {cycleCount + 1}
      </p>
    </div>
  );
};

export default SessionHeader;
