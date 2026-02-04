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
        'timer-display font-mono tracking-tight',
        'whitespace-nowrap overflow-hidden text-center',
        size === 'sm' && 'text-3xl sm:text-4xl font-bold',
        size === 'md' && 'text-4xl sm:text-5xl font-bold',
        size === 'lg' && 'text-6xl sm:text-7xl md:text-8xl font-black',
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
