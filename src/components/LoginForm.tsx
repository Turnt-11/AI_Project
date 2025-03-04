import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { Loader2, LogIn, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import SpaceBackground from './SpaceBackground';
import { Link } from 'react-router-dom';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const queryClient = useQueryClient();

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < 10) return 'Password must be at least 10 characters long';
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumbers) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        console.log('Attempting signup...');
        // Validate password for sign up
        const passwordError = validatePassword(password);
        if (passwordError) {
          toast.error(passwordError);
          setIsLoading(false);
          return;
        }

        // Sign up
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          try {
            // Check if profile already exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', authData.user.id)
              .single();

            if (!existingProfile) {
              // Only create profile if it doesn't exist
              const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: authData.user.id,
                    email: authData.user.email,
                    role: 'user'
                  }
                ]);

              if (profileError) {
                // If error is not a duplicate key error, throw it
                if (profileError.code !== '23505') {
                  throw profileError;
                }
              }
            }

            toast.success('Account created successfully! Please check your email for confirmation.');
            setIsSignUp(false);
            setEmail('');
            setPassword('');
          } catch (error: any) {
            console.error('Profile creation error:', error);
            toast.error(error.message || 'Failed to create profile');
          }
        }
      } else {
        console.log('Attempting signin...');
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        queryClient.invalidateQueries('session');
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      
      if (error) throw error;
      
      toast.success('Password reset instructions have been sent to your email');
      setEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="fixed inset-0">
        <SpaceBackground />
      </div>

      {/* Login Form */}
      <div className="min-h-screen flex items-center justify-center p-4 relative z-20">
        <div className="max-w-md w-full space-y-8 backdrop-blur-lg bg-black/30 p-8 rounded-xl border border-white/10">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
            <h2 className="relative text-center text-4xl font-extrabold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="relative text-center text-lg text-blue-200 mb-4">
              {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-white/10 bg-black/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-white/10 bg-black/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                to="/"
                className="w-1/2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Back
              </Link>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-1/2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed z-10 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSignUp ? (
                  'Sign Up'
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-300 hover:text-blue-400 text-sm"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 