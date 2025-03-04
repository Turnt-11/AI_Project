import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AdminPanel() {
  const { data: stats, isLoading } = useQuery('admin-stats', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role', { count: 'exact' });
    
    if (error) throw error;
    return data;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-2">Total Users</h2>
          <p className="text-4xl font-bold text-blue-400">{stats?.length || 0}</p>
        </div>
        {/* Add more stat cards as needed */}
      </div>
    </div>
  );
} 