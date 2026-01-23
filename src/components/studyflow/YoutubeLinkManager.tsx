import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { YoutubeLink, DEFAULT_YOUTUBE_LINKS } from '@/types/studyflow';
import { extractVideoId } from '@/lib/storage';

// Extract duration from video title (e.g., "10 Min", "15min", "20 minute")
const extractDurationFromTitle = (title: string): number | null => {
  const match = title.match(/(\d+)\s*(?:min|분|minute|minutes)/i);
  return match ? parseInt(match[1], 10) : null;
};

interface YoutubeLinkManagerProps {
  links: YoutubeLink[];
  onAdd: (url: string, title?: string) => Promise<void>;
  onActivate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  workoutMinutes: number;
}

const YoutubeLinkManager: React.FC<YoutubeLinkManagerProps> = ({
  links,
  onAdd,
  onActivate,
  onDelete,
  workoutMinutes,
}) => {
  const { t } = useTranslation();
  const [newUrl, setNewUrl] = useState('');
  
  // Get default video URLs for comparison
  const defaultVideoUrls = useMemo(() => {
    return new Set(DEFAULT_YOUTUBE_LINKS.map(link => link.url));
  }, []);

  // Store stable order for each workout duration using useRef to avoid infinite loops
  // This ensures videos don't reorder when clicking
  const stableOrderMapRef = useRef<Map<number, YoutubeLink[]>>(new Map());

  // Filter links to show videos that match workout duration exactly
  const filteredLinks = useMemo(() => {
    console.log('Filtering links:', { 
      totalLinks: links.length, 
      workoutMinutes,
      links: links.map(l => ({ title: l.title, url: l.url, isDefault: defaultVideoUrls.has(l.url) }))
    });
    
    // Separate user-added videos from default videos first
    const userAddedVideos = links.filter(
      (link) => !defaultVideoUrls.has(link.url)
    );
    const defaultVideos = links.filter(
      (link) => defaultVideoUrls.has(link.url)
    );
    
    console.log('Separated:', { 
      userAdded: userAddedVideos.length, 
      default: defaultVideos.length 
    });
    
    // Filter default videos by duration (must match exactly)
    const matchingDefaultVideos = defaultVideos.filter((link) => {
      const videoDuration = extractDurationFromTitle(link.title);
      return videoDuration === workoutMinutes;
    });
    
    // For user-added videos, filter by duration to match workout time
    // Only show user-added videos that match the current workout duration
    const matchingUserVideos = userAddedVideos.filter((link) => {
      const videoDuration = extractDurationFromTitle(link.title);
      // If duration is found, it must match exactly
      // If no duration found, don't show it (user should have selected duration when adding)
      return videoDuration === workoutMinutes;
    });
    
    console.log('After duration filter:', { 
      matchingUser: matchingUserVideos.length,
      matchingDefault: matchingDefaultVideos.length,
      userVideos: matchingUserVideos.map(v => ({ title: v.title, duration: extractDurationFromTitle(v.title) }))
    });
    
    // Check if we have a stable order for this duration
    const existingOrder = stableOrderMapRef.current.get(workoutMinutes);
    
    // If we have an existing order and the video IDs match, use the stable order
    if (existingOrder) {
      const existingIds = new Set(existingOrder.map(v => v.id));
      const currentIds = new Set([...matchingDefaultVideos, ...matchingUserVideos].map(v => v.id));
      
      // Check if the sets are the same (same videos)
      if (existingIds.size === currentIds.size && 
          [...existingIds].every(id => currentIds.has(id))) {
        // Reconstruct order using current video data but maintaining stable order
        const orderMap = new Map(existingOrder.map(v => [v.id, v]));
        const orderedVideos = existingOrder
          .map(v => {
            const current = [...matchingDefaultVideos, ...matchingUserVideos].find(l => l.id === v.id);
            return current || v;
          })
          .filter(v => {
            // Only include videos that still match the duration
            const videoDuration = extractDurationFromTitle(v.title);
            return videoDuration === workoutMinutes;
          });
        
        // Add any new videos that weren't in the stable order
        const newVideos = [...matchingDefaultVideos, ...matchingUserVideos].filter(
          v => !orderMap.has(v.id)
        );
        
        return [...orderedVideos, ...newVideos];
      }
    }
    
    // No stable order exists or videos have changed - create new stable order
    let defaultVideosToShow: YoutubeLink[] = [];
    
    // Select up to 3 default videos (use stable sort by ID instead of random)
    if (matchingDefaultVideos.length >= 3) {
      // Sort by ID for consistent ordering, then take first 3
      const sorted = [...matchingDefaultVideos].sort((a, b) => a.id.localeCompare(b.id));
      defaultVideosToShow = sorted.slice(0, 3);
    } else {
      // If less than 3 default videos, use all available
      defaultVideosToShow = matchingDefaultVideos;
    }
    
    // Sort user-added videos by created_at for consistent ordering
    const sortedUserVideos = [...matchingUserVideos].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    
    // Combine default videos with user-added videos
    const combined = [...defaultVideosToShow, ...sortedUserVideos];
    
    return combined;
  }, [links, workoutMinutes, defaultVideoUrls]);

  // Store stable order in useEffect to avoid infinite loop
  useEffect(() => {
    if (filteredLinks.length > 0) {
      const existingOrder = stableOrderMapRef.current.get(workoutMinutes);
      // Only update if the order has actually changed
      if (!existingOrder || 
          existingOrder.length !== filteredLinks.length ||
          existingOrder.some((v, i) => v.id !== filteredLinks[i]?.id)) {
        stableOrderMapRef.current.set(workoutMinutes, [...filteredLinks]); // Create a copy to avoid reference issues
      }
    }
  }, [filteredLinks, workoutMinutes]);
  const [newTitle, setNewTitle] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const durationOptions = [5, 10, 15, 20, 25, 30];
  
  const handleAdd = async () => {
    if (newUrl && extractVideoId(newUrl) && selectedDuration && !isProcessing) {
      setIsProcessing(true);
      try {
        const duration = parseInt(selectedDuration, 10);
        console.log('YoutubeLinkManager: Adding video', { url: newUrl, title: newTitle, duration });
        
        // Create title with selected duration
        let finalTitle = newTitle?.trim() || undefined;
        if (finalTitle) {
          // Ensure title starts with duration
          if (!extractDurationFromTitle(finalTitle)) {
            finalTitle = `${duration} Min ${finalTitle}`;
          }
        } else {
          // Generate default title with duration
          finalTitle = `${duration} Min Workout Video`;
        }
        
        console.log('YoutubeLinkManager: Calling onAdd with', { url: newUrl, title: finalTitle });
        await onAdd(newUrl, finalTitle);
        console.log('YoutubeLinkManager: onAdd completed');
        
        // Clear form
        setNewUrl('');
        setNewTitle('');
        setSelectedDuration('');
        setIsAdding(false);
        
        // Wait a bit for parent state to update
        await new Promise(resolve => setTimeout(resolve, 400));
        console.log('YoutubeLinkManager: State should be updated now');
      } catch (error) {
        console.error('Error adding video:', error);
        // Show error message to user
        if (error instanceof Error && error.message === 'This video URL already exists') {
          alert(t('youtube.duplicateUrl') || 'This video URL already exists');
        } else {
          alert(t('youtube.addError') || 'Failed to add video. Please try again.');
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  const handleActivate = async (id: string) => {
    const currentLink = links.find(l => l.id === id);
    if (currentLink?.isActive) {
      // Already active, no need to do anything
      return;
    }
    
    // Verify that the video duration matches the current workout duration
    const videoDuration = extractDurationFromTitle(currentLink?.title || '');
    if (videoDuration !== workoutMinutes) {
      console.warn(`Video duration (${videoDuration} min) does not match workout duration (${workoutMinutes} min)`);
      // Don't activate if duration doesn't match
      return;
    }
    
    // Optimistically update UI immediately without showing disabled state
    // Call onActivate in background without blocking UI
    onActivate(id).catch((error) => {
      console.error('Error activating video:', error);
      // Optionally show error toast here if needed
    });
  };

  const handleDelete = async (id: string) => {
    // Check if deleting would leave less than 3 unique videos for this duration
    const videosForDuration = filteredLinks.filter(link => {
      const videoDuration = extractDurationFromTitle(link.title);
      return videoDuration === workoutMinutes;
    });
    
    // Count unique video IDs/URLs for this duration
    const uniqueVideoIds = new Set<string>();
    for (const link of videosForDuration) {
      const videoId = extractVideoId(link.url);
      if (videoId) {
        uniqueVideoIds.add(videoId);
      } else {
        uniqueVideoIds.add(link.url.trim());
      }
    }
    
    // Get the video to delete
    const linkToDelete = links.find(l => l.id === id);
    if (!linkToDelete) return;
    
    const videoIdToDelete = extractVideoId(linkToDelete.url);
    const identifierToDelete = videoIdToDelete || linkToDelete.url.trim();
    
    // Check if this is the only video with this ID/URL in the duration
    const videosWithSameId = videosForDuration.filter(link => {
      const videoId = extractVideoId(link.url);
      const identifier = videoId || link.url.trim();
      return identifier === identifierToDelete;
    });
    
    // If this is the only unique video with this ID and we'd have less than 3 after deletion, prevent deletion
    if (videosWithSameId.length === 1 && uniqueVideoIds.size <= 3) {
      alert(t('youtube.minimumVideosRequired', { duration: workoutMinutes }) || `You must have at least 3 different videos for ${workoutMinutes} minutes. Cannot delete this video.`);
      return;
    }
    
    // Confirm before deleting
    if (window.confirm(t('youtube.delete'))) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium text-foreground text-sm sm:text-base">{t('youtube.workoutVideos')}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="text-workout hover:text-workout-glow touch-manipulation h-9 sm:h-10"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">{t('youtube.addVideo')}</span>
          <span className="sm:hidden">{t('youtube.add')}</span>
        </Button>
      </div>
      
      {isAdding && (
        <div className="space-y-3 p-3 sm:p-4 bg-muted rounded-lg animate-slide-up">
          <div className="space-y-2">
            <Label htmlFor="duration-select" className="text-sm font-medium">
              {t('youtube.selectDuration')} *
            </Label>
            <Select
              value={selectedDuration}
              onValueChange={setSelectedDuration}
              required
            >
              <SelectTrigger id="duration-select" className="bg-background">
                <SelectValue placeholder={t('youtube.selectDuration')} />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((duration) => (
                  <SelectItem key={duration} value={duration.toString()}>
                    {duration} {t('youtube.min')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="youtube-url" className="text-sm font-medium">
              {t('youtube.videoUrl')} *
            </Label>
            <Input
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="bg-background"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="video-title" className="text-sm font-medium">
              {t('youtube.videoTitle')} ({t('youtube.optional')})
            </Label>
            <Input
              id="video-title"
              placeholder={t('youtube.videoTitle')}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-background"
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleAdd}
              disabled={!newUrl || !extractVideoId(newUrl) || !selectedDuration || isProcessing}
              className="bg-workout hover:bg-workout-glow text-workout-foreground h-10 sm:h-11 touch-manipulation flex-1"
            >
              {isProcessing ? t('youtube.add') + '...' : t('youtube.add')}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsAdding(false);
                setNewUrl('');
                setNewTitle('');
                setSelectedDuration('');
              }}
              className="h-10 sm:h-11 touch-manipulation"
            >
              {t('youtube.cancel')}
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {filteredLinks.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4 space-y-2">
            <p>{t('youtube.noVideos', { duration: workoutMinutes })}</p>
            <p className="text-xs text-destructive mt-2">{t('youtube.minimumVideosWarning', { duration: workoutMinutes })}</p>
          </div>
        )}
        {(() => {
          // Count unique video IDs/URLs for this duration
          const uniqueVideoIds = new Set<string>();
          for (const link of filteredLinks) {
            const videoId = extractVideoId(link.url);
            if (videoId) {
              uniqueVideoIds.add(videoId);
            } else {
              uniqueVideoIds.add(link.url.trim());
            }
          }
          
          const uniqueCount = uniqueVideoIds.size;
          
          if (uniqueCount > 0 && uniqueCount < 3) {
            return (
              <div className="text-xs text-destructive text-center py-2 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="font-medium">{t('youtube.minimumVideosWarning', { duration: workoutMinutes })}</p>
                <p className="mt-1">{t('youtube.currentVideoCount', { count: uniqueCount, required: 3 })}</p>
              </div>
            );
          }
          
          if (filteredLinks.length > 0 && filteredLinks.length < 3 && 
              filteredLinks.every(link => !defaultVideoUrls.has(link.url))) {
            return (
              <div className="text-xs text-muted-foreground text-center py-2 bg-muted/50 rounded-lg">
                <p>{t('youtube.showingCustomVideos', { count: filteredLinks.length, duration: workoutMinutes })}</p>
              </div>
            );
          }
          
          return null;
        })()}
        {filteredLinks.map((link) => (
            <div
            key={link.id}
            className={cn(
              'flex items-center justify-between p-2.5 sm:p-3 rounded-lg border transition-all',
              link.isActive
                ? 'border-workout bg-workout-soft'
                : 'border-border bg-card hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={() => handleActivate(link.id)}
                className={cn(
                  'w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all touch-manipulation min-h-[44px] min-w-[44px]',
                  link.isActive
                    ? 'border-workout bg-workout text-workout-foreground'
                    : 'border-muted-foreground/30 hover:border-workout',
                )}
              >
                {link.isActive && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
              </button>
              
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs sm:text-sm truncate">{link.title}</p>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">{link.url}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground touch-manipulation"
                onClick={() => window.open(link.url, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              {/* Delete button - only show for user-added videos */}
              {!defaultVideoUrls.has(link.url) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-destructive touch-manipulation"
                  onClick={() => handleDelete(link.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YoutubeLinkManager;
