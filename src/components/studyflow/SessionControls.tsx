import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionStatus } from '@/types/studyflow';

interface SessionControlsProps {
  status: SessionStatus;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  variant?: 'focus' | 'workout';
}

const SessionControls: React.FC<SessionControlsProps> = ({
  status,
  onPause,
  onResume,
  onStop,
  variant = 'focus',
}) => {
  const isPaused = status === 'paused';
  
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <Button
        onClick={isPaused ? onResume : onPause}
        size="lg"
        className={cn(
          'w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all duration-200 touch-manipulation',
          variant === 'focus'
            ? 'bg-primary hover:bg-primary-glow shadow-glow-primary'
            : 'bg-workout hover:bg-workout-glow shadow-glow-workout'
        )}
      >
        {isPaused ? (
          <Play className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </Button>
      
      <Button
        onClick={onStop}
        size="lg"
        variant="outline"
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive touch-manipulation"
      >
        <Square className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </div>
  );
};

export default SessionControls;
