import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SpaceBackground from './SpaceBackground';
import Portfolio from './Portfolio';
import AudioPlayer from './AudioPlayer';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // Check auth in background
    supabase.auth.getSession().then(() => {
      setAuthChecked(true);
    });
    
    // Set loading to false after a short delay to ensure initial content renders
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Short delay to ensure content is ready
    
    return () => clearTimeout(timer);
  }, []);
  
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
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-xl text-white">Loading amazing content...</div>
          </div>
        ) : (
          <Portfolio />
        )}
      </div>

      <AudioPlayer />
    </div>
  );
} 