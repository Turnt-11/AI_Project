import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';

export function useSiteSettings() {
  // Get current session
  const { data: session } = useQuery('session', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  });

  // Get user profile to check if admin
  const { data: profile } = useQuery(
    ['profile', session?.user?.id],
    async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    { enabled: !!session?.user?.id }
  );

  // Only fetch site settings if user is authenticated and is admin
  return useQuery(
    'site-settings',
    async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      // Only enable the query if user is authenticated and is admin
      enabled: !!session?.user?.id && profile?.role === 'admin',
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
      retry: 3,
      retryDelay: 1000,
      // Handle errors gracefully
      onError: (error) => {
        console.error('Site settings error:', error);
        return null;
      }
    }
  );
} 