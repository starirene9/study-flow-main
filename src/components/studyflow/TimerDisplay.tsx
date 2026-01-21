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
        'whitespace-nowrap overflow-hidden text-center',
        size === 'sm' && 'text-2xl sm:text-3xl',
        size === 'md' && 'text-3xl sm:text-4xl',
        size === 'lg' && 'text-4xl sm:text-5xl md:text-6xl',
        variant === 'focus' ? 'text-primary' : 'text-workout'
      )}
      style={{
        maxWidth: '100%',
        lineHeight: '1.1',
      }}
    >
      {formattedTime}
    </div>
  );
};

export default TimerDisplay;
