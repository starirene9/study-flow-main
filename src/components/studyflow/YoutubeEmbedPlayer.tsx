import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractVideoId } from '@/lib/storage';
import type { SessionStatus } from '@/types/studyflow';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YoutubeEmbedPlayerProps {
  url: string;
  sessionStatus?: SessionStatus;
}

const YoutubeEmbedPlayer: React.FC<YoutubeEmbedPlayerProps> = ({ url, sessionStatus }) => {
  const { t } = useTranslation();
  const [embedError, setEmbedError] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoId = extractVideoId(url);
  const playerId = `youtube-player-${videoId || 'default'}-${Math.random().toString(36).substr(2, 9)}`;

  // Load YouTube IFrame Player API
  useEffect(() => {
    if (!videoId) return;

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    // Load the API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [videoId]);

  // Initialize player when API is ready
  useEffect(() => {
    if (!isApiReady || !videoId || !containerRef.current) return;

    try {
      playerRef.current = new window.YT.Player(playerId, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onError: () => {
            setEmbedError(true);
          },
        },
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      setEmbedError(true);
    }
  }, [isApiReady, videoId, playerId]);

  // Control video playback based on session status
  useEffect(() => {
    if (!playerRef.current || !sessionStatus) return;

    try {
      if (sessionStatus === 'paused') {
        playerRef.current.pauseVideo();
      } else if (sessionStatus === 'running') {
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Error controlling video:', error);
    }
  }, [sessionStatus]);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-muted rounded-xl flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-center">{t('youtube.invalidUrl')}</p>
        <Button
          variant="outline"
          onClick={() => window.open(url, '_blank')}
          className="gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          {t('youtube.openLink')}
        </Button>
      </div>
    );
  }

  if (embedError) {
    return (
      <div className="w-full aspect-video bg-muted rounded-xl flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="w-12 h-12 text-workout" />
        <p className="text-foreground font-medium text-center">
          {t('youtube.videoCouldntEmbed')}
        </p>
        <p className="text-muted-foreground text-sm text-center">
          {t('youtube.someVideosDontAllow')}
        </p>
        <Button
          onClick={() => window.open(url, '_blank')}
          className="gap-2 bg-workout hover:bg-workout-glow text-workout-foreground"
        >
          <ExternalLink className="w-4 h-4" />
          {t('youtube.openInYouTube')}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-medium bg-black">
      <div ref={containerRef} id={playerId} className="w-full h-full" />
    </div>
  );
};

export default YoutubeEmbedPlayer;
