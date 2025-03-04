import { useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

export default function AnalyticsTracker() {
  const location = useLocation();
  const { data: session } = useQuery('session', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  });

  const recordPageView = useCallback(async (path: string) => {
    if (!session?.user?.id) return;

    try {
      await supabase.rpc('record_analytics_event', {
        p_event_type: 'page_view',
        p_event_data: {
          path,
          title: document.title,
          referrer: document.referrer
        },
        p_page_path: path
      });
    } catch (error) {
      console.error('Error recording page view:', error);
    }
  }, [session?.user?.id]);

  // Track initial page view
  useEffect(() => {
    if (session?.user?.id) {
      recordPageView(location.pathname);
    }
  }, [session?.user?.id, location.pathname, recordPageView]);

  // Track session start
  useEffect(() => {
    if (session?.user?.id) {
      const trackSession = async () => {
        try {
          const user = supabase.auth.getUser();
          const { data: session, error } = await supabase
            .from('sessions')
            .insert([
              {
                user_id: user ? user.id : null,
                session_start: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (error) {
            console.error('Error creating session:', error);
            return null;
          }

          // Update session end time on window close
          const handleBeforeUnload = async () => {
            const { error: updateError } = await supabase
              .from('sessions')
              .update({
                session_end: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', session.user.id)
              .is('session_end', null);

            if (updateError) {
              console.error('Error updating session:', updateError);
            }
          };

          window.addEventListener('beforeunload', handleBeforeUnload);

          return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            handleBeforeUnload();
          };
        } catch (error) {
          console.error('Error tracking session:', error);
          return null;
        }
      };

      trackSession();
    }
  }, [session?.user?.id]);

  return null;
} 