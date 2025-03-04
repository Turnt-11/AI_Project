import React, { useCallback } from 'react';
import { useAudio } from '../context/AudioContext';

export default function AudioPlayer() {
  const { isPlaying, togglePlay } = useAudio();
  
  // Create hover sound effect
  const playHoverSound = useCallback(() => {
    const hoverSound = new Audio('/sounds/hover.mp3'); // You'll need to create this sound
    hoverSound.volume = 0.2; // Subtle volume
    hoverSound.play();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 p-4 z-50">
      <button
        onClick={togglePlay}
        onMouseEnter={playHoverSound}
        className="p-2 rounded-full bg-green-600/80 text-white hover:bg-green-700/80 transition-colors"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
} 