'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Bell,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface NotificationPreferences {
  newMatch: boolean;
  trustRequest: boolean;
  nodeVerified: boolean;
  intentUpdate: boolean;
  weeklyDigest: boolean;
}

export default function WhatsAppNotificationsPage() {
  const shouldReduceMotion = useReducedMotion();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status & Data
  const [isLinked, setIsLinked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [phoneMasked, setPhoneMasked] = useState<string | null>(null);
  const [phoneE164, setPhoneE164] = useState('');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newMatch: true,
    trustRequest: true,
    nodeVerified: true,
    intentUpdate: true,
    weeklyDigest: true,
  });

  // Flow step: 'INPUT_PHONE' | 'INPUT_OTP' | 'VERIFIED'
  const [step, setStep] = useState<'INPUT_PHONE' | 'INPUT_OTP' | 'VERIFIED'>('INPUT_PHONE');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneInput, setPhoneInput] = useState('');
  const [optInAgreed, setOptInAgreed] = useState(false);

  // OTP inputs
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [unlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch initial settings
  useEffect(() => {
    fetchSettings();
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use local storage demo user ID or query default
      const userId = typeof window !== 'undefined' ? localStorage.getItem('conduit_user_id') || 'demo_user' : 'demo_user';
      const res = await fetch(`/api/whatsapp/settings?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.linked && data.verified) {
          setIsLinked(true);
          setIsVerified(true);
          setPhoneMasked(data.phoneMasked);
          setPhoneE164(data.phoneE164);
          setPreferences(data.preferences);
          setStep('VERIFIED');
        } else {
          setIsLinked(false);
          setIsVerified(false);
          setStep('INPUT_PHONE');
        }
      }
    } catch {
      setError('Failed to fetch WhatsApp notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!optInAgreed) {
      setError('You must agree to receive CONDUIT notifications on WhatsApp.');
      return;
    }

    if (!phoneInput || phoneInput.trim().length < 6) {
      setError('Please enter a valid phone number.');
      return;
    }

    const fullPhone = `${countryCode}${phoneInput.trim().replace(/^0+/, '')}`;
    setSubmitting(true);

    try {
      const userId = localStorage.getItem('conduit_user_id') || 'demo_user';
      const res = await fetch('/api/whatsapp/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setPhoneE164(fullPhone);
      setCooldown(data.cooldownSeconds || 60);
      setStep('INPUT_OTP');
      setSuccessMsg(data.message || 'Verification code sent to WhatsApp!');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 filled
    if (newDigits.every((d) => d !== '') && index === 5) {
      handleVerifyCode(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
      handleVerifyCode(pasted);
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const userId = localStorage.getItem('conduit_user_id') || 'demo_user';
      const res = await fetch('/api/whatsapp/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneE164, code, userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setIsLinked(true);
      setIsVerified(true);
      setSuccessMsg(data.message || 'Phone number verified successfully!');
      setStep('VERIFIED');
      fetchSettings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePreference = async (key: keyof NotificationPreferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);

    try {
      const userId = localStorage.getItem('conduit_user_id') || 'demo_user';
      await fetch('/api/whatsapp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone: phoneE164, preferences: newPrefs }),
      });
    } catch {
      setError('Failed to update preference');
    }
  };

  const handleUnlink = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const userId = localStorage.getItem('conduit_user_id') || 'demo_user';
      const res = await fetch('/api/whatsapp/settings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone: phoneE164 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to unlink phone');
      }

      setIsLinked(false);
      setIsVerified(false);
      setPhoneMasked(null);
      setPhoneInput('');
      setOtpDigits(['', '', '', '', '', '']);
      setStep('INPUT_PHONE');
      setUnlinkConfirmOpen(false);
      setSuccessMsg('WhatsApp phone unlinked and message data purged.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07080C] text-white pt-28 pb-20 px-[var(--gutter)] flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-zinc-400 hover:text-white uppercase transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-xs font-semibold tracking-wider text-[#B6E64A] uppercase">
            WhatsApp Notifications
          </span>
        </div>

        {/* Card Header */}
        <div className="bg-[#0F1117] border border-white/10 rounded-2xl p-6 sm:p-8 mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B6E64A]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#B6E64A]/10 border border-[#B6E64A]/30 flex items-center justify-center text-[#B6E64A]">
                <MessageSquare className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Meta WhatsApp Gateway
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Instant real-time notifications for verified matches and peer trust requests
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div>
              {loading ? (
                <span className="px-3 py-1 rounded-md bg-white/5 text-zinc-400 text-xs font-mono uppercase tracking-wider">
                  Loading...
                </span>
              ) : isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : step === 'INPUT_OTP' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider animate-pulse">
                  Pending OTP
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-400 text-xs font-mono uppercase tracking-wider">
                  Not Linked
                </span>
              )}
            </div>
          </div>

          {/* Feedback Banners */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3.5 rounded-xl bg-[#B6E64A]/10 border border-[#B6E64A]/30 text-[#B6E64A] text-xs flex items-center gap-2.5"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Section: 1. Phone Input Form */}
        {step === 'INPUT_PHONE' && !isVerified && (
          <div className="bg-[#0F1117] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-base font-semibold text-white mb-2">Link Your WhatsApp Number</h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Connect your verified phone number to receive automated match alerts and participate in the CONDUIT Proof Graph directly from WhatsApp.
            </p>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-zinc-300 uppercase mb-2">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-12 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#B6E64A] transition-colors"
                  >
                    <option value="+91" className="bg-[#0F1117]">🇮🇳 +91 (IN)</option>
                    <option value="+1" className="bg-[#0F1117]">🇺🇸 +1 (US)</option>
                    <option value="+44" className="bg-[#0F1117]">🇬🇧 +44 (UK)</option>
                    <option value="+65" className="bg-[#0F1117]">🇸🇬 +65 (SG)</option>
                    <option value="+971" className="bg-[#0F1117]">🇦🇪 +971 (AE)</option>
                  </select>

                  <input
                    type="tel"
                    placeholder="98110 22678"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#B6E64A] transition-colors font-mono tracking-wider"
                    required
                  />
                </div>
              </div>

              {/* Opt-in Compliance Checkbox */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <input
                  id="wa-opt-in"
                  type="checkbox"
                  checked={optInAgreed}
                  onChange={(e) => setOptInAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#B6E64A] focus:ring-0 focus:ring-offset-0 bg-white/10 border-white/20"
                />
                <label htmlFor="wa-opt-in" className="text-xs text-zinc-300 leading-normal cursor-pointer">
                  I agree to receive CONDUIT network updates on WhatsApp. Reply <strong className="text-white">STOP</strong> anytime to unsubscribe.
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !optInAgreed}
                className="w-full h-12 rounded-xl bg-[#B6E64A] text-[#07080C] font-semibold text-xs tracking-wider uppercase hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Content Section: 2. OTP Verification Form */}
        {step === 'INPUT_OTP' && !isVerified && (
          <div className="bg-[#0F1117] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-base font-semibold text-white mb-2">Enter 6-Digit Code</h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Enter the 6-digit verification code sent to your WhatsApp on <strong className="text-white font-mono">{phoneE164}</strong>. Code expires in 10 minutes.
            </p>

            <div className="space-y-6">
              {/* 6 OTP Boxes with Auto-Advance & Paste */}
              <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-sm mx-auto">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    aria-label={`Digit ${idx + 1} of verification code`}
                    className="w-11 sm:w-12 h-14 text-center text-xl font-bold font-mono rounded-xl bg-white/5 border border-white/15 focus:border-[#B6E64A] focus:outline-none transition-all text-white"
                  />
                ))}
              </div>

              <button
                onClick={() => handleVerifyCode()}
                disabled={submitting || otpDigits.some((d) => d === '')}
                className="w-full h-12 rounded-xl bg-[#B6E64A] text-[#07080C] font-semibold text-xs tracking-wider uppercase hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Link WhatsApp'
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('INPUT_PHONE')}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Change phone number
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={cooldown > 0 || submitting}
                  className="text-[#B6E64A] hover:opacity-80 transition-opacity disabled:text-zinc-500 disabled:pointer-events-none"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Section: 3. Verified State & Notification Toggles */}
        {isVerified && (
          <div className="space-y-6">
            {/* Phone Info & Unlink */}
            <div className="bg-[#0F1117] border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400 mb-1">Connected Number</div>
                <div className="text-lg font-mono font-bold text-white tracking-wide">
                  {phoneMasked || phoneE164}
                </div>
              </div>

              <button
                onClick={() => setUnlinkConfirmOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Unlink
              </button>
            </div>

            {/* Notification Toggles */}
            <div className="bg-[#0F1117] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-[#B6E64A]" />
                <h2 className="text-base font-semibold text-white">Notification Preferences</h2>
              </div>

              <div className="divide-y divide-white/5">
                {[
                  {
                    key: 'newMatch' as const,
                    title: 'New Intent Matches',
                    desc: 'Instant alert when a candidate node fits your active intent threshold',
                  },
                  {
                    key: 'trustRequest' as const,
                    title: 'Peer Trust & Vouch Requests',
                    desc: 'Direct WhatsApp prompt with Accept / Decline interactive buttons',
                  },
                  {
                    key: 'nodeVerified' as const,
                    title: 'Node Verification Status',
                    desc: 'Cryptographic proof updates and reputation score adjustments',
                  },
                  {
                    key: 'intentUpdate' as const,
                    title: 'Intent Activity Updates',
                    desc: 'Status shifts, reviews, and milestone completions on your intents',
                  },
                  {
                    key: 'weeklyDigest' as const,
                    title: 'Weekly Campus Orbit Digest',
                    desc: 'Weekly summary of network graph expansion and new talent radar nodes',
                  },
                ].map((item) => (
                  <div key={item.key} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-white">{item.title}</div>
                      <div className="text-xs text-zinc-400 leading-relaxed">{item.desc}</div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={preferences[item.key]}
                      onClick={() => handleTogglePreference(item.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        preferences[item.key] ? 'bg-[#B6E64A]' : 'bg-white/10'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#07080C] shadow-lg ring-0 transition duration-200 ease-in-out ${
                          preferences[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Unlink Confirmation Modal */}
        <AnimatePresence>
          {unlinkConfirmOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md w-full bg-[#0F1117] border border-white/15 rounded-2xl p-6 shadow-2xl"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Unlink WhatsApp Number?</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Unlinking will disable all WhatsApp match notifications and trigger the data-deletion protocol, purging your phone number and message audit history.
                </p>

                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setUnlinkConfirmOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold uppercase hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUnlink}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-xs font-semibold uppercase hover:bg-red-600 transition-colors shadow-lg flex items-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Unlink'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
