/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import type { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (phoneNumber: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const hasSession = await authService.hasActiveSession();
      if (hasSession) {
        // Force refresh from API to get latest data
        const currentUser = await userService.getCurrentUser(true);
        console.log('[AuthContext] Loaded user from API:', currentUser?.walletBalance);
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneNumber: string, code: string) => {
    const authenticatedUser = await authService.verifyOtp(phoneNumber, code);
    setUser(authenticatedUser);
  };

  const logout = async () => {
    await userService.clearSession();
    setUser(null);
  };

  const refreshUser = async () => {
    console.log('[AuthContext] Refreshing user...');
    const refreshedUser = await userService.refreshCurrentUser();
    console.log('[AuthContext] Refreshed user:', refreshedUser?.walletBalance);
    // Create a new object reference to ensure React detects the change
    if (refreshedUser) {
      setUser({ ...refreshedUser });
    } else {
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    userService.saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
