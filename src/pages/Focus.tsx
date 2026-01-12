import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudyFlow } from '@/context/StudyFlowContext';
import SessionHeader from '@/components/studyflow/SessionHeader';
import TimerDisplay from '@/components/studyflow/TimerDisplay';
import ProgressRing from '@/components/studyflow/ProgressRing';
import SessionControls from '@/components/studyflow/SessionControls';

const Focus = () => {
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
  } = useStudyFlow();
  
  // Redirect if not in active session
  useEffect(() => {
    if (sessionStatus === 'idle' || sessionStatus === 'stopped') {
      navigate('/');
    }
  }, [sessionStatus, navigate]);
  
  // Redirect if wrong session type
  useEffect(() => {
    if (currentSessionType === 'WORKOUT' && sessionStatus === 'running') {
      navigate('/workout');
    }
  }, [currentSessionType, sessionStatus, navigate]);
  
  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-soft via-background to-background pointer-events-none" />
      
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-scale-in">
          {/* Session Info */}
          <SessionHeader cycleCount={cycleCount} sessionType="FOCUS" />
          
          {/* Timer Ring */}
          <ProgressRing percent={progress} variant="focus">
            <TimerDisplay timeRemaining={timeRemaining} variant="focus" />
            <p className="text-sm text-muted-foreground mt-2">
              {sessionStatus === 'paused' ? 'Paused' : 'Stay focused'}
            </p>
          </ProgressRing>
          
          {/* Controls */}
          <SessionControls
            status={sessionStatus}
            onPause={pauseSession}
            onResume={resumeSession}
            onStop={stopSession}
            variant="focus"
          />
          
          {/* Motivational text */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <p className="text-muted-foreground text-sm">
              Deep work in progress. Your workout awaits after this session.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Focus;
