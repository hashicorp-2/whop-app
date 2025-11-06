"use client";

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    console.error('Missing Supabase environment variables:', missing.join(', '));
    throw new Error(
      `Supabase is not configured. Please set ${missing.join(' and ')} in your .env.local file.`
    );
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (err) {
    console.error('Invalid Supabase URL format:', supabaseUrl);
    throw new Error(
      'Invalid Supabase URL format. Please check NEXT_PUBLIC_SUPABASE_URL in your .env.local file.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setUser(session?.user ?? null);
    }).catch((err) => {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to get session');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, error };
}

export function useSubscription() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      setIsSubscribed(false);
      return;
    }

    const checkSubscription = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/check-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        });

        if (!response.ok) {
          throw new Error('Failed to check subscription');
        }

        const data = await response.json();
        setIsSubscribed(data.isSubscribed ?? false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user?.email]);

  return { isSubscribed, loading, error };
}

export async function login(email: string, password: string) {
  try {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        return { error: error.message };
      }
      return { data };
    } catch (fetchError: any) {
      // Network/connection error
      console.error('Login fetch error:', fetchError);
      
      // Check for AuthRetryableFetchError or network errors
      const isNetworkError = 
        fetchError?.name === 'AuthRetryableFetchError' ||
        fetchError instanceof TypeError ||
        (fetchError?.message && fetchError.message.includes('fetch')) ||
        (fetchError?.message && fetchError.message.includes('Failed to fetch'));
      
      if (isNetworkError) {
        return { 
          error: 'Unable to connect to Supabase. Please verify:\n\n' +
                 '✓ Your Supabase URL is correct and accessible\n' +
                 '✓ Your internet connection is working\n' +
                 '✓ Your Supabase project is active (not paused)\n' +
                 '✓ CORS is enabled for localhost:3000\n\n' +
                 'To test: Open https://your-project.supabase.co in your browser\n' +
                 'If it doesn\'t load, your project may be paused or the URL is incorrect.'
        };
      }
      
      throw fetchError;
    }
  } catch (err: any) {
    console.error('Login exception:', err);
    
    if (err instanceof Error && err.message.includes('not configured')) {
      return { error: err.message };
    }
    
    if (err?.name === 'AuthRetryableFetchError') {
      return { 
        error: 'Network error connecting to Supabase. Please check your Supabase URL and internet connection.'
      };
    }
    
    const message = err instanceof Error 
      ? err.message 
      : 'Failed to connect to authentication service. Please check your connection and try again.';
    return { error: message };
  }
}

export async function signup(email: string, password: string) {
  try {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('Signup error:', error);
        return { error: error.message };
      }
      return { data };
    } catch (fetchError: any) {
      // Network/connection error
      console.error('Signup fetch error:', fetchError);
      
      // Check for AuthRetryableFetchError or network errors
      const isNetworkError = 
        fetchError?.name === 'AuthRetryableFetchError' ||
        fetchError instanceof TypeError ||
        (fetchError?.message && fetchError.message.includes('fetch')) ||
        (fetchError?.message && fetchError.message.includes('Failed to fetch'));
      
      if (isNetworkError) {
        return { 
          error: 'Unable to connect to Supabase. Please verify:\n\n' +
                 '✓ Your Supabase URL is correct and accessible\n' +
                 '✓ Your internet connection is working\n' +
                 '✓ Your Supabase project is active (not paused)\n' +
                 '✓ CORS is enabled for localhost:3000\n\n' +
                 'To test: Open https://your-project.supabase.co in your browser\n' +
                 'If it doesn\'t load, your project may be paused or the URL is incorrect.'
        };
      }
      
      throw fetchError;
    }
  } catch (err: any) {
    console.error('Signup exception:', err);
    
    if (err instanceof Error && err.message.includes('not configured')) {
      return { error: err.message };
    }
    
    if (err?.name === 'AuthRetryableFetchError') {
      return { 
        error: 'Network error connecting to Supabase. Please check your Supabase URL and internet connection.'
      };
    }
    
    const message = err instanceof Error 
      ? err.message 
      : 'Failed to connect to authentication service. Please check your connection and try again.';
    return { error: message };
  }
}

export async function logout() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) return { error: error.message };
  return { success: true };
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    launchesRemaining: number;
    subscriptionTier: 'free' | 'pro' | 'agency';
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/user-profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile({
          launchesRemaining: data.launchesRemaining ?? 0,
          subscriptionTier: data.subscriptionTier ?? 'free',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  return { profile, loading, error };
}
