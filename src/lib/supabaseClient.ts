import { createClient } from '@supabase/supabase-js';

// Use environment variables for the URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Export a function that returns the existing instance
// This helps ensure we're always using the same instance
export const getSupabase = () => supabase; 