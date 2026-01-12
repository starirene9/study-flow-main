import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  percent: number;
  variant?: 'focus' | 'workout';
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  percent,
  variant = 'focus',
  size = 280,
  strokeWidth = 12,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/50"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300 ease-out',
            variant === 'focus' ? 'text-primary' : 'text-workout'
          )}
          style={{
            filter: variant === 'focus' 
              ? 'drop-shadow(0 0 8px hsl(220 70% 50% / 0.5))' 
              : 'drop-shadow(0 0 8px hsl(150 60% 45% / 0.5))',
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ProgressRing;
