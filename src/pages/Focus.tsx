import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useStudyFlow } from '@/context/StudyFlowContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PrimaryColorTheme, COLOR_THEMES } from '@/types/studyflow';
import { applyColorTheme, resetToDefaultColor } from '@/lib/colorTheme';
import SessionHeader from '@/components/studyflow/SessionHeader';
import TimerDisplay from '@/components/studyflow/TimerDisplay';
import ProgressRing from '@/components/studyflow/ProgressRing';
import SessionControls from '@/components/studyflow/SessionControls';

const Focus = () => {
  const navigate = useNavigate();
  const {
    settings,
    updateSettings,
    sessionStatus,
    currentSessionType,
    cycleCount,
    timeRemaining,
    totalTime,
    pauseSession,
    resumeSession,
    stopSession,
  } = useStudyFlow();
  
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState(settings.customFocusMessage || '');
  const currentTheme = settings.primaryColorTheme || 'blue';
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
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
  
  // 색상 테마 적용 (Focus 페이지에 마운트될 때)
  useEffect(() => {
    applyColorTheme(currentTheme);
    
    // 컴포넌트가 unmount될 때 기본 색상으로 복원
    return () => {
      resetToDefaultColor();
    };
  }, [currentTheme]);
  
  // 다크 모드 변경 감지 및 색상 재적용
  useEffect(() => {
    const handleThemeChange = () => {
      // 다크 모드가 변경되면 색상 테마를 다시 적용
      applyColorTheme(currentTheme);
    };
    
    // 다크 모드 클래스 변경 감지
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, [currentTheme]);
  
  // 커스텀 메시지 동기화
  useEffect(() => {
    setCustomMessage(settings.customFocusMessage || '');
  }, [settings.customFocusMessage]);
  
  // Prevent hydration mismatch for theme
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleColorChange = (theme: PrimaryColorTheme) => {
    updateSettings({ primaryColorTheme: theme });
    applyColorTheme(theme);
  };
  
  const handleMessageChange = (message: string) => {
    setCustomMessage(message);
    updateSettings({ customFocusMessage: message });
  };
  
  const handleSoundToggle = (enabled: boolean) => {
    updateSettings({ soundEnabled: enabled });
  };
  
  const displayMessage = sessionStatus === 'paused' 
    ? 'Paused' 
    : (settings.customFocusMessage || 'Stay focused');
  
  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Settings and Dark Mode Buttons */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-2">
        {/* Dark Mode Toggle */}
        {mounted && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground hover:text-foreground touch-manipulation"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Settings Button */}
        <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground hover:text-foreground touch-manipulation"
                >
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-[calc(100vw-2rem)] sm:w-72 max-w-sm" align="end">
            <div className="space-y-5">
              {/* Color Theme Section */}
              <div>
                <h4 className="font-medium text-sm mb-1">Color Theme</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Choose your preferred focus color
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {(Object.keys(COLOR_THEMES) as PrimaryColorTheme[]).map((theme) => {
                    const config = COLOR_THEMES[theme];
                    const isSelected = currentTheme === theme;
                    return (
                      <button
                        key={theme}
                        onClick={() => handleColorChange(theme)}
                        className={`
                          relative w-12 h-12 rounded-full border-2 transition-all cursor-pointer
                          ${isSelected 
                            ? 'border-foreground scale-110 ring-2 ring-primary ring-offset-2 shadow-md' 
                            : 'border-border hover:border-foreground/50 hover:scale-105 hover:shadow-sm'
                          }
                        `}
                        style={{
                          backgroundColor: `hsl(${config.hue} ${config.saturation}% ${config.lightness}%)`,
                        }}
                        title={config.name}
                        aria-label={`Select ${config.name} theme`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Selected: <span className="font-medium text-foreground">{COLOR_THEMES[currentTheme].name}</span>
                </p>
              </div>
              
              {/* Custom Message Section */}
              <div className="pt-3 border-t">
                <Label htmlFor="custom-message" className="text-sm font-medium mb-2 block">
                  Custom Message
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Set a personalized message to display during focus sessions
                </p>
                <Input
                  id="custom-message"
                  type="text"
                  value={customMessage}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder="Stay focused"
                  maxLength={50}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {customMessage.length}/50 characters
                </p>
              </div>
              
              {/* Sound Settings Section */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound-toggle" className="text-sm font-medium">
                      Sound Notification
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Play beep sound when session completes
                    </p>
                  </div>
                  <Switch
                    id="sound-toggle"
                    checked={settings.soundEnabled !== false}
                    onCheckedChange={handleSoundToggle}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 sm:gap-8 animate-scale-in">
          {/* Session Info */}
          <SessionHeader cycleCount={cycleCount} sessionType="FOCUS" />
          
          {/* Timer Ring */}
          <div className="w-full flex justify-center">
            <ProgressRing 
              percent={progress} 
              variant="focus"
              size={280}
              strokeWidth={12}
              className="w-[240px] h-[240px] sm:w-[280px] sm:h-[280px]"
            >
              <TimerDisplay timeRemaining={timeRemaining} variant="focus" size="lg" />
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 px-2 text-center max-w-full">
                {displayMessage}
              </p>
            </ProgressRing>
          </div>
          
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
