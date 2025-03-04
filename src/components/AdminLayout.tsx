import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BarChart, Settings, Home, ArrowLeft, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.clear();
      navigate('/', { replace: true });
      setTimeout(() => {
        toast.success('Signed out successfully!');
      }, 100);
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-black/95">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-black/50 border-r border-white/10 p-4 flex flex-col">
          {/* Back to Frontend Link */}
          <div className="mb-8">
            <a
              href="/"
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-400 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Frontend</span>
            </a>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4 flex-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600/50 text-white' : 'text-gray-400 hover:bg-white/10'
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span>Overview</span>
            </NavLink>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600/50 text-white' : 'text-gray-400 hover:bg-white/10'
                }`
              }
            >
              <BarChart className="w-5 h-5" />
              <span>Analytics</span>
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600/50 text-white' : 'text-gray-400 hover:bg-white/10'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </NavLink>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 p-2 rounded-lg text-red-400 hover:bg-white/10 transition-colors mt-auto"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
} 