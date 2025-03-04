import React, { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Loader2, LogOut, Settings, User, Home, Plane } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import SpaceBackground from './SpaceBackground';
import AudioPlayer from './AudioPlayer';
import LocationDisplay from './LocationDisplay';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import ProfileTab from './dashboard/ProfileTab';
import RealEstateTab from './dashboard/RealEstateTab';
import VacationsTab from './dashboard/VacationsTab';

type TabType = 'profile' | 'real-estate' | 'vacations';

interface TabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function TabButton({ active, icon, label, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-blue-600/50 text-white' 
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface ServerStatus {
  isOnline: boolean;
  message: string;
  retryCount: number;
}

export default function Dashboard() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    isOnline: false,
    message: 'Checking server status...',
    retryCount: 0
  });
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: session, isLoading: sessionLoading } = useQuery('session', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }, {
    // Add this to ensure session state is always fresh
    staleTime: 0,
    cacheTime: 0
  });

  // Move this check to the top, before other queries
  if (!session && !sessionLoading) {
    return <Navigate to="/" replace />;
  }

  // Show loading spinner while checking auth
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Only run these queries if we have a session
  const { data: items = [], isLoading: itemsLoading } = useQuery(
    ['items', session?.user?.id],
    async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('items')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!session?.user?.id,
      retry: false
    }
  );

  const { data: profile } = useQuery(
    ['profile', session?.user?.id],
    async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    {
      enabled: !!session?.user?.id,
      retry: false
    }
  );

  const isAdmin = profile?.role === 'admin';

  const checkServerStatus = useCallback(async (retryCount: number) => {
    try {
      const response = await fetch('http://localhost:3000/', {
        timeout: 5000
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.text();
      setServerStatus({
        isOnline: true,
        message: data,
        retryCount: 0
      });
    } catch (error: any) {
      console.error('Error fetching server status:', error.message);
      
      // Calculate if we should retry
      const maxRetries = 3;
      const shouldRetry = retryCount < maxRetries;
      
      setServerStatus({
        isOnline: false,
        message: shouldRetry 
          ? `Server offline: ${error.message}. Retrying... (${retryCount + 1}/${maxRetries})`
          : `Server offline: ${error.message}. Refresh page to retry.`,
        retryCount: retryCount + 1
      });

      // Implement exponential backoff for retries
      if (shouldRetry) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
        setTimeout(() => {
          checkServerStatus(retryCount + 1);
        }, backoffDelay);
      }
    }
  }, []);

  useEffect(() => {
    if (session) {
      checkServerStatus(0);
    }
  }, [session, checkServerStatus]);

  if (itemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <SpaceBackground />
      <div className="container mx-auto px-4 py-8 relative">
        <div className="backdrop-blur-md bg-black/30 rounded-lg p-8 border border-white/10 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <div className="flex gap-4">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center px-4 py-2 bg-purple-600/80 text-white rounded-md hover:bg-purple-700/80 transition-colors backdrop-blur-sm"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Admin Panel
                </Link>
              )}
            <button
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    // Clear all queries and cache
                    queryClient.clear();
                    // Navigate to landing page
                    navigate('/', { replace: true });
                    // Show success message after navigation
                    setTimeout(() => {
                      toast.success('Signed out successfully!');
                    }, 100);
                  } catch (error: any) {
                    console.error('Sign out error:', error);
                    toast.error('Failed to sign out. Please try again.');
                  }
                }}
              className="flex items-center px-4 py-2 bg-red-600/80 text-white rounded-md hover:bg-red-700/80 transition-colors backdrop-blur-sm"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </div>
          </div>
          
          <LocationDisplay />
          
          {/* Server Status Card */}
          <div className="backdrop-blur-md bg-white/10 rounded-lg p-6 border border-white/10 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-white">Server Status</h2>
              <div 
                className={`w-2 h-2 rounded-full ${
                  serverStatus.isOnline 
                    ? 'bg-green-500 animate-pulse' 
                    : serverStatus.retryCount < 3
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
            </div>
            <p className={`font-mono ${
              serverStatus.isOnline 
                ? 'text-blue-200' 
                : serverStatus.retryCount < 3
                ? 'text-yellow-300'
                : 'text-red-300'
            }`}>
              {serverStatus.message}
            </p>
            {!serverStatus.isOnline && serverStatus.retryCount >= 3 && (
              <button
                onClick={() => checkServerStatus(0)}
                className="mt-4 px-4 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white rounded-md transition-colors text-sm"
              >
                Retry Connection
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4">
            <TabButton
              active={activeTab === 'profile'}
              icon={<User className="w-5 h-5" />}
              label="Profile"
              onClick={() => setActiveTab('profile')}
            />
            <TabButton
              active={activeTab === 'real-estate'}
              icon={<Home className="w-5 h-5" />}
              label="Real Estate"
              onClick={() => setActiveTab('real-estate')}
            />
            <TabButton
              active={activeTab === 'vacations'}
              icon={<Plane className="w-5 h-5" />}
              label="Vacations"
              onClick={() => setActiveTab('vacations')}
            />
                </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'profile' && <ProfileTab profile={profile} />}
            {activeTab === 'real-estate' && <RealEstateTab />}
            {activeTab === 'vacations' && <VacationsTab />}
            </div>
        </div>
      </div>
      <AudioPlayer />
    </>
  );
}