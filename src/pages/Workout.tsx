import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudyFlow } from '@/context/StudyFlowContext';
import SessionHeader from '@/components/studyflow/SessionHeader';
import TimerDisplay from '@/components/studyflow/TimerDisplay';
import ProgressRing from '@/components/studyflow/ProgressRing';
import SessionControls from '@/components/studyflow/SessionControls';
import YoutubeEmbedPlayer from '@/components/studyflow/YoutubeEmbedPlayer';

const Workout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    sessionStatus,
    currentSessionType,
    cycleCount,
    timeRemaining,
    totalTime,
    pauseSession,
    resumeSession,
    stopSession,
    currentWorkoutVideo,
  } = useStudyFlow();
  
  // Redirect if not in active session
  useEffect(() => {
    if (sessionStatus === 'idle' || sessionStatus === 'stopped') {
      navigate('/');
    }
  }, [sessionStatus, navigate]);
  
  // Redirect if wrong session type
  useEffect(() => {
    if (currentSessionType === 'FOCUS' && sessionStatus === 'running') {
      navigate('/focus');
    }
  }, [currentSessionType, sessionStatus, navigate]);
  
  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  const workoutUrl = currentWorkoutVideo?.url || '';
  const videoTitle = currentWorkoutVideo?.title || t('workout.standUp');
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Workout background - more energetic */}
      <div className="fixed inset-0 bg-gradient-to-br from-workout-soft via-background to-background pointer-events-none" />
      
      <main className="relative flex-1 flex flex-col px-4 sm:px-6 py-4 sm:py-6 lg:py-12">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 sm:gap-6 animate-scale-in">
          {/* Banner */}
          <div className="bg-workout text-workout-foreground rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 animate-pulse-slow shadow-glow-workout">
            <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base sm:text-lg truncate">{t('workout.standUp')}</p>
              <p className="text-xs sm:text-sm opacity-90 truncate">{videoTitle}</p>
            </div>
          </div>
          
          {/* Session Header */}
          <div className="text-center">
            <SessionHeader cycleCount={cycleCount} sessionType="WORKOUT" />
          </div>
          
          {/* YouTube Player */}
          {workoutUrl && (
            <div className="animate-slide-up">
              <YoutubeEmbedPlayer url={workoutUrl} sessionStatus={sessionStatus} />
              
              <div className="mt-3 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(workoutUrl, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('workout.openInYouTube')}
                </Button>
              </div>
            </div>
          )}
          
          {/* Timer */}
          <div className="flex justify-center">
            <ProgressRing 
              percent={progress} 
              variant="workout" 
              size={180}
              strokeWidth={10}
              className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px]"
            >
              <TimerDisplay timeRemaining={timeRemaining} variant="workout" size="md" />
            </ProgressRing>
          </div>
          
          {/* Controls */}
          <div className="flex justify-center">
            <SessionControls
              status={sessionStatus}
              onPause={pauseSession}
              onResume={resumeSession}
              onStop={stopSession}
              variant="workout"
            />
          </div>
          
          {/* Info */}
          <p className="text-center text-sm text-muted-foreground animate-fade-in">
            {sessionStatus === 'paused' 
              ? t('workout.workoutPaused') 
              : t('workout.keepMoving')
            }
          </p>
        </div>
      </main>
    </div>
  );
};

export default Workout;
