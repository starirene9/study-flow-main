import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Brain, Dumbbell } from 'lucide-react';
import { SessionType } from '@/types/studyflow';

interface SessionHeaderProps {
  cycleCount: number;
  sessionType: SessionType;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({ cycleCount, sessionType }) => {
  const { t } = useTranslation();
  const isFocus = sessionType === 'FOCUS';
  
  return (
    <div className="flex flex-col items-center gap-2 animate-fade-in">
      <div
        className={cn(
          'flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium',
          isFocus 
            ? 'bg-primary-soft text-primary' 
            : 'bg-workout-soft text-workout'
        )}
      >
        {isFocus ? (
          <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : (
          <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )}
        <span>{isFocus ? t('session.focusSession') : t('session.workoutSession')}</span>
      </div>
      
      <p className="text-muted-foreground text-xs sm:text-sm">
        {t('session.cycle')} {cycleCount + 1}
      </p>
    </div>
  );
};

export default SessionHeader;
