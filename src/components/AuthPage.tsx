import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import SpaceBackground from './SpaceBackground';
import { Loader2 } from 'lucide-react';
import LoginForm from './LoginForm';
import AudioPlayer from './AudioPlayer';
import { FaArrowLeft } from 'react-icons/fa';

export default function AuthPage() {
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading } = useQuery('session', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  });

  // Show loading spinner while checking auth
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <SpaceBackground />
      
      {/* Content Layer */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 p-3 rounded-full bg-gray-800/80 text-white hover:bg-gray-700/80 transition-colors backdrop-blur-sm"
          aria-label="Go back"
        >
          <FaArrowLeft size={20} />
        </button>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full px-6">
            <LoginForm />
          </div>
        </div>

        {/* Audio Player */}
        <AudioPlayer />
      </div>
    </div>
  );
} 