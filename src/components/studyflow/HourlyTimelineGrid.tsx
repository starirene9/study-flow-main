import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { HourlyBucket } from '@/types/studyflow';

interface HourlyTimelineGridProps {
  buckets: HourlyBucket[];
}

const HourlyTimelineGrid: React.FC<HourlyTimelineGridProps> = ({ buckets }) => {
  const { t } = useTranslation();
  const currentHour = new Date().getHours();
  const maxMinutes = 60; // Maximum minutes per hour for scaling
  
  // Sort buckets by hour
  const sortedBuckets = [...buckets].sort((a, b) => a.hour - b.hour);
  
  // Find max value for scaling
  const maxValue = Math.max(
    ...sortedBuckets.map(b => Math.max(b.focusMinutes, b.workoutMinutes)),
    1
  );
  
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour} ${period}`;
  };
  
  const getBarHeight = (minutes: number) => {
    if (minutes === 0) return 0;
    return Math.max((minutes / maxValue) * 100, 2); // Minimum 2% for visibility
  };
  
  return (
    <div className="space-y-4">
      {/* Y-axis labels */}
      <div className="flex items-end justify-between px-2">
        <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground">
          <span>{Math.round(maxValue)}m</span>
          <span className="opacity-0">0m</span>
        </div>
        <div className="flex-1"></div>
        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
          <span>{Math.round(maxValue / 2)}m</span>
          <span>0m</span>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="relative">
        {/* Y-axis grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <div
              key={ratio}
              className="border-t border-border/30"
              style={{ marginTop: ratio === 0 ? 0 : '-1px' }}
            />
          ))}
        </div>
        
        {/* Bars */}
        <div className="flex items-end justify-between gap-1 sm:gap-2 px-2 pb-2" style={{ minHeight: '200px' }}>
          {sortedBuckets.map((bucket) => {
            const isCurrentHour = bucket.hour === currentHour;
            const focusHeight = getBarHeight(bucket.focusMinutes);
            const workoutHeight = getBarHeight(bucket.workoutMinutes);
            
            return (
              <div
                key={bucket.hour}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 group relative',
                  isCurrentHour && 'ring-2 ring-foreground/30 rounded-lg p-1 -m-1'
                )}
              >
                {/* Bars Container */}
                <div className="flex items-end gap-0.5 sm:gap-1 w-full justify-center" style={{ height: '200px' }}>
                  {/* Study Bar (Blue) */}
                  <div
                    className={cn(
                      'w-full bg-primary rounded-t transition-all duration-300 relative group/bar',
                      bucket.focusMinutes > 0 && 'min-h-[4px]'
                    )}
                    style={{
                      height: `${focusHeight}%`,
                      maxHeight: '100%',
                    }}
                  >
                    {/* Tooltip for Study */}
                    {bucket.focusMinutes > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-medium opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        <div className="font-medium">{t('summary.totalStudyTime')}: {Math.round(bucket.focusMinutes * 60)}s</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Workout Bar (Green) */}
                  <div
                    className={cn(
                      'w-full bg-workout rounded-t transition-all duration-300 relative group/bar',
                      bucket.workoutMinutes > 0 && 'min-h-[4px]'
                    )}
                    style={{
                      height: `${workoutHeight}%`,
                      maxHeight: '100%',
                    }}
                  >
                    {/* Tooltip for Workout */}
                    {bucket.workoutMinutes > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-medium opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        <div className="font-medium">{t('summary.totalWorkoutTime')}: {Math.round(bucket.workoutMinutes * 60)}s</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* X-axis label (Hour) */}
                <div className={cn(
                  'text-xs sm:text-sm font-medium mt-1',
                  isCurrentHour ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {formatHour(bucket.hour)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2 border-t border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-xs sm:text-sm text-muted-foreground">{t('summary.totalStudyTime')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-workout" />
          <span className="text-xs sm:text-sm text-muted-foreground">{t('summary.totalWorkoutTime')}</span>
        </div>
      </div>
    </div>
  );
};

export default HourlyTimelineGrid;
