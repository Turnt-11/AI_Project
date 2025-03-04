import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProfileTabProps {
  profile: any;
}

export default function ProfileTab({ profile }: ProfileTabProps) {
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <p className="text-white">{profile.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Role</label>
            <p className="text-white capitalize">{profile.role}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Member Since</label>
            <p className="text-white">
              {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 