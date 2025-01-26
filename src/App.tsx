import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from 'react-query';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import { supabase } from './lib/supabase';
import AudioPlayer from './components/AudioPlayer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData('session', session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-transparent">
      <Dashboard />
      <Toaster position="bottom-right" />
      <AudioPlayer />
    </div>
  );
}

export default App;