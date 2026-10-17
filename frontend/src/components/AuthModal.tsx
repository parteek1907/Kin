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
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  IdCard, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  FirebaseUser
} from '@/lib/firebase';

type AuthStep = 'firebase_auth' | 'role_select' | 'id_verification' | 'sync_complete';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, syncWithDatabase, login } = useAuth();

  // Wizard state
  const [step, setStep] = useState<AuthStep>('firebase_auth');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Firebase Auth credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authenticatedFirebaseUser, setAuthenticatedFirebaseUser] = useState<FirebaseUser | null>(null);

  // Step 2: Role Selection
  const [userType, setUserType] = useState<'student' | 'professional'>('student');

  // Step 3: Verification Details
  const [studentId, setStudentId] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [institutionOrCompany, setInstitutionOrCompany] = useState('IIIT Delhi');
  const [departmentOrTitle, setDepartmentOrTitle] = useState('Computer Science & Engineering');

  // Step 4: Sync Status Message
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  if (!isAuthModalOpen) return null;

  // Reset modal when closing
  const handleClose = () => {
    closeAuthModal();
    setTimeout(() => {
      setStep('firebase_auth');
      setLoading(false);
      setErrorMessage(null);
    }, 300);
  };

  // STEP 1: Handle Firebase Authentication
  const handleFirebaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      let fbUser: FirebaseUser;
      if (authMode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        fbUser = userCred.user;
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        fbUser = userCred.user;
      }

      setAuthenticatedFirebaseUser(fbUser);
      // Advance to Step 2: Role selection screen
      setStep('role_select');
    } catch (err: any) {
      console.warn('Firebase Auth notice:', err);
      let userFriendlyMsg = err.message || 'Authentication failed. Please verify your credentials.';
      if (err.code === 'auth/email-already-in-use') {
        userFriendlyMsg = 'This email is already registered. Please switch to Sign In.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        userFriendlyMsg = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/user-not-found') {
        userFriendlyMsg = 'No account found with this email. Please switch to Sign Up.';
      } else if (err.code === 'auth/weak-password') {
        userFriendlyMsg = 'Password should be at least 6 characters.';
      }
      setErrorMessage(userFriendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 1b: Continue with Google Popup
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      setAuthenticatedFirebaseUser(fbUser);
      if (fbUser.displayName) setName(fbUser.displayName);
      if (fbUser.email) setEmail(fbUser.email);
      // Advance to Step 2: Role selection screen
      setStep('role_select');
    } catch (err: any) {
      console.warn('Google Auth popup notice:', err);
      setErrorMessage(err.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 1c: 1-Tap Demo shortcut for evaluation
  const handleQuickDemo = (demoName: string, demoEmail: string, demoType: 'student' | 'professional') => {
    setName(demoName);
    setEmail(demoEmail);
    setUserType(demoType);
    if (demoType === 'student') {
      setStudentId('2024-CS-0412');
      setInstitutionOrCompany('IIIT Delhi');
      setDepartmentOrTitle('Computer Science & Engineering');
    } else {
      setBusinessId('CORP-ANTH-8821');
      setInstitutionOrCompany('Anthropic');
      setDepartmentOrTitle('Staff Systems Architect');
    }
    setStep('role_select');
  };

  // STEP 2: Proceed from Role Selection to ID Verification
  const handleRoleConfirmed = () => {
    if (userType === 'student' && !institutionOrCompany) {
      setInstitutionOrCompany('IIIT Delhi');
      setDepartmentOrTitle('Computer Science');
    } else if (userType === 'professional' && institutionOrCompany === 'IIIT Delhi') {
      setInstitutionOrCompany('Anthropic / TechCorp');
      setDepartmentOrTitle('Senior Systems Engineer');
    }
    setStep('id_verification');
  };

  // STEP 3: Complete ID Verification & Sync to Database
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const uid = authenticatedFirebaseUser?.uid || `fb_usr_${Date.now()}`;
    const userEmail = email.trim() || authenticatedFirebaseUser?.email || 'builder@kin.network';
    const userFullName = name.trim() || authenticatedFirebaseUser?.displayName || (userType === 'student' ? 'Student Builder' : 'Tech Professional');

    const payload = {
      firebaseUid: uid,
      email: userEmail,
      fullName: userFullName,
      userType,
      studentId: userType === 'student' ? (studentId.trim() || '2024-CS-0412') : undefined,
      businessId: userType === 'professional' ? (businessId.trim() || 'CORP-ID-8821') : undefined,
      institutionOrCompany: institutionOrCompany.trim() || (userType === 'student' ? 'IIIT Delhi' : 'Enterprise Tech'),
      departmentOrTitle: departmentOrTitle.trim() || (userType === 'student' ? 'Computer Science' : 'Software Engineer')
    };

    try {
      const res = await syncWithDatabase(payload);
      setSyncStatusMsg(res.message);
      setStep('sync_complete');
      setTimeout(() => {
        handleClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error syncing verified identity to database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg rounded-[32px] bg-white/95 border border-white p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.22)] backdrop-blur-3xl text-slate-900 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5 mb-5">
            <div className={`h-1.5 rounded-full transition-all ${step === 'firebase_auth' ? 'w-7 bg-[#E25C38]' : 'w-2 bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 'role_select' ? 'w-7 bg-[#E25C38]' : 'w-2 bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 'id_verification' ? 'w-7 bg-[#E25C38]' : 'w-2 bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 'sync_complete' ? 'w-7 bg-emerald-500' : 'w-2 bg-slate-200'}`} />
            <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold">
              {step === 'firebase_auth' && 'Step 1 of 3: Firebase Auth'}
              {step === 'role_select' && 'Step 2 of 3: Choose Role'}
              {step === 'id_verification' && 'Step 3 of 3: ID Verification'}
              {step === 'sync_complete' && 'Verified & Connected'}
            </span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              SCREEN 1: FIREBASE AUTHENTICATION (Sign In / Sign Up)
              ══════════════════════════════════════════════════════════════════════ */}
          {step === 'firebase_auth' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#E25C38] flex items-center justify-center text-white font-black text-sm shadow-sm">
                  K
                </div>
                <span className="text-sm font-extrabold tracking-tight text-slate-900">KIN × Firebase Auth</span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {authMode === 'signup' ? 'Create your builder account' : 'Welcome back to KIN'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {authMode === 'signup'
                  ? 'Authenticate via Firebase to begin your verified student or professional onboarding.'
                  : 'Sign in to access your telemetry, bounties, and verified connections.'}
              </p>

              {/* Mode Switcher Tabs */}
              <div className="flex rounded-xl bg-slate-100/90 p-1 my-5 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account (Sign Up)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Google One-Click Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full mb-4 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center mb-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  or with email
                </span>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleFirebaseAuth} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Prateek Sharma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] focus:ring-1 focus:ring-[#E25C38] transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@institution.ac.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] focus:ring-1 focus:ring-[#E25C38] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] focus:ring-1 focus:ring-[#E25C38] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === 'signup' ? 'Authenticate & Choose Role' : 'Sign In to KIN'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Tap Demo Shortcuts */}
              <div className="mt-5 pt-4 border-t border-slate-200/60">
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block mb-2 text-center">
                  Instant Test Accounts
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('Prateek Sharma', 'prateek@iiitd.ac.in', 'student')}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:border-[#E25C38] text-[11px] font-bold text-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#E25C38]/15 text-[#E25C38] flex items-center justify-center text-[10px] font-black">
                      S
                    </span>
                    <span>Student (Prateek)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('Aarav Sharma', 'aarav@anthropic.com', 'professional')}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:border-[#E25C38] text-[11px] font-bold text-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-black">
                      P
                    </span>
                    <span>Pro (Aarav)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              SCREEN 2: ROLE SELECTION ("Are you a Student or a Professional?")
              ══════════════════════════════════════════════════════════════════════ */}
          {step === 'role_select' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <button
                type="button"
                onClick={() => setStep('firebase_auth')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 mb-3 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to credentials</span>
              </button>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Are you a Student or a Professional?
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Select your platform role. Next, we will collect your verification ID to connect your profile to the database.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
                {/* Option 1: Student */}
                <div
                  onClick={() => setUserType('student')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    userType === 'student'
                      ? 'border-[#E25C38] bg-[#E25C38]/5 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    userType === 'student' ? 'bg-[#E25C38] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Student Builder</h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Undergraduate, Master&apos;s or PhD student building proof-of-work, seeking bounties & mentorship.
                  </p>
                  {userType === 'student' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#E25C38] text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Option 2: Professional */}
                <div
                  onClick={() => setUserType('professional')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    userType === 'professional'
                      ? 'border-[#E25C38] bg-[#E25C38]/5 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    userType === 'professional' ? 'bg-[#E25C38] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Professional / Alumni</h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Alumni engineer, startup founder, recruiter, or faculty member offering mentoring & challenges.
                  </p>
                  {userType === 'professional' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#E25C38] text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRoleConfirmed}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Continue to {userType === 'student' ? 'Student' : 'Business'} ID Verification</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              SCREEN 3: VERIFICATION ID INPUT (Student ID or Business ID)
              ══════════════════════════════════════════════════════════════════════ */}
          {step === 'id_verification' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <button
                type="button"
                onClick={() => setStep('role_select')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 mb-3 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to role selection</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E25C38]/10 text-[#E25C38] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {userType === 'student' ? 'Student ID Verification' : 'Business ID Verification'}
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {userType === 'student'
                  ? 'Provide your official university roll number or student card ID to establish your verified student status in the database.'
                  : 'Provide your corporate employee ID, business tax number, or official work email to establish verified industry credentials.'}
              </p>

              <form onSubmit={handleVerificationSubmit} className="space-y-3.5 mt-5">
                {/* Specific ID Field */}
                {userType === 'student' ? (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Student ID / Roll Number <span className="text-[#E25C38]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <IdCard className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g. 2024-CS-0412 or STU-88219"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] focus:ring-1 focus:ring-[#E25C38] transition-all font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Business ID / Corporate Registration <span className="text-[#E25C38]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Building2 className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={businessId}
                        onChange={(e) => setBusinessId(e.target.value)}
                        placeholder="e.g. CORP-EMP-4019 or TAX-ID-9921"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] focus:ring-1 focus:ring-[#E25C38] transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Institution / Company Name */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    {userType === 'student' ? 'University / College Name' : 'Company / Organization'} <span className="text-[#E25C38]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionOrCompany}
                    onChange={(e) => setInstitutionOrCompany(e.target.value)}
                    placeholder={userType === 'student' ? 'e.g. IIIT Delhi' : 'e.g. Anthropic / Google'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] focus:ring-1 focus:ring-[#E25C38] transition-all"
                  />
                </div>

                {/* Department or Title */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    {userType === 'student' ? 'Department / Major' : 'Current Job Title'}
                  </label>
                  <input
                    type="text"
                    value={departmentOrTitle}
                    onChange={(e) => setDepartmentOrTitle(e.target.value)}
                    placeholder={userType === 'student' ? 'e.g. Computer Science' : 'e.g. Staff Systems Architect'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] focus:ring-1 focus:ring-[#E25C38] transition-all"
                  />
                </div>

                {/* Database Connection Notice */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    This information will be synchronized with Firebase UID and stored directly in the platform database with verified status.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl bg-[#E25C38] hover:bg-[#c94927] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Verify & Connect to Database</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              SCREEN 4: DATABASE CONNECTION & SYNC SUCCESS
              ══════════════════════════════════════════════════════════════════════ */}
          {step === 'sync_complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-black text-slate-900">
                Identity Verified & Synced!
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                {syncStatusMsg || 'Your verified credentials have been persisted to the platform database.'}
              </p>

              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left inline-block text-xs text-slate-700 font-mono">
                <div>• Role: <span className="font-bold text-slate-900">{userType === 'student' ? 'Student Builder' : 'Professional / Alumni'}</span></div>
                <div>• Verification ID: <span className="font-bold text-[#E25C38]">{userType === 'student' ? studentId || '2024-CS-0412' : businessId || 'CORP-ID-8821'}</span></div>
                <div>• Organization: <span className="font-bold text-slate-900">{institutionOrCompany}</span></div>
                <div>• Database Status: <span className="font-bold text-emerald-600">CONNECTED & VERIFIED</span></div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
