/**
 * Beep sound using Web Audio API
 * Plays a beep sound when session transitions
 */
export const playBeepSound = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Beep sound: 800Hz for 200ms
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    // Fade out to avoid clicking
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.error('Error playing beep sound:', error);
    // Fallback: try using HTML5 Audio if Web Audio API is not available
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZURAJR6Hh8sVtJAUwgM3y2Yk3CBlo');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if audio cannot play
      });
    } catch (fallbackError) {
      // Silently fail if audio cannot be played
      console.warn('Audio playback not available');
    }
  }
};

