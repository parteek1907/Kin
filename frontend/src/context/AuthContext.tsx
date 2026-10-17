'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  role?: string;
  institution?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  userInitial: string;
  login: (name: string, email: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kin_user_auth');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const login = (name: string, email: string) => {
    const newUser: UserProfile = {
      name: name.trim() || 'Prateek',
      email: email.trim() || 'prateek@iiitd.ac.in',
      role: 'Verified Systems Builder',
      institution: 'IIIT Delhi',
    };
    setUser(newUser);
    try {
      localStorage.setItem('kin_user_auth', JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('kin_user_auth');
    } catch (e) {
      console.error(e);
    }
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : '';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        userInitial,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
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
