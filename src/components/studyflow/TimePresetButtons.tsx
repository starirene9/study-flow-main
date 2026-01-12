import React from 'react';
import { cn } from '@/lib/utils';

interface TimePresetButtonsProps {
  options: readonly number[];
  selected: number;
  onSelect: (value: number) => void;
  unit?: string;
  variant?: 'focus' | 'workout';
}

const TimePresetButtons: React.FC<TimePresetButtonsProps> = ({
  options,
  selected,
  onSelect,
  unit = 'min',
  variant = 'focus',
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((value) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
            'border-2 hover:scale-105 active:scale-95',
            selected === value
              ? variant === 'focus'
                ? 'bg-primary text-primary-foreground border-primary shadow-glow-primary'
                : 'bg-workout text-workout-foreground border-workout shadow-glow-workout'
              : 'bg-secondary text-secondary-foreground border-transparent hover:border-muted-foreground/20'
          )}
        >
          {value} {unit}
        </button>
      ))}
    </div>
  );
};

export default TimePresetButtons;
