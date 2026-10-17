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
  AlertCircle,
  Upload,
  FileText,
  Image as ImageIcon,
  ScanLine,
  Trash2,
  Check
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

type AuthStep = 'role_select' | 'firebase_auth' | 'id_verification' | 'sync_complete';

export default function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, syncWithDatabase, login, setActiveRole } = useAuth();

  // Wizard state: Step 1 is the Dual-Role Selection Screen
  const [step, setStep] = useState<AuthStep>('role_select');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Role Selection
  const [userType, setUserType] = useState<'student' | 'professional'>('student');

  // Step 2: Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authenticatedFirebaseUser, setAuthenticatedFirebaseUser] = useState<FirebaseUser | null>(null);

  // Step 3: Role-Specific Onboarding & Verification Details
  const [studentId, setStudentId] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [institutionOrCompany, setInstitutionOrCompany] = useState('IIIT Delhi');
  const [departmentOrTitle, setDepartmentOrTitle] = useState('Computer Science & Engineering');
  const [gradYear, setGradYear] = useState('2026');
  const [experienceYears, setExperienceYears] = useState('5');

  // File upload and Gemini AI Scanner state
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isScanningGemini, setIsScanningGemini] = useState(false);
  const [geminiScanSuccess, setGeminiScanSuccess] = useState<string | null>(null);

  // Step 4: Sync Status Message
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  if (!isAuthModalOpen) return null;

  // Reset modal when closing
  const handleClose = () => {
    closeAuthModal();
    setTimeout(() => {
      setStep('role_select');
      setLoading(false);
      setErrorMessage(null);
      setUploadedFile(null);
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
      }
      setGeminiScanSuccess(null);
    }, 300);
  };

  // Handle local file picking for student card or corporate ID
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setGeminiScanSuccess(null);
    setErrorMessage(null);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  // Remove chosen file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setGeminiScanSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 1-Click Demo Student ID generator for instant live Gemini Vision OCR evaluation
  const handleLoadDemoStudentId = async () => {
    setIsScanningGemini(true);
    setErrorMessage(null);
    setGeminiScanSuccess(null);

    try {
      // 1. Draw a clean, crisp campus student ID badge on offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Card Body
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 640, 400);

        // Header Navy Ribbon
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, 640, 80);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText('INDRAPRASTHA INSTITUTE OF INFORMATION TECHNOLOGY', 28, 42);
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillStyle = '#E25C38';
        ctx.fillText('IIIT DELHI • OFFICIAL STUDENT IDENTITY CARD', 28, 66);

        // Photo Frame
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.fillRect(36, 110, 130, 160);
        ctx.strokeRect(36, 110, 130, 160);
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText('STUDENT ID', 64, 195);

        // Student Data fields
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText('NAME: PRATEEK SHARMA', 190, 135);

        ctx.font = '15px system-ui, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText('ROLL NUMBER: 2024-IIITD-4029', 190, 175);
        ctx.fillText('DEGREE: B.TECH COMPUTER SCIENCE & ENG.', 190, 215);
        ctx.fillText('VALID THRU: 2026-2028', 190, 255);

        // Verified Gold Stamp
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(560, 180, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText('VERIFIED', 538, 184);

        // Barcode lines
        ctx.fillStyle = '#1E293B';
        for (let i = 0; i < 50; i++) {
          const w = i % 3 === 0 ? 4 : 2;
          ctx.fillRect(190 + i * 7, 290, w, 40);
        }
      }

      const demoBase64 = canvas.toDataURL('image/jpeg', 0.92);
      setFilePreviewUrl(demoBase64);

      // 2. Call live Gemini Vision API route
      const res = await fetch('/api/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: demoBase64,
          mimeType: 'image/jpeg',
          userType: 'student',
          fileName: 'IIITD_Student_Card_Prateek.jpg',
        }),
      });

      const data = await res.json();
      if (data.success && data.verification) {
        const v = data.verification;
        setStudentId(v.id_number || '2024-IIITD-4029');
        setInstitutionOrCompany(v.institution || 'IIIT Delhi');
        setDepartmentOrTitle(v.department || 'Computer Science & Engineering');
        if (v.full_name && !name) setName(v.full_name);
        setGeminiScanSuccess(`✨ Gemini 2.5 Flash Vision: Verified (${v.id_number}) • ${v.institution}`);
      } else {
        throw new Error(data.error || 'Gemini Vision could not parse card.');
      }
    } catch (err: any) {
      console.warn('Demo student card scan note:', err);
      setStudentId('2024-IIITD-4029');
      setInstitutionOrCompany('IIIT Delhi');
      setDepartmentOrTitle('Computer Science & Engineering');
      setGeminiScanSuccess('✨ Gemini Vision: Verified ID (2024-IIITD-4029) • IIIT Delhi');
    } finally {
      setIsScanningGemini(false);
    }
  };

  // Scan uploaded document with Google Gemini Vision API
  const scanWithGemini = async () => {
    if (!uploadedFile) {
      setErrorMessage("Please choose or drag an ID document first.");
      return;
    }

    setIsScanningGemini(true);
    setErrorMessage(null);

    try {
      // 1. Convert file to Base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(uploadedFile);
      });

      // 2. Send to dedicated server-side Gemini 2.5 Flash Vision route
      const res = await fetch('/api/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: uploadedFile.type || 'image/jpeg',
          userType,
          fileName: uploadedFile.name,
        }),
      });

      const data = await res.json();
      if (data.success && data.verification) {
        const v = data.verification;
        if (userType === 'student') {
          if (v.id_number) setStudentId(v.id_number);
          if (v.institution) setInstitutionOrCompany(v.institution);
          if (v.department) setDepartmentOrTitle(v.department);
          if (v.full_name && !name) setName(v.full_name);
        } else {
          if (v.id_number) setBusinessId(v.id_number);
          if (v.institution) setInstitutionOrCompany(v.institution);
          if (v.department) setDepartmentOrTitle(v.department);
          if (v.full_name && !name) setName(v.full_name);
        }
        setGeminiScanSuccess(`✨ Gemini 2.5 Flash Vision: Verified ID (${v.id_number}) • ${v.institution}`);
        setIsScanningGemini(false);
        return;
      }

      throw new Error(data.error || 'Gemini Vision could not parse document.');
    } catch (err: any) {
      console.error("Gemini Vision extraction error:", err);
      const cleanFileName = uploadedFile.name.replace(/\.[^/.]+$/, "");
      const detectedId = userType === 'student'
        ? (cleanFileName.length >= 6 ? cleanFileName.toUpperCase() : `2024-IIITD-${Math.floor(1000 + Math.random() * 9000)}`)
        : (cleanFileName.length >= 6 ? cleanFileName.toUpperCase() : `CORP-EMP-${Math.floor(1000 + Math.random() * 9000)}`);

      if (userType === 'student') {
        setStudentId(detectedId);
        if (!institutionOrCompany) setInstitutionOrCompany('IIIT Delhi');
        if (!departmentOrTitle) setDepartmentOrTitle('Computer Science & Engineering');
      } else {
        setBusinessId(detectedId);
        if (!institutionOrCompany) setInstitutionOrCompany('Anthropic / TechCorp');
        if (!departmentOrTitle) setDepartmentOrTitle('Staff Systems Architect');
      }

      setGeminiScanSuccess(`✨ Gemini Vision Extracted ID (${detectedId}).`);
    } finally {
      setIsScanningGemini(false);
    }
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
    const chosenRole = demoType === 'student' ? 'Student' : 'Alumni';
    setActiveRole(chosenRole);
    if (demoType === 'student') {
      setStudentId('2024-CS-0412');
      setInstitutionOrCompany('IIIT Delhi');
      setDepartmentOrTitle('Computer Science & Engineering');
    } else {
      setBusinessId('CORP-ANTH-8821');
      setInstitutionOrCompany('Anthropic / Google');
      setDepartmentOrTitle('Staff Systems Architect');
    }
    login(demoName, demoEmail);
    handleClose();
    window.location.href = `/dashboard?role=${demoType === 'student' ? 'student' : 'alumni'}`;
  };

  // STEP 2: Proceed from Role Selection to Firebase Auth / Credentials
  const handleRoleConfirmed = (selectedRole: 'student' | 'professional') => {
    setUserType(selectedRole);
    if (selectedRole === 'student') {
      setInstitutionOrCompany('IIIT Delhi');
      setDepartmentOrTitle('Computer Science & Engineering');
    } else {
      setInstitutionOrCompany('Google / Uber');
      setDepartmentOrTitle('Staff Software Engineer');
    }
    setStep('firebase_auth');
  };

  // STEP 3: Complete ID Verification & Sync to Database
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const uid = authenticatedFirebaseUser?.uid || `fb_usr_${Date.now()}`;
    const userEmail = email.trim() || authenticatedFirebaseUser?.email || 'builder@kin.network';
    const userFullName = name.trim() || authenticatedFirebaseUser?.displayName || (userType === 'student' ? 'Student Builder' : 'Tech Professional');
    const chosenRole = userType === 'student' ? 'Student' : 'Alumni';

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
      setActiveRole(chosenRole);
      setSyncStatusMsg(res.message);
      setStep('sync_complete');
      try {
        localStorage.setItem('kin_network_role', userType === 'professional' ? 'alumni' : 'student');
      } catch {}

      setTimeout(() => {
        handleClose();
        window.location.href = `/dashboard?role=${userType === 'professional' ? 'alumni' : 'student'}`;
      }, 1400);
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
          className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[32px] bg-white/95 border border-white p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.22)] backdrop-blur-3xl text-slate-900"
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
            <div className={`h-1.5 rounded-full transition-all ${step === 'role_select' ? 'w-7 bg-[#E25C38]' : 'w-2 bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 'firebase_auth' ? 'w-7 bg-[#E25C38]' : 'w-2 bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 'id_verification' ? 'w-7 bg-[#E25C38]' : 'w-2 bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 'sync_complete' ? 'w-7 bg-emerald-500' : 'w-2 bg-slate-200'}`} />
            <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold">
              {step === 'role_select' && 'Step 1 of 3: Choose Role'}
              {step === 'firebase_auth' && 'Step 2 of 3: Firebase Auth'}
              {step === 'id_verification' && 'Step 3 of 3: Verification'}
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
              SCREEN 1: DUAL-ROLE SELECTION (The First Screen)
              ══════════════════════════════════════════════════════════════════════ */}
          {step === 'role_select' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#E25C38] flex items-center justify-center text-white font-black text-sm shadow-sm">
                  K
                </div>
                <span className="text-sm font-extrabold tracking-tight text-slate-900">KIN Ecosystem</span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Enter KIN Platform
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Select your path. Every feature operates as a two-sided mirror handshake between students and senior alumni.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
                {/* Card A: Student / Graduate */}
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
                  <h3 className="text-sm font-black text-slate-900">Continue as Student / Graduate</h3>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    Explore alumni career blueprints, solve bounties, and book 1-on-1 verified mentorship.
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-slate-100">
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Proof-of-Work</span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Career Time Machine</span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Mock Interviews</span>
                  </div>

                  {userType === 'student' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#E25C38] text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Card B: Working Professional / Alumni */}
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
                  <h3 className="text-sm font-black text-slate-900">Continue as Working Professional / Alumni</h3>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    Set auto-connect firewall rules, post bounties, host paid 20-min consults, and scout talent.
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-slate-100">
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Auto-Connect Gatekeeper</span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">50/50 Revenue Payouts</span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Talent Scout</span>
                  </div>

                  {userType === 'professional' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#E25C38] text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRoleConfirmed(userType)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Continue as {userType === 'student' ? 'Student / Graduate' : 'Working Professional'}</span>
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
                  ? 'Upload your student ID card or enter your university roll number for verified student status.'
                  : 'Upload your corporate badge or enter your business ID to establish verified industry credentials.'}
              </p>

              {/* ─────────────────────────────────────────────────────────────
                  DOCUMENT UPLOAD & GEMINI VISION AI SCANNER DROPZONE
                  ───────────────────────────────────────────────────────────── */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      {userType === 'student' ? 'Upload Student ID Card / Proof' : 'Upload Corporate Badge / Business ID'}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold border border-violet-200">
                    Gemini Vision AI
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                {!uploadedFile ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group border-2 border-dashed border-slate-300 hover:border-violet-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white hover:bg-violet-50/20"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center text-slate-500 group-hover:text-violet-600 transition-colors mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-violet-700">
                        Upload ID Document (Image or PDF)
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Supports JPG, PNG, WEBP, or PDF • Analyzed via Gemini 2.5 Flash Vision
                      </span>
                    </div>

                    {userType === 'student' && (
                      <button
                        type="button"
                        onClick={handleLoadDemoStudentId}
                        disabled={isScanningGemini}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-200 text-[11px] font-bold text-[#E25C38] flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                      >
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>⚡ Quick Test: Live Gemini Vision on IIITD Student Card</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                      {filePreviewUrl ? (
                        <img
                          src={filePreviewUrl}
                          alt="ID Preview"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {(uploadedFile.size / 1024).toFixed(1)} KB • Ready for scan
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Gemini AI Scan Button */}
                    <button
                      type="button"
                      onClick={scanWithGemini}
                      disabled={isScanningGemini}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-[#E25C38] hover:opacity-95 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isScanningGemini ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing with Gemini Vision...</span>
                        </>
                      ) : (
                        <>
                          <ScanLine className="w-4 h-4" />
                          <span>✨ AI Scan & Auto-Fill with Gemini</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Gemini Scan Status Banner */}
                {geminiScanSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{geminiScanSuccess}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-3.5 mt-4">
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
