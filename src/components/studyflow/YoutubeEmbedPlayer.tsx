import React, { useState } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEmbedUrl, extractVideoId } from '@/lib/storage';

interface YoutubeEmbedPlayerProps {
  url: string;
}

const YoutubeEmbedPlayer: React.FC<YoutubeEmbedPlayerProps> = ({ url }) => {
  const [embedError, setEmbedError] = useState(false);
  const embedUrl = getEmbedUrl(url);
  const videoId = extractVideoId(url);
  
  if (!embedUrl || !videoId) {
    return (
      <div className="w-full aspect-video bg-muted rounded-xl flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-center">Invalid YouTube URL</p>
        <Button
          variant="outline"
          onClick={() => window.open(url, '_blank')}
          className="gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open Link
        </Button>
      </div>
    );
  }
  
  if (embedError) {
    return (
      <div className="w-full aspect-video bg-muted rounded-xl flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="w-12 h-12 text-workout" />
        <p className="text-foreground font-medium text-center">
          Video couldn't be embedded
        </p>
        <p className="text-muted-foreground text-sm text-center">
          Some videos don't allow embedding. Open it directly:
        </p>
        <Button
          onClick={() => window.open(url, '_blank')}
          className="gap-2 bg-workout hover:bg-workout-glow text-workout-foreground"
        >
          <ExternalLink className="w-4 h-4" />
          Open in YouTube
        </Button>
      </div>
    );
  }
  
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-medium bg-black">
      <iframe
        src={embedUrl}
        title="Workout Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        onError={() => setEmbedError(true)}
      />
    </div>
  );
};

export default YoutubeEmbedPlayer;
