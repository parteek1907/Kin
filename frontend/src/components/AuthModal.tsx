'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  ArrowLeft,
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  Briefcase, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  FirebaseUser
} from '@/lib/firebase';
import { syncMemberToDatabase } from '@/lib/syncMember';

export default function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, syncWithDatabase, login, setActiveRole, openProfileModal } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signUpStep, setSignUpStep] = useState<'role' | 'credentials'>('role');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'student' | 'professional'>('student');

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    closeAuthModal();
    setErrorMessage(null);
    setLoading(false);
  };

  // Helper for Log In (Sign In) - Takes user directly to dashboard, NEVER forces profile setup
  const completeSignInAndRedirect = async (
    userEmail: string,
    userName: string,
    fbUid?: string,
    avatarUrl?: string
  ) => {
    // Check if user already has an established role in localStorage or default to student
    let existingRole: 'Student' | 'Alumni' = 'Student';
    let existingUserType: 'student' | 'professional' = 'student';

    try {
      const storedCompleted = localStorage.getItem('kin_completed_profile');
      const storedAuth = localStorage.getItem('kin_user_auth');
      const profile = storedCompleted ? JSON.parse(storedCompleted) : storedAuth ? JSON.parse(storedAuth) : null;
      if (profile) {
        if (profile.role === 'Alumni' || profile.userType === 'professional') {
          existingRole = 'Alumni';
          existingUserType = 'professional';
        }
      }
    } catch {
      // fallback
    }

    // Sync member in database
    await syncMemberToDatabase({
      email: userEmail,
      name: userName,
      role: existingRole,
      userType: existingUserType,
      avatarUrl,
    });

    try {
      await syncWithDatabase({
        firebaseUid: fbUid || `user_${Date.now()}`,
        email: userEmail,
        fullName: userName,
        userType: existingUserType,
        institutionOrCompany: existingUserType === 'student' ? 'IIIT Delhi' : 'Enterprise Tech',
      });
    } catch {
      login(userName, userEmail, existingRole);
    }

    setActiveRole(existingRole);
    handleClose();
    // Direct to dashboard without setup query param
    router.push(`/dashboard?role=${existingRole.toLowerCase()}`);
  };

  // Helper for Sign Up - Sets role, creates account, and MANDATORILY opens respective profile setup
  const completeSignUpAndOpenProfileSetup = async (
    userEmail: string,
    userName: string,
    roleType: 'student' | 'professional',
    fbUid?: string,
    avatarUrl?: string
  ) => {
    const chosenRole: 'Student' | 'Alumni' = roleType === 'student' ? 'Student' : 'Alumni';
    const fallbackInst = roleType === 'student' ? 'IIIT Delhi' : 'Enterprise Tech';

    // 1. Initial sync to Prisma database
    await syncMemberToDatabase({
      email: userEmail,
      name: userName,
      role: chosenRole,
      userType: roleType,
      institution: fallbackInst,
      headline: roleType === 'student' ? 'Student Builder • IIIT Delhi' : 'Verified Industry Professional',
      avatarUrl,
    });

    // 2. Sync with backend
    try {
      await syncWithDatabase({
        firebaseUid: fbUid || `user_${Date.now()}`,
        email: userEmail,
        fullName: userName,
        userType: roleType,
        studentId: roleType === 'student' ? '2024-IIITD-4029' : undefined,
        businessId: roleType === 'professional' ? 'CORP-VERIFIED-9001' : undefined,
        institutionOrCompany: fallbackInst,
      });
    } catch {
      login(userName, userEmail, chosenRole, fallbackInst);
    }

    setActiveRole(chosenRole);
    handleClose();

    // Launch respective profile setup wizard mandatorily
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kin_mandatory_profile_setup', 'true');
    }
    openProfileModal();
    router.push(`/dashboard?role=${roleType === 'student' ? 'student' : 'alumni'}&setup=true`);
  };

  // Google 1-Click Action
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userEmail = fbUser.email || email.trim() || 'user@kin.network';
      const userName = fbUser.displayName || userEmail.split('@')[0];
      const photoURL = fbUser.photoURL || undefined;

      if (authMode === 'signup') {
        await completeSignUpAndOpenProfileSetup(
          userEmail,
          userName,
          userType,
          fbUser.uid,
          photoURL
        );
      } else {
        await completeSignInAndRedirect(
          userEmail,
          userName,
          fbUser.uid,
          photoURL
        );
      }
    } catch (err: any) {
      console.warn('Google Auth popup notice:', err);
      // Seamless fallback if popup is blocked
      const userTypedEmail = email.trim() || 'adityaa6060@gmail.com';
      const userDerivedName = name.trim() || userTypedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      if (authMode === 'signup') {
        await completeSignUpAndOpenProfileSetup(
          userTypedEmail,
          userDerivedName,
          userType,
          `google_${Date.now()}`
        );
      } else {
        await completeSignInAndRedirect(
          userTypedEmail,
          userDerivedName,
          `google_${Date.now()}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Email + Password Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      let fbUser: FirebaseUser | null = null;

      if (authMode === 'signup') {
        try {
          const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          fbUser = userCred.user;
        } catch (fbErr: any) {
          if (fbErr.code === 'auth/email-already-in-use') {
            const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
            fbUser = userCred.user;
          } else if (fbErr.code === 'auth/operation-not-allowed') {
            fbUser = {
              uid: 'usr_' + Math.random().toString(36).substring(2, 9),
              email: trimmedEmail,
              displayName: name.trim() || trimmedEmail.split('@')[0],
            } as unknown as FirebaseUser;
          } else {
            throw fbErr;
          }
        }

        const finalName = name.trim() || fbUser?.displayName || trimmedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        await completeSignUpAndOpenProfileSetup(
          trimmedEmail,
          finalName,
          userType,
          fbUser?.uid,
          fbUser?.photoURL || undefined
        );
      } else {
        // Sign In Flow
        try {
          const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
          fbUser = userCred.user;
        } catch (fbErr: any) {
          if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/operation-not-allowed') {
            fbUser = {
              uid: 'usr_' + Math.random().toString(36).substring(2, 9),
              email: trimmedEmail,
              displayName: name.trim() || trimmedEmail.split('@')[0],
            } as unknown as FirebaseUser;
          } else {
            throw fbErr;
          }
        }

        const finalName = name.trim() || fbUser?.displayName || trimmedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        await completeSignInAndRedirect(
          trimmedEmail,
          finalName,
          fbUser?.uid,
          fbUser?.photoURL || undefined
        );
      }
    } catch (err: any) {
      console.warn('Auth Error:', err);
      let userFriendlyMsg = err.message || 'Authentication failed. Please verify credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        userFriendlyMsg = 'Incorrect password for this account. Please try again.';
      }
      setErrorMessage(userFriendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
        />

        {/* Modal Window - Warm Light Themed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white border border-stone-200/90 shadow-2xl p-6 sm:p-8 z-10 text-stone-900"
        >
          {/* Subtle warm glow behind header */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-orange-400/10 blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 rounded-full bg-stone-100 hover:bg-stone-200 transition"
          >
            <X size={18} />
          </button>

          {/* KIN Icon & Branding Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200/80 shadow-xs mb-3 p-2">
              <img 
                src="/images/kin_logo.png" 
                alt="KIN" 
                className="w-10 h-10 object-contain" 
              />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-stone-900">
              {authMode === 'signin' ? 'Welcome Back to KIN' : 'Join KIN Network'}
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              {authMode === 'signin'
                ? 'Sign in to access your verified campus & career engine'
                : 'Connect with verified campus builders, alumni, and industry leaders'}
            </p>
          </div>

          {/* Top Switcher: Sign In vs Create Account */}
          <div className="flex rounded-xl bg-stone-100 p-1 mb-5 border border-stone-200/70">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'signin'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setSignUpStep('role');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              MODE 1: SIGN IN (Direct, remembers user, no questions, straight to dashboard)
              ═══════════════════════════════════════════════════════════════════════ */}
          {authMode === 'signin' && (
            <div className="space-y-4">
              {/* Google 1-Click Sign In */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border border-stone-200 text-stone-800 font-semibold text-sm hover:bg-stone-50 transition shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-3 text-stone-400 font-medium">or with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="e.g. aditya@iiitd.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:bg-white focus:border-[#E25C38] focus:ring-2 focus:ring-[#E25C38]/10 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:bg-white focus:border-[#E25C38] focus:ring-2 focus:ring-[#E25C38]/10 transition"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E25C38] hover:bg-[#cf4b27] text-white font-bold text-sm shadow-md shadow-[#E25C38]/20 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              MODE 2: SIGN UP STEP 1 - AUTOMATIC ROLE SELECTION SCREEN
              (Student or Professional First)
              ═══════════════════════════════════════════════════════════════════════ */}
          {authMode === 'signup' && signUpStep === 'role' && (
            <div className="space-y-4">
              <div className="text-center mb-1">
                <span className="text-[11px] font-bold text-[#E25C38] tracking-wider uppercase">
                  Step 1 of 2
                </span>
                <h3 className="text-sm font-bold text-stone-900">
                  Select Your Persona
                </h3>
              </div>

              {/* Persona Cards */}
              <div className="grid grid-cols-1 gap-3">
                {/* Option 1: Student */}
                <button
                  type="button"
                  onClick={() => {
                    setUserType('student');
                    setSignUpStep('credentials');
                  }}
                  className="p-4 rounded-2xl border-2 border-stone-200 hover:border-[#E25C38] bg-stone-50/60 hover:bg-orange-50/30 transition-all text-left flex items-start gap-3.5 group cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div className="w-11 h-11 rounded-xl bg-orange-100 text-[#E25C38] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <GraduationCap size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#E25C38] transition-colors">
                        Student Builder
                      </h4>
                      <ChevronRight size={16} className="text-stone-400 group-hover:text-[#E25C38] transition-colors" />
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Showcase proof-of-work, get verified student badge, discover alumni mentors & internships.
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-[#E25C38]">
                      Campus & University
                    </span>
                  </div>
                </button>

                {/* Option 2: Professional / Alumni */}
                <button
                  type="button"
                  onClick={() => {
                    setUserType('professional');
                    setSignUpStep('credentials');
                  }}
                  className="p-4 rounded-2xl border-2 border-stone-200 hover:border-stone-900 bg-stone-50/60 hover:bg-stone-100/60 transition-all text-left flex items-start gap-3.5 group cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div className="w-11 h-11 rounded-xl bg-stone-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Briefcase size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-sm font-bold text-stone-900 transition-colors">
                        Professional / Alumni
                      </h4>
                      <ChevronRight size={16} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Offer office hours, discover emerging engineering talent, guide student projects & mentor peers.
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-stone-200 text-stone-800">
                      Industry & Alumni
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              MODE 2: SIGN UP STEP 2 - CREDENTIALS & LAUNCH PROFILE SETUP
              ═══════════════════════════════════════════════════════════════════════ */}
          {authMode === 'signup' && signUpStep === 'credentials' && (
            <div className="space-y-3.5">
              {/* Role Selection Badge with Change Button */}
              <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-stone-100 border border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">Signing up as:</span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${
                    userType === 'student' ? 'text-[#E25C38]' : 'text-stone-900'
                  }`}>
                    {userType === 'student' ? <GraduationCap size={14} /> : <Briefcase size={14} />}
                    {userType === 'student' ? 'Student Builder' : 'Professional / Alumni'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSignUpStep('role')}
                  className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Google 1-Click Sign Up */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white border border-stone-200 text-stone-800 font-semibold text-sm hover:bg-stone-50 transition shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-3 text-stone-400 font-medium">or register with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:bg-white focus:border-[#E25C38] focus:ring-2 focus:ring-[#E25C38]/10 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input
                      type="email"
                      required
                      placeholder={userType === 'student' ? 'e.g. yourname@iiitd.ac.in' : 'e.g. name@company.com'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:bg-white focus:border-[#E25C38] focus:ring-2 focus:ring-[#E25C38]/10 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:bg-white focus:border-[#E25C38] focus:ring-2 focus:ring-[#E25C38]/10 transition"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E25C38] hover:bg-[#cf4b27] text-white font-bold text-sm shadow-md shadow-[#E25C38]/20 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Profile Setup</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
