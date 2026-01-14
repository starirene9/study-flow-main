import React, { useState, useMemo } from 'react';
import { Plus, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  workoutMinutes: number;
}

const YoutubeLinkManager: React.FC<YoutubeLinkManagerProps> = ({
  links,
  onAdd,
  onActivate,
  workoutMinutes,
}) => {
  const [newUrl, setNewUrl] = useState('');
  
  // Get default video URLs for comparison
  const defaultVideoUrls = useMemo(() => {
    return new Set(DEFAULT_YOUTUBE_LINKS.map(link => link.url));
  }, []);

  // Filter links to show videos that match workout duration exactly
  const filteredLinks = useMemo(() => {
    // Find all videos that match workout duration exactly
    const matchingVideos = links.filter((link) => {
      const videoDuration = extractDurationFromTitle(link.title);
      return videoDuration === workoutMinutes;
    });
    
    // Separate user-added videos from default videos
    const userAddedVideos = matchingVideos.filter(
      (link) => !defaultVideoUrls.has(link.url)
    );
    const defaultVideos = matchingVideos.filter(
      (link) => defaultVideoUrls.has(link.url)
    );
    
    // If user has added videos, show all user-added videos only
    if (userAddedVideos.length > 0) {
      return userAddedVideos;
    }
    
    // If no user-added videos, show up to 3 random default videos
    if (defaultVideos.length >= 3) {
      const shuffled = [...defaultVideos].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    }
    
    // If less than 3 default videos, return all available
    return defaultVideos;
  }, [links, workoutMinutes, defaultVideoUrls]);
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleAdd = async () => {
    if (newUrl && extractVideoId(newUrl) && !isProcessing) {
      setIsProcessing(true);
      try {
        console.log('Adding video:', newUrl, newTitle);
        await onAdd(newUrl, newTitle || undefined);
        console.log('Video added successfully');
        // Clear form
        setNewUrl('');
        setNewTitle('');
        setIsAdding(false);
        // Note: The parent component should update the links prop
        // which will trigger filteredLinks to recalculate
      } catch (error) {
        console.error('Error adding video:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  const handleActivate = async (id: string) => {
    if (isProcessing) return;
    const currentLink = links.find(l => l.id === id);
    if (currentLink?.isActive) {
      // Already active, no need to do anything
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log('Activating video:', id);
      await onActivate(id);
      console.log('Video activated successfully');
    } catch (error) {
      console.error('Error activating video:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Workout Videos</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="text-workout hover:text-workout-glow"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Video
        </Button>
      </div>
      
      {isAdding && (
        <div className="space-y-2 p-4 bg-muted rounded-lg animate-slide-up">
          <Input
            placeholder="YouTube URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="bg-background"
          />
          <Input
            placeholder="Title (optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-background"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={!newUrl || !extractVideoId(newUrl) || isProcessing}
              className="bg-workout hover:bg-workout-glow text-workout-foreground"
            >
              {isProcessing ? 'Adding...' : 'Add'}
            </Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {filteredLinks.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4 space-y-2">
            <p>No videos found for {workoutMinutes} min workout.</p>
            <p className="text-xs">Please add {workoutMinutes} min workout videos (recommended: 3 different videos).</p>
          </div>
        )}
        {filteredLinks.length > 0 && filteredLinks.length < 3 && 
         filteredLinks.every(link => !defaultVideoUrls.has(link.url)) && (
          <div className="text-xs text-muted-foreground text-center py-2 bg-muted/50 rounded-lg">
            <p>Showing {filteredLinks.length} custom {workoutMinutes} min video(s). Add more for variety!</p>
          </div>
        )}
        {filteredLinks.map((link) => (
          <div
            key={link.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border transition-all',
              link.isActive
                ? 'border-workout bg-workout-soft'
                : 'border-border bg-card hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => handleActivate(link.id)}
                disabled={isProcessing}
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  link.isActive
                    ? 'border-workout bg-workout text-workout-foreground'
                    : 'border-muted-foreground/30 hover:border-workout',
                  isProcessing && 'opacity-50 cursor-not-allowed'
                )}
              >
                {link.isActive && <Check className="w-3 h-3" />}
              </button>
              
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{link.title}</p>
                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => window.open(link.url, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YoutubeLinkManager;
