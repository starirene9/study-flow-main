import React from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SliderTimePickerProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  variant?: 'focus' | 'workout';
  label?: string;
}

const SliderTimePicker: React.FC<SliderTimePickerProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  variant = 'focus',
  label,
}) => {
  return (
    <div className="space-y-4">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span
            className={cn(
              'text-2xl font-bold font-mono',
              variant === 'focus' ? 'text-primary' : 'text-workout'
            )}
          >
            {value} min
          </span>
        </div>
      )}
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className={cn(
          'cursor-pointer',
          variant === 'focus' 
            ? '[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.bg-primary]:bg-primary' 
            : '[&_[role=slider]]:bg-workout [&_[role=slider]]:border-workout [&_.bg-primary]:bg-workout'
        )}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} min</span>
        <span>{max} min</span>
      </div>
    </div>
  );
};

export default SliderTimePicker;
