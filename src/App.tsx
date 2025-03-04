import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { QueryClient, QueryClientProvider, useQueryClient } from 'react-query';
import { Toaster } from 'react-hot-toast';
import AudioPlayer from './components/AudioPlayer';

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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Toaster position="bottom-right" />
      <AudioPlayer />
    </QueryClientProvider>
  );
}