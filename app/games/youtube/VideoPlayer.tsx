/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { Video } from "@/services/youtubeService";
import { youtubeService } from "@/services/youtubeService";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

interface VideoPlayerProps {
  video: Video;
  onBack: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoPlayer({ video, onBack }: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      if (!playerRef.current && containerRef.current) {
        const options = youtubeService.getPlayerOptions();
        playerRef.current = new window.YT.Player("youtube-player", {
          videoId: video.youtubeId,
          ...options,
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      }
    };

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    // Update time periodically
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [video.youtubeId]);

  const onPlayerReady = (event: any) => {
    setIsReady(true);
    setDuration(event.target.getDuration());
  };

  const onPlayerStateChange = (event: any) => {
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleRestart = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.playVideo();
  };

  const handleSkipBack = () => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, currentTime - 10);
    playerRef.current.seekTo(newTime);
  };

  const handleSkipForward = () => {
    if (!playerRef.current) return;
    const newTime = Math.min(duration, currentTime + 10);
    playerRef.current.seekTo(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.playerContainer}>
      <div className={styles.videoWrapper}>
        <div
          id="youtube-player"
          ref={containerRef}
          className={styles.player}
        ></div>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.controls}>
          <button
            onClick={handleRestart}
            className={`${styles.controlButton} ${styles.restartButton}`}
            disabled={!isReady}
            title="Start Over"
          >
            <RotateCcw size={20} />
          </button>

          <button
            onClick={handleSkipBack}
            className={`${styles.controlButton} ${styles.skipButton}`}
            disabled={!isReady}
            title="Back 10 seconds"
          >
            <SkipBack size={20} />
            <span className={styles.skipText}>10</span>
          </button>

          <button
            onClick={handlePlayPause}
            className={`${styles.controlButton} ${styles.playPauseButton} ${
              isPlaying ? styles.pauseButton : ""
            }`}
            disabled={!isReady}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={25} /> : <Play size={25} />}
          </button>

          <button
            onClick={handleSkipForward}
            className={`${styles.controlButton} ${styles.skipButton}`}
            disabled={!isReady}
            title="Forward 10 seconds"
          >
            <SkipForward size={20} />
            <span className={styles.skipText}>10</span>
          </button>
        </div>
      </div>
    </div>
  );
}
