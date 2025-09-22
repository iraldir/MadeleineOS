import { useCallback, useEffect, useState } from 'react';
import { audioService } from '@/services/audioService';

interface UseAudioOptions {
  enableSounds?: boolean;
  volume?: number;
}

export function useAudio(options: UseAudioOptions = {}) {
  const { enableSounds = true, volume = 1.0 } = options;
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [isMuted, setIsMuted] = useState(!enableSounds);

  // Initialize volume
  useEffect(() => {
    audioService.setVolume(currentVolume);
  }, [currentVolume]);

  // Play success sound
  const playSuccess = useCallback(() => {
    if (!isMuted) {
      audioService.playSuccess();
    }
  }, [isMuted]);

  // Play failure sound
  const playFailure = useCallback(() => {
    if (!isMuted) {
      audioService.playFailure();
    }
  }, [isMuted]);

  // Play click sound
  const playClick = useCallback(() => {
    if (!isMuted) {
      audioService.playClick();
    }
  }, [isMuted]);

  // Play complete sound
  const playComplete = useCallback(() => {
    if (!isMuted) {
      audioService.playComplete();
    }
  }, [isMuted]);

  // Play letter sound
  const playLetter = useCallback((letter: string) => {
    if (!isMuted) {
      audioService.playLetter(letter);
    }
  }, [isMuted]);

  // Play custom sound
  const playSound = useCallback((soundName: string) => {
    if (!isMuted) {
      audioService.play(soundName);
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted) {
        audioService.setVolume(0);
      } else {
        audioService.setVolume(currentVolume);
      }
      return newMuted;
    });
  }, [currentVolume]);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setCurrentVolume(clampedVolume);
    
    if (!isMuted) {
      audioService.setVolume(clampedVolume);
    }
    
    // If setting volume > 0, unmute
    if (clampedVolume > 0 && isMuted) {
      setIsMuted(false);
    }
    
    // If setting volume to 0, mute
    if (clampedVolume === 0) {
      setIsMuted(true);
    }
  }, [isMuted]);

  // Stop all sounds
  const stopAll = useCallback(() => {
    audioService.stopAll();
  }, []);

  return {
    // Play functions
    playSuccess,
    playFailure,
    playClick,
    playComplete,
    playLetter,
    playSound,
    
    // Control functions
    toggleMute,
    setVolume,
    stopAll,
    
    // State
    volume: currentVolume,
    isMuted,
  };
}