import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Loader2, LogIn, LogOut, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import SpaceBackground from './SpaceBackground';

export default function Dashboard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const queryClient = useQueryClient();

  const { data: session } = useQuery('session', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }, {
    refetchOnWindowFocus: false,
    retry: false
  });

  const { data: items, isLoading: itemsLoading, error: itemsError } = useQuery(
    ['items', session?.user?.id],
    async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('items')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    {
      enabled: !!session?.user?.id,
    }
  );

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < 10) {
      return 'Password must be at least 10 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast.success('Signed in successfully!');
      queryClient.invalidateQueries('session');
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else {
        toast.error('Failed to sign in. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw error;
      }

      if (data.user) {
        toast.success('Account created successfully! You can now sign in.');
        setEmail('');
        setPassword('');
      } else {
        toast.error('Something went wrong during signup. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.invalidateQueries('session');
      queryClient.setQueryData('session', null);
      toast.success('Signed out successfully!');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      
      if (error) throw error;
      
      toast.success('Password reset instructions have been sent to your email');
      setEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset instructions. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  if (!session) {
    return (
      <>
        <SpaceBackground />
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-md w-full space-y-8">
            <div className="backdrop-blur-md bg-black/30 rounded-lg p-8 border border-white/10 shadow-xl">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                <h2 className="relative text-center text-4xl font-extrabold text-white mb-2">
                 Welcome
                </h2>
                <p className="relative text-center text-lg text-blue-200 mb-4">
                  There's no going back now
                </p>
              </div>
              <div className="mt-4 text-center text-sm text-blue-100">
                <p className="mb-2 text-lg">Login or Sign Up</p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <input
                      type="email"
                      required
                      className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-white/10 placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-black/50 backdrop-blur-sm"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading || isResetting}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      required
                      className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-white/10 placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-black/50 backdrop-blur-sm"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || isResetting}
                      minLength={10}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isLoading || isResetting}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600/80 hover:bg-blue-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition-all duration-200 hover:scale-105"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <LogIn className="h-5 w-5 mr-2" />
                          Launch In
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleSignUp}
                      disabled={isLoading || isResetting}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600/80 hover:bg-indigo-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition-all duration-200 hover:scale-105"
                    >
                      Begin Journey
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={isLoading || isResetting}
                    className="group relative w-full flex justify-center py-2 px-4 border border-white/10 text-sm font-medium rounded-md text-white bg-gray-800/50 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition-all duration-200 hover:scale-105"
                  >
                    {isResetting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Key className="h-5 w-5 mr-2" />
                        Reset Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (itemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (itemsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error loading data</p>
      </div>
    );
  }

  return (
    <>
      <SpaceBackground />
      <div className="container mx-auto px-4 py-8 relative">
        <div className="backdrop-blur-md bg-black/30 rounded-lg p-8 border border-white/10 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 bg-red-600/80 text-white rounded-md hover:bg-red-700/80 transition-colors backdrop-blur-sm"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </div>
          
          {items && items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item: any) => (
                <div key={item.id} className="backdrop-blur-md bg-white/10 rounded-lg p-6 border border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-2">{item.title}</h2>
                  <p className="text-blue-200">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-blue-200">
              <p>No items found. Make sure you have added some data to your database.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}