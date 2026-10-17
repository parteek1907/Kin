'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, UserCheck, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || (mode === 'signup' ? 'Prateek Sharma' : 'Prateek');
    const finalEmail = email.trim() || 'prateek@iiitd.ac.in';
    login(finalName, finalEmail);
  };

  const handleQuickDemo = (demoName: string, demoEmail: string) => {
    login(demoName, demoEmail);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-[32px] bg-white/85 border border-white/90 p-7 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.15)] backdrop-blur-3xl text-slate-900"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#E25C38] flex items-center justify-center text-white font-black text-sm shadow-sm">
              K
            </div>
            <span className="text-sm font-extrabold tracking-tight text-slate-900">KIN Access</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {mode === 'signup' ? 'Create your builder profile' : 'Welcome back'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {mode === 'signup'
              ? 'Connect your verified identity to unlock the talent graph.'
              : 'Sign in to access your telemetry, bounties, and matches.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100/90 p-1 my-5 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Get Started (Sign Up)
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
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
              className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>{mode === 'signup' ? 'Complete & Get Started' : 'Sign In to KIN'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="mt-5 pt-4 border-t border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">
              Or 1-Tap Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('Prateek', 'prateek@iiitd.ac.in')}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-[#E25C38] text-[11px] font-bold text-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full bg-[#E25C38]/15 text-[#E25C38] flex items-center justify-center text-[10px] font-black">
                  P
                </span>
                <span>As Prateek</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Aarav Sharma', 'aarav@anthropic.com')}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-[#E25C38] text-[11px] font-bold text-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-black">
                  A
                </span>
                <span>As Aarav</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
