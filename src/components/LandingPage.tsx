import React from 'react';
import { Link } from 'react-router-dom';
import SpaceBackground from './SpaceBackground';
import Portfolio from './Portfolio';
import AudioPlayer from './AudioPlayer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="fixed inset-0">
        <SpaceBackground />
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 right-0 p-4 flex gap-4 z-50">
        <Link
          to="/auth"
          className="relative px-6 py-2 rounded-lg bg-green-600/80 text-white hover:bg-green-700/80 transition-colors backdrop-blur-sm cursor-pointer"
        >
          Sign In
        </Link>
      </nav>
      
      {/* Content Layer */}
      <div className="relative z-20">
        <Portfolio />
      </div>

      <AudioPlayer />
    </div>
  );
} 