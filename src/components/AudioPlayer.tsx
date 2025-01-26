import { useState, useRef } from 'react';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div style={styles.container}>
      <audio ref={audioRef} src="/EvilThemed.mp3" loop />
      <button onClick={playAudio} style={styles.button}>
        Play
      </button>
      <button onClick={toggleMute} style={styles.button}>
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '10px',
    left: '10px',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    padding: '10px',
  },
  button: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    marginRight: '5px',
  },
}; 