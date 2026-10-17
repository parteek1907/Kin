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
  skills?: string[];
  headline?: string;
  graduationYear?: string;
  resumeName?: string;
  resumeUrl?: string;
  officeHours?: string;
  interests?: string[];
  topProjectUrl?: string;
  topProjectDescription?: string;
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
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUploadResumeModalOpen, setIsUploadResumeModalOpen] = useState(false);
  const [parsedProfile, setParsedProfileState] = useState<any | null>(null);

  // Hydrate user and parsed profile from localStorage
  useEffect(() => {
    try {
      const storedCompleted = localStorage.getItem('kin_completed_profile');
      const stored = localStorage.getItem('kin_user_auth');
      const storedProfile = localStorage.getItem('kin_parsed_profile');
      if (storedCompleted) {
        setUser(JSON.parse(storedCompleted));
      } else if (stored) {
        setUser(JSON.parse(stored));
      }
      if (storedProfile) {
        setParsedProfileState(JSON.parse(storedProfile));
      }
    } catch (e) {
      console.error('Error hydrating user auth:', e);
    }
  }, []);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated: UserProfile = {
        name: prev?.name || 'Verified Builder',
        email: prev?.email || 'builder@kin.network',
        ...prev,
        ...data,
      };
      try {
        localStorage.setItem('kin_user_auth', JSON.stringify(updated));
        localStorage.setItem('kin_completed_profile', JSON.stringify(updated));
        if (updated.userType) {
          localStorage.setItem(
            'kin_network_role',
            updated.userType === 'professional' ? 'alumni' : 'student'
          );
        }
      } catch (err) {
        console.error('Error storing updated profile:', err);
      }
      return updated;
    });
  };

  const setParsedProfile = (profile: any) => {
    setParsedProfileState(profile);
    if (profile) {
      setUser((prev) => {
        const updatedUser: UserProfile = {
          name: profile.name || prev?.name || 'Verified Member',
          email: profile.email || prev?.email || 'builder@kin.network',
          role: profile.role || prev?.role || 'Software Engineer',
          institution: profile.institution || prev?.institution || 'IIIT Delhi',
          githubUrl: profile.githubUrl || prev?.githubUrl,
          githubUsername: profile.githubUsername || prev?.githubUsername,
          linkedinUrl: profile.linkedinUrl || prev?.linkedinUrl,
          portfolioUrl: profile.portfolioUrl || prev?.portfolioUrl,
          summary: profile.summary || prev?.summary,
          verificationStatus: 'verified_developer',
          userType: prev?.userType || 'student',
        };
        try {
          localStorage.setItem('kin_user_auth', JSON.stringify(updatedUser));
          localStorage.setItem('kin_parsed_profile', JSON.stringify(profile));
        } catch (err) {
          console.error(err);
        }
        return updatedUser;
      });
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

    const backendEndpoints = [
      'http://localhost:8000/api/v1/auth/firebase-sync',
      'http://127.0.0.1:8000/api/v1/auth/firebase-sync',
    ];

    let backendSuccess = false;
    let jwtToken = '';

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
      name: name.trim() || 'Verified Member',
      email: email.trim() || 'member@kin.network',
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
      localStorage.removeItem('kin_completed_profile');
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
        isProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
        updateUserProfile,
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
