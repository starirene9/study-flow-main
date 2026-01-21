import React from 'react';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  timeRemaining: number;
  variant?: 'focus' | 'workout';
  size?: 'sm' | 'md' | 'lg';
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeRemaining,
  variant = 'focus',
  size = 'lg',
}) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  return (
    <div
      className={cn(
        'timer-display font-mono font-semibold tracking-tight',
        size === 'sm' && 'text-2xl sm:text-3xl',
        size === 'md' && 'text-4xl sm:text-5xl',
        size === 'lg' && 'text-5xl sm:text-6xl md:text-7xl',
        variant === 'focus' ? 'text-primary' : 'text-workout'
      )}
    >
      {formattedTime}
    </div>
  );
};

export default TimerDisplay;
