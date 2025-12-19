import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiConfig } from '@/lib/api-config';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'video-manager-auth-token';
const AUTH_USER_KEY = 'video-manager-auth-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const user = localStorage.getItem(AUTH_USER_KEY);
    
    if (token && user) {
      setIsAuthenticated(true);
      setUsername(user);
    }
    setIsLoading(false);
  }, []);

  const login = async (usernameInput: string, password: string): Promise<{ error?: string }> => {
    try {
      const response = await fetch(apiConfig.getAuthUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: usernameInput, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Authentication failed' };
      }

      if (data.error) {
        return { error: data.error };
      }

      if (data.success && data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        localStorage.setItem(AUTH_USER_KEY, data.username);
        setIsAuthenticated(true);
        setUsername(data.username);
        return {};
      }

      return { error: 'Unexpected response from server' };
    } catch (err) {
      console.error('Login error:', err);
      return { error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      username,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
