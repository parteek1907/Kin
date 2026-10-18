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
  avatarUrl?: string;
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
  activeRole: 'Student' | 'Alumni';
  setActiveRole: (role: 'Student' | 'Alumni') => void;
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

async function syncMemberToDatabase(profile: Partial<UserProfile> & { email: string; name?: string }) {
  if (!profile.email) return;
  try {
    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: profile.email.trim(),
        name: profile.name?.trim() || profile.email.split('@')[0],
        role: profile.userType === 'professional' || profile.role === 'Alumni' ? 'professional' : 'student',
        headline: profile.headline || (profile.userType === 'professional' ? 'Verified Tech Professional' : 'Student Builder'),
        institution: profile.institution || (profile.userType === 'professional' ? 'Enterprise Tech' : 'IIIT Delhi'),
        studentId: profile.studentId,
        businessId: profile.businessId,
        bio: profile.summary,
        skills: profile.skills || ['Full-Stack', 'TypeScript', 'Python'],
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
        githubUsername: profile.githubUsername,
        portfolioUrl: profile.portfolioUrl,
        resumeName: profile.resumeName,
        graduationYear: profile.graduationYear,
        officeHours: profile.officeHours,
        topProjectUrl: profile.topProjectUrl,
        topProjectDescription: profile.topProjectDescription,
        avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      }),
    });
  } catch (err) {
    console.warn('Sync member to database notice:', err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUploadResumeModalOpen, setIsUploadResumeModalOpen] = useState(false);
  const [parsedProfile, setParsedProfileState] = useState<any | null>(null);
  const [activeRole, setActiveRoleState] = useState<'Student' | 'Alumni'>('Student');

  // Hydrate user, parsed profile, and active role from localStorage
  useEffect(() => {
    try {
      const storedCompleted = localStorage.getItem('kin_completed_profile');
      const stored = localStorage.getItem('kin_user_auth');
      const storedProfile = localStorage.getItem('kin_parsed_profile');
      const storedRole = localStorage.getItem('kin_active_role');
      if (storedCompleted) {
        const u = JSON.parse(storedCompleted);
        setUser(u);
        syncMemberToDatabase(u);
      } else if (stored) {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        syncMemberToDatabase(parsedUser);
        if (parsedUser.role === 'Alumni' || parsedUser.userType === 'professional') {
          setActiveRoleState('Alumni');
        }
      }
      if (storedProfile) {
        setParsedProfileState(JSON.parse(storedProfile));
      }
      if (storedRole === 'Student' || storedRole === 'Alumni') {
        setActiveRoleState(storedRole);
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
      // Save directly to live database
      syncMemberToDatabase(updated);
      return updated;
    });
  };

  const setActiveRole = (role: 'Student' | 'Alumni') => {
    setActiveRoleState(role);
    try {
      localStorage.setItem('kin_active_role', role);
      localStorage.setItem('kin_network_role', role.toLowerCase());
    } catch (e) {
      console.error('Error saving active role:', e);
    }
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
        // Save directly to live database
        syncMemberToDatabase(updatedUser);
        return updatedUser;
      });
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        const derivedName = fbUser.displayName || fbUser.email.split('@')[0];
        syncMemberToDatabase({
          name: derivedName,
          email: fbUser.email,
          avatarUrl: fbUser.photoURL || undefined,
          userType: 'student',
          institution: 'IIIT Delhi',
        });
      }
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
    setActiveRoleState(chosenRole);
    try {
      localStorage.setItem('kin_user_auth', JSON.stringify(newUser));
      localStorage.setItem('kin_active_role', chosenRole);
      localStorage.setItem('kin_network_role', chosenRole.toLowerCase());
      if (jwtToken) {
        localStorage.setItem('kin_auth_token', jwtToken);
      }
    } catch (e) {
      console.error(e);
    }

    // Persist directly to live database Member table
    await syncMemberToDatabase({
      name: payload.fullName,
      email: payload.email,
      role: chosenRole,
      institution: payload.institutionOrCompany,
      userType: payload.userType,
      studentId: payload.studentId,
      businessId: payload.businessId,
      headline: payload.departmentOrTitle,
    });

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
      role: 'Student',
      institution: 'IIIT Delhi',
      userType: 'student',
      verificationStatus: 'verified_student',
      studentId: '2024-CS-0412',
    };
    setUser(newUser);
    setActiveRoleState('Student');
    try {
      localStorage.setItem('kin_user_auth', JSON.stringify(newUser));
      localStorage.setItem('kin_active_role', 'Student');
      localStorage.setItem('kin_network_role', 'student');
    } catch (e) {
      console.error(e);
    }
    // Persist directly to live database Member table
    syncMemberToDatabase(newUser);
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
        activeRole,
        setActiveRole,
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
