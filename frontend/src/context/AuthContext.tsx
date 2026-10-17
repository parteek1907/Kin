'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, firebaseSignOut } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  role?: string;
  institution?: string;
  userType?: 'student' | 'professional';
  studentId?: string;
  businessId?: string;
  verificationStatus?: string;
  firebaseUid?: string;
  token?: string;
  githubUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  summary?: string;
}

export interface VerificationPayload {
  firebaseUid: string;
  email: string;
  fullName: string;
  userType: 'student' | 'professional';
  studentId?: string;
  businessId?: string;
  institutionOrCompany: string;
  departmentOrTitle?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  userInitial: string;
  firebaseUser: FirebaseUser | null;
  syncWithDatabase: (payload: VerificationPayload) => Promise<{ success: boolean; message: string }>;
  login: (name: string, email: string) => void;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  parsedProfile: any | null;
  setParsedProfile: (profile: any) => void;
  isUploadResumeModalOpen: boolean;
  openUploadResumeModal: () => void;
  closeUploadResumeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadResumeModalOpen, setIsUploadResumeModalOpen] = useState(false);
  const [parsedProfile, setParsedProfileState] = useState<any | null>(null);

  // Hydrate user and parsed profile from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kin_user_auth');
      const storedProfile = localStorage.getItem('kin_parsed_profile');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      if (storedProfile) {
        setParsedProfileState(JSON.parse(storedProfile));
      }
    } catch (e) {
      console.error('Error hydrating user auth:', e);
    }
  }, []);

  const setParsedProfile = (profile: any) => {
    setParsedProfileState(profile);
    if (profile) {
      const updatedUser: UserProfile = {
        name: profile.name || 'Darsh Ohri',
        email: profile.email || 'darshohri@gmail.com',
        role: profile.role || 'Full-Stack & AI Software Developer',
        institution: profile.institution || 'B.Tech CSE',
        githubUrl: profile.githubUrl,
        githubUsername: profile.githubUsername || 'darshohri',
        linkedinUrl: profile.linkedinUrl,
        portfolioUrl: profile.portfolioUrl,
        summary: profile.summary,
        verificationStatus: 'verified_developer',
      };
      setUser(updatedUser);
      try {
        localStorage.setItem('kin_user_auth', JSON.stringify(updatedUser));
        localStorage.setItem('kin_parsed_profile', JSON.stringify(profile));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      setFirebaseUser(fbUser);
    });
    return () => unsubscribe();
  }, []);

  // Sync Firebase user and verification ID directly with platform database
  const syncWithDatabase = async (payload: VerificationPayload): Promise<{ success: boolean; message: string }> => {
    const isStudent = payload.userType === 'student';
    const chosenRole = isStudent ? 'Student' : 'Alumni';
    const verificationStatus = isStudent
      ? (payload.studentId ? 'verified_student' : 'pending')
      : (payload.businessId ? 'verified_professional' : 'pending');

    let backendSuccess = false;
    let jwtToken = '';

    // Attempt connection via unified backend service route, falling back to local port if standalone
    const backendEndpoints = [
      '/api/v1/auth/firebase-sync',
      'http://localhost:8000/api/v1/auth/firebase-sync',
    ];

    for (const endpoint of backendEndpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebase_uid: payload.firebaseUid,
            email: payload.email,
            full_name: payload.fullName,
            user_type: payload.userType,
            student_id: payload.studentId || null,
            business_id: payload.businessId || null,
            institution_or_company: payload.institutionOrCompany || null,
            department_or_title: payload.departmentOrTitle || null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          jwtToken = data.access_token || '';
          backendSuccess = true;
          break;
        }
      } catch (err) {
        // Continue to fallback if local dev proxy is offline
      }
    }

    const newUser: UserProfile = {
      name: payload.fullName,
      email: payload.email,
      role: chosenRole,
      institution: payload.institutionOrCompany,
      userType: payload.userType,
      studentId: payload.studentId,
      businessId: payload.businessId,
      verificationStatus,
      firebaseUid: payload.firebaseUid,
      token: jwtToken || undefined,
    };

    setUser(newUser);
    try {
      localStorage.setItem('kin_user_auth', JSON.stringify(newUser));
      if (jwtToken) {
        localStorage.setItem('kin_auth_token', jwtToken);
      }
    } catch (e) {
      console.error(e);
    }

    setIsAuthModalOpen(false);

    const message = backendSuccess
      ? `Identity successfully verified & connected to database! Token issued.`
      : `Identity verified with Firebase & local state hydrated.`;

    return { success: true, message };
  };

  const login = (name: string, email: string) => {
    const newUser: UserProfile = {
      name: name.trim() || 'Prateek',
      email: email.trim() || 'prateek@iiitd.ac.in',
      role: 'Verified Systems Builder',
      institution: 'IIIT Delhi',
      userType: 'student',
      verificationStatus: 'verified_student',
      studentId: '2024-CS-0412',
    };
    setUser(newUser);
    try {
      localStorage.setItem('kin_user_auth', JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('Firebase signout error:', e);
    }
    setUser(null);
    setFirebaseUser(null);
    setParsedProfileState(null);
    try {
      localStorage.removeItem('kin_user_auth');
      localStorage.removeItem('kin_auth_token');
      localStorage.removeItem('kin_parsed_profile');
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
        firebaseUser,
        syncWithDatabase,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        parsedProfile,
        setParsedProfile,
        isUploadResumeModalOpen,
        openUploadResumeModal: () => setIsUploadResumeModalOpen(true),
        closeUploadResumeModal: () => setIsUploadResumeModalOpen(false),
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
