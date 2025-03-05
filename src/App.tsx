import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Only import AudioPlayer eagerly as it's small
import AudioPlayer from './components/AudioPlayer';

// Lazy load larger components
const LandingPage = lazy(() => import('./components/LandingPage'));
const LoginForm = lazy(() => import('./components/LoginForm'));
const Dashboard = lazy(() => import('./components/Dashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<LoginForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" />
      <AudioPlayer />
    </QueryClientProvider>
  );
}