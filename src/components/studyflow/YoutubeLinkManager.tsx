import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { YoutubeLink } from '@/types/studyflow';
import { extractVideoId } from '@/lib/storage';

// Extract duration from video title (e.g., "10 Min", "15min", "20 minute")
const extractDurationFromTitle = (title: string): number | null => {
  const match = title.match(/(\d+)\s*(?:min|분|minute|minutes)/i);
  return match ? parseInt(match[1], 10) : null;
};

interface YoutubeLinkManagerProps {
  links: YoutubeLink[];
  onAdd: (url: string, title?: string) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  workoutMinutes: number;
}

const YoutubeLinkManager: React.FC<YoutubeLinkManagerProps> = ({
  links,
  onAdd,
  onDelete,
  onActivate,
  workoutMinutes,
}) => {
  const [newUrl, setNewUrl] = useState('');
  
  // Filter links based on workout duration
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const videoDuration = extractDurationFromTitle(link.title);
      // Show video if: no duration found in title OR duration <= workout time
      return videoDuration === null || videoDuration <= workoutMinutes;
    });
  }, [links, workoutMinutes]);
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAdd = () => {
    if (newUrl && extractVideoId(newUrl)) {
      onAdd(newUrl, newTitle || undefined);
      setNewUrl('');
      setNewTitle('');
      setIsAdding(false);
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
              disabled={!newUrl || !extractVideoId(newUrl)}
              className="bg-workout hover:bg-workout-glow text-workout-foreground"
            >
              Add
            </Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {filteredLinks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No videos available for {workoutMinutes} min workout. Add a shorter video or increase workout time.
          </p>
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
                onClick={() => onActivate(link.id)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  link.isActive
                    ? 'border-workout bg-workout text-workout-foreground'
                    : 'border-muted-foreground/30 hover:border-workout'
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(link.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YoutubeLinkManager;
