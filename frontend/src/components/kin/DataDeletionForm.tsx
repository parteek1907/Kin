'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, KeyRound, Phone, AlertCircle, Copy, Check, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

export default function DataDeletionForm() {
  const [step, setStep] = useState<'input-phone' | 'input-code' | 'completed'>('input-phone');
  const [phone, setPhone] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string>('');
  const [deletionResult, setDeletionResult] = useState<{
    confirmationCode: string;
    timestamp: string;
    status: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone.trim()) {
      setError('Please enter your WhatsApp phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-code', phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      setMaskedPhone(data.maskedPhone || phone);
      setStep('input-code');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please verify your phone number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim() || code.trim().length !== 6) {
      setError('Please enter the 6-digit verification code received on WhatsApp.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-and-delete', phone, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed. Please check the code.');
      }

      setDeletionResult({
        confirmationCode: data.confirmationCode,
        timestamp: data.timestamp,
        status: data.status,
      });
      setStep('completed');
    } catch (err: any) {
      setError(err.message || 'Failed to confirm data deletion.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (deletionResult?.confirmationCode) {
      navigator.clipboard.writeText(deletionResult.confirmationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-[#11131A] rounded-3xl border border-white/10 p-6 md:p-10 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#B6E64A]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#B6E64A]/10 border border-[#B6E64A]/30 flex items-center justify-center text-[#B6E64A]">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            className="text-xl font-bold text-white tracking-wide"
          >
            Interactive Self-Service Deletion Form
          </h3>
          <p className="text-[#9CA3AF] text-sm">
            Instant 2-step verification and permanent record erasure
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start space-x-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Enter Phone Number */}
      {step === 'input-phone' && (
        <form onSubmit={handleRequestCode} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#FFFDF8] mb-2">
              WhatsApp Registered Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#1A1D26] border border-white/15 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#B6E64A] transition-colors text-[15px]"
                required
              />
            </div>
            <p className="text-xs text-[#9CA3AF] mt-2">
              Include your country code (e.g. +91 for India). We will send a 6-digit confirmation code via WhatsApp to verify identity before deletion.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3.5 rounded-full bg-[#B6E64A] text-[#11131A] font-bold text-sm tracking-wider uppercase hover:bg-[#cbf568] transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(182,230,74,0.3)] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Dispatching Code...</span>
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: Enter 6-digit Code */}
      {step === 'input-code' && (
        <form onSubmit={handleVerifyAndDelete} className="space-y-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-[#D1D5DB]">
            A 6-digit verification code has been dispatched to{' '}
            <strong className="text-[#B6E64A] font-mono">{maskedPhone}</strong> on WhatsApp.
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFDF8] mb-2">
              6-Digit WhatsApp Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-[#1A1D26] border border-white/15 rounded-xl pl-12 pr-4 py-3.5 text-white font-mono tracking-[0.3em] text-lg placeholder-gray-600 focus:outline-none focus:border-[#B6E64A] transition-colors"
                required
              />
            </div>
            <p className="text-xs text-[#9CA3AF] mt-2">
              Code is valid for 10 minutes. Submitting will permanently erase all records.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Permanently Erasing Data...</span>
                </>
              ) : (
                <span>Confirm & Permanently Erase Data</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('input-phone');
                setCode('');
                setError(null);
              }}
              className="text-xs text-[#9CA3AF] hover:text-white underline flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Change phone number</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Completed State */}
      {step === 'completed' && deletionResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <h4 className="text-lg font-bold text-white">Permanent Erasure Completed</h4>
            </div>
            <p className="text-sm text-emerald-300 leading-relaxed">
              All personal data, contact information, requirements, message contents, audio transcripts, and introduction records have been permanently erased from KIN systems in compliance with India's DPDP Act 2023.
            </p>
          </div>

          {/* Confirmation Code Card */}
          <div className="p-5 rounded-2xl bg-[#1A1D26] border border-white/10 space-y-3">
            <div className="text-xs font-mono tracking-wider text-[#9CA3AF] uppercase">
              Official Compliance Confirmation Code
            </div>
            <div className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-xl border border-white/10">
              <span className="font-mono text-lg font-bold text-[#B6E64A] tracking-wider">
                {deletionResult.confirmationCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1 text-xs font-mono text-[#9CA3AF] hover:text-white px-2 py-1 bg-white/5 rounded transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#9CA3AF] pt-2">
              <span>Timestamp: {new Date(deletionResult.timestamp).toUTCString()}</span>
              <span className="text-emerald-400 font-medium">Status: Permanently Erased</span>
            </div>
          </div>

          <div className="text-xs text-[#9CA3AF] leading-relaxed border-t border-white/10 pt-4">
            ℹ️ Only an anonymous cryptographic SHA-256 hash has been logged in compliance with audit requirements. No personal identifiers or phone numbers remain in any active KIN database.
          </div>

          <button
            type="button"
            onClick={() => {
              setStep('input-phone');
              setPhone('');
              setCode('');
              setDeletionResult(null);
            }}
            className="text-xs text-[#B6E64A] hover:underline font-mono"
          >
            ← Submit another request
          </button>
        </div>
      )}
    </div>
  );
}
