import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      // First, check app public settings (with token if available)
      // This will tell us if auth is required, user not registered, etc.
      // First, check app public settings
      // We can skip most of this for local mode, just assume public
      try {
        // Local mode doesn't really have "app settings" the same way, 
        // but we'll simulate success to keep the UI happy.
        setAppPublicSettings({ id: 'local-app', public_settings: {} });

        // Check if user is authenticated
        await checkUserAuth();

        setIsLoadingPublicSettings(false);

      } catch (appError) {
        console.error('App state check failed:', appError);
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
      console.error('App state check failed:', appError);

      // Handle app-level errors
      if (appError.status === 403 && appError.data?.extra_data?.reason) {
        const reason = appError.data.extra_data.reason;
        if (reason === 'auth_required') {
          setAuthError({
            type: 'auth_required',
            message: 'Authentication required'
          });
        } else if (reason === 'user_not_registered') {
          setAuthError({
            type: 'user_not_registered',
            message: 'User not registered for this app'
          });
        } else {
          setAuthError({
            type: reason,
            message: appError.message
          });
        }
      } else {
        setAuthError({
          type: 'unknown',
          message: appError.message || 'Failed to load app'
        });
      }
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
    } catch (error) {
    console.error('Unexpected error:', error);
    setAuthError({
      type: 'unknown',
      message: error.message || 'An unexpected error occurred'
    });
    setIsLoadingPublicSettings(false);
    setIsLoadingAuth(false);
  }
};

const checkUserAuth = async () => {
  try {
    // Now check if the user is authenticated
    setIsLoadingAuth(true);

    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token");

    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Unauthorized");

    const currentUser = await res.json();
    setUser(currentUser);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
  } catch (error) {
    console.error('User auth check failed:', error);
    setIsLoadingAuth(false);
    setIsAuthenticated(false);

    // If user auth fails, it might be an expired token
    if (error.status === 401 || error.status === 403) {
      setAuthError({
        type: 'auth_required',
        message: 'Authentication required'
      });
    }
  }
};

const logout = (shouldRedirect = true) => {
  setUser(null);
  setIsAuthenticated(false);

  if (shouldRedirect) {
    // Use the SDK's logout method which handles token cleanup and redirect
    if (shouldRedirect) {
      localStorage.removeItem('token');
      window.location.reload();
    } else {
      localStorage.removeItem('token');
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) {
        setAuthError({ type: 'login_failed', message: data.error });
      } else {
        localStorage.setItem('token', data.access_token);
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    // For local mode, we might show a login modal or just auto-login
    // We'll implemented a simple auto-login for now since it's a local app.
    login("admin@example.com", "password");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      logout,
      navigateToLogin,
      checkAppState,
      login
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
