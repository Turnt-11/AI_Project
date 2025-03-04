import { useState, useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useQueryClient, useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: session } = useQuery('session', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  });

  const { data: settings, isLoading } = useSiteSettings();
  const [siteTitle, setSiteTitle] = useState('');

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings?.site_title) {
      setSiteTitle(settings.site_title);
    }
  }, [settings?.site_title]);

  // If not authenticated, show message or redirect
  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">Please sign in to access settings</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ 
          site_title: siteTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      // Update the document title immediately
      document.title = siteTitle;
      
      // Invalidate the settings query to refresh data
      await queryClient.invalidateQueries('site-settings');
      toast.success('Settings updated successfully');
    } catch (error: any) {
      console.error('Settings update error:', error);
      toast.error('Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Site Settings</h1>
      
      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <div>
          <label htmlFor="site-title" className="block text-sm font-medium text-gray-200">
            Site Title
          </label>
          <input
            type="text"
            id="site-title"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
} 