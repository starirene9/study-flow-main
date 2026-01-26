import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { fetchRandomQuote } from '@/lib/quotes';
import SessionHeader from '@/components/studyflow/SessionHeader';
import TimerDisplay from '@/components/studyflow/TimerDisplay';
import ProgressRing from '@/components/studyflow/ProgressRing';
import SessionControls from '@/components/studyflow/SessionControls';

const Focus = () => {
  const { t } = useTranslation();
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
  const [randomQuote, setRandomQuote] = useState<string>('');
  const { i18n } = useTranslation();
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [editingMessage, setEditingMessage] = useState('');
  
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
  
  // Fetch random quote when cycle starts or language changes
  useEffect(() => {
    const loadQuote = async () => {
      try {
        const quote = await fetchRandomQuote(i18n.language);
        setRandomQuote(quote);
      } catch (error) {
        // Silently handle error - no console log
        // Set fallback message
        setRandomQuote(i18n.language === 'ko' 
          ? '집중하고 계속 나아가세요.' 
          : 'Stay focused and keep moving forward.');
      }
    };
    
    // Load quote when cycle count changes (new cycle) or language changes
    if (sessionStatus === 'running' && currentSessionType === 'FOCUS') {
      loadQuote();
    }
  }, [cycleCount, i18n.language, sessionStatus, currentSessionType]);
  
  const handleColorChange = (theme: PrimaryColorTheme) => {
    updateSettings({ primaryColorTheme: theme });
    applyColorTheme(theme);
  };
  
  const handleMessageChange = (message: string) => {
    setCustomMessage(message);
    updateSettings({ customFocusMessage: message });
  };
  
  const handleMessageClick = () => {
    if (sessionStatus === 'paused') return; // Don't allow editing when paused
    setIsEditingMessage(true);
    setEditingMessage(displayMessage);
  };
  
  const handleMessageSave = () => {
    if (editingMessage.trim().length > 0 && editingMessage.trim().length <= 50) {
      handleMessageChange(editingMessage.trim());
    } else {
      setEditingMessage(displayMessage); // Reset to current message if invalid
    }
    setIsEditingMessage(false);
  };
  
  const handleMessageCancel = () => {
    setEditingMessage(displayMessage);
    setIsEditingMessage(false);
  };
  
  const handleMessageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleMessageSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleMessageCancel();
    }
  };
  
  const handleSoundToggle = (enabled: boolean) => {
    updateSettings({ soundEnabled: enabled });
  };
  
  const displayMessage = sessionStatus === 'paused' 
    ? t('focus.paused') 
    : (settings.customFocusMessage || t('focus.stayFocused'));
  
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
              <p>{theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}</p>
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
              <p>{t('common.settings')}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-[calc(100vw-2rem)] sm:w-72 max-w-sm" align="end">
            <div className="space-y-5">
              {/* Color Theme Section */}
              <div>
                <h4 className="font-medium text-sm mb-1">{t('focus.primaryColor')}</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('focus.primaryColorDescription')}
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
                  {t('focus.selected')} <span className="font-medium text-foreground">{COLOR_THEMES[currentTheme].name}</span>
                </p>
              </div>
              
              {/* Custom Message Section */}
              <div className="pt-3 border-t">
                <Label htmlFor="custom-message" className="text-sm font-medium mb-2 block">
                  {t('focus.customMessage')}
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('focus.customMessageDescription')}
                </p>
                <Input
                  id="custom-message"
                  type="text"
                  value={customMessage}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder={t('focus.stayFocused')}
                  maxLength={50}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {customMessage.length}/50 {t('focus.characters')}
                </p>
              </div>
              
              {/* Sound Settings Section */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound-toggle" className="text-sm font-medium">
                      {t('focus.soundNotification')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('focus.soundNotificationDescription')}
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
              {isEditingMessage ? (
                <Input
                  value={editingMessage}
                  onChange={(e) => setEditingMessage(e.target.value)}
                  onBlur={handleMessageSave}
                  onKeyDown={handleMessageKeyDown}
                  maxLength={50}
                  className="text-xs sm:text-sm mt-2 px-2 text-center max-w-full h-8 sm:h-9 bg-background/90 border-primary/50 focus:border-primary"
                  autoFocus
                />
              ) : (
                <p 
                  className="text-xs sm:text-sm text-muted-foreground mt-2 px-2 text-center max-w-full cursor-pointer hover:text-foreground transition-colors"
                  onClick={handleMessageClick}
                  title={sessionStatus === 'paused' ? '' : t('focus.clickToEdit') || 'Click to edit'}
                >
                  {displayMessage}
                </p>
              )}
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
          
          {/* Motivational quote */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <p className="text-muted-foreground text-sm px-4">
              {randomQuote || (i18n.language === 'ko' 
                ? '집중하고 계속 나아가세요.' 
                : 'Stay focused and keep moving forward.')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Focus;
