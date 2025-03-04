import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  volume: number;
  setVolume: (value: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/EvilThemed.mp3'); // Adjust path as needed
      audioRef.current.loop = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return (
    <AudioContext.Provider value={{ isPlaying, togglePlay, volume, setVolume }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
} 