import { useState, useEffect } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const AudioButton = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [audio] = useState(new Audio('/EvilThemed.mp3.mp3')); // Assuming your audio file is in the public folder

  useEffect(() => {
    audio.loop = true;
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  const toggleMute = () => {
    if (isMuted) {
      audio.play();
    } else {
      audio.pause();
    }
    setIsMuted(!isMuted);
  };

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 left-4 p-3 rounded-full bg-green-800/80 text-white hover:bg-gray-700/80 transition-colors backdrop-blur-sm z-50"
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
    </button>
  );
};

export default AudioButton; 