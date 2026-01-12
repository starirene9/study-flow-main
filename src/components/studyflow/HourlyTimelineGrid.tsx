import React from 'react';
import { cn } from '@/lib/utils';
import { HourlyBucket } from '@/types/studyflow';

interface HourlyTimelineGridProps {
  buckets: HourlyBucket[];
}

const HourlyTimelineGrid: React.FC<HourlyTimelineGridProps> = ({ buckets }) => {
  const currentHour = new Date().getHours();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>
      
      <div className="grid grid-cols-24 gap-0.5 sm:gap-1">
        {buckets.map((bucket) => (
          <div
            key={bucket.hour}
            className={cn(
              'h-12 sm:h-16 rounded-sm sm:rounded transition-all duration-200 relative group',
              bucket.dominantType === 'FOCUS' && 'bg-primary',
              bucket.dominantType === 'WORKOUT' && 'bg-workout',
              bucket.dominantType === 'IDLE' && 'bg-idle-soft',
              bucket.hour === currentHour && 'ring-2 ring-foreground/50'
            )}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              <span className="font-medium">{bucket.hour}:00</span>
              {bucket.dominantType !== 'IDLE' && (
                <div className="text-muted-foreground">
                  {bucket.focusMinutes > 0 && <div>Study: {bucket.focusMinutes}m</div>}
                  {bucket.workoutMinutes > 0 && <div>Workout: {bucket.workoutMinutes}m</div>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Study</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-workout" />
          <span className="text-xs text-muted-foreground">Workout</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-idle-soft" />
          <span className="text-xs text-muted-foreground">Idle</span>
        </div>
      </div>
    </div>
  );
};

export default HourlyTimelineGrid;
