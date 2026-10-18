'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  X,
  GraduationCap,
  Briefcase,
  UploadCloud,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import KinMascot from '@/components/KinMascot';

interface EnterNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnterNetworkModal({ isOpen, onClose }: EnterNetworkModalProps) {
  const router = useRouter();
  const { setParsedProfile } = useAuth();
  
  const [step, setStep] = useState<'role' | 'upload'>('role');
  const [isDragging, setIsDragging] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAlumni = () => {
    try {
      localStorage.setItem('kin_network_role', 'alumni');
    } catch {}
    onClose();
    router.push('/dashboard?role=alumni');
  };

  const handleSelectStudent = () => {
    try {
      localStorage.setItem('kin_network_role', 'student');
    } catch {}
    setStep('upload');
  };

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      let extractedText = '';
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        extractedText = await file.text();
      } else {
        extractedText = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result;
            resolve(typeof content === 'string' ? content : file.name);
          };
          reader.readAsText(file);
        });
      }

      await submitCv(extractedText, file.name);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Error processing CV file.');
    }
  };

  const submitCv = async (text: string, fileName?: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          fileName,
          isSampleDarsh: false,
        }),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setParsedProfile(data.profile);
        onClose();
        router.push('/dashboard?role=student');
      } else {
        throw new Error(data.error || 'Failed to read CV.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to analyze resume.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] text-slate-900 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-xl cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ───────── STEP 1: ROLE SELECTION (Student vs Alumni) ───────── */}
        {step === 'role' && (
          <div className="flex flex-col animate-in fade-in duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 relative filter drop-shadow-[0_6px_12px_rgba(226,92,56,0.25)]">
                <KinMascot pose="welcome" size={48} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Enter KIN Network</h2>
                <p className="text-xs text-slate-500 mt-0.5">Select your role to personalize your experience</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              {/* Student Option */}
              <button
                onClick={handleSelectStudent}
                className="group p-5 rounded-2xl bg-gradient-to-b from-orange-50/50 to-amber-50/30 hover:to-orange-100/40 border border-orange-200/80 hover:border-[#E25C38] text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#E25C38] text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Student</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Upload your CV to verify skills, explore paid bounties, and uncover hidden career opportunities.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#E25C38]">
                  <span>Continue as Student</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Alumni Option */}
              <button
                onClick={handleSelectAlumni}
                className="group p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-400 text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Alumni</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Access campus talent directory, mentor upcoming builders, and hire verified engineers.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-900">
                  <span>Enter Alumni Hub</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ───────── STEP 2: STUDENT CV UPLOAD ───────── */}
        {step === 'upload' && (
          <div className="flex flex-col animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setStep('role')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  ← Back
                </button>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-800">Student Onboarding</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-slate-900 tracking-tight mb-1">
              Upload Your CV / Resume
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Upload your resume in any format. Kin will analyze your repositories, verify skills, and populate your dashboard.
            </p>


            {/* Drag & Drop File Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileProcess(e.dataTransfer.files[0]);
                }
              }}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-[#E25C38] bg-orange-50/40'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                id="enter-network-cv-input"
                accept=".pdf,.doc,.docx,.txt,.md,image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <label
                htmlFor="enter-network-cv-input"
                className="cursor-pointer flex flex-col items-center justify-center w-full"
              >
                <div className="w-11 h-11 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-2">
                  <UploadCloud className="w-5 h-5 text-[#E25C38]" />
                </div>
                <span className="text-xs font-bold text-slate-900">
                  Drag & drop your CV in any format
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  PDF, DOCX, TXT, Markdown, or Image
                </span>
                <span className="mt-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[11px] font-bold shadow-xs">
                  Choose File
                </span>
              </label>
            </div>

            {/* Paste Text Fallback */}
            <div className="mt-3">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Or paste resume text, bio, or links here..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] resize-none"
              />
              {rawText.trim().length > 15 && (
                <button
                  onClick={() => submitCv(rawText)}
                  disabled={isLoading}
                  className="mt-2 w-full py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Analyze CV</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* ───────── LOADING STATE: KIN IS READING YOUR CV ───────── */}
        {isLoading && (
          <div className="absolute inset-0 rounded-3xl bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 animate-in fade-in duration-150">
            <div className="w-24 h-24 relative mb-3 filter drop-shadow-[0_12px_24px_rgba(226,92,56,0.25)]">
              <KinMascot pose="welcome" size={96} />
            </div>
            <h3 className="text-base font-black text-slate-900">Kin is reading your CV...</h3>
            <p className="text-xs text-slate-500 mt-1 text-center max-w-xs">
              Fetching details from GitHub and LinkedIn, verifying skills, and generating your custom dashboard.
            </p>
            <div className="mt-4 w-44 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-[#E25C38] rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
