'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, X, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: any) => void;
}

export default function ResumeUploadModal({ isOpen, onClose, onSuccess }: ResumeUploadModalProps) {
  const { setParsedProfile } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    setIsLoading(true);

    try {
      let extractedText = '';

      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        extractedText = await file.text();
      } else {
        // For PDF/Word binary files, read text content or use filename + sample matching
        extractedText = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === 'string') {
              resolve(content);
            } else {
              // Extract text representation
              resolve(file.name);
            }
          };
          reader.readAsText(file);
        });
      }

      await submitToParser(extractedText, file.name);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Error reading resume file.');
    }
  };

  const submitToParser = async (text: string, fileName?: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          fileName,
          isSampleDarsh: false
        })
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setParsedProfile(data.profile);
        if (onSuccess) onSuccess(data.profile);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to parse resume.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to analyze resume.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.2)] text-slate-900"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Mascot */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="relative w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
            <Image
              src="/images/kin_mascot_transparent.png"
              alt="Kin AI"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Upload Your CV / Resume</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Automatically parses skills, experience, and populates your personalized dashboard
            </p>
          </div>
        </div>

        {/* Dropzone Area */}
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
          className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center ${
            isDragging
              ? 'border-[#E25C38] bg-orange-50/30'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            id="cv-upload-input"
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <label
            htmlFor="cv-upload-input"
            className="cursor-pointer flex flex-col items-center justify-center w-full"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center mb-2.5">
              <UploadCloud className="w-6 h-6 text-[#E25C38]" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              Drag & Drop your CV / Resume here
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              Supports PDF, Word (.docx), TXT, or Markdown
            </span>
            <span className="mt-3 inline-block px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-black transition-colors">
              Browse Files
            </span>
          </label>
        </div>

        {/* Or Paste Raw Text Option */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Or Paste Resume Text
            </span>
            {rawText.length > 0 && (
              <span className="text-[10px] text-slate-400">{rawText.length} chars</span>
            )}
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your resume text, bio, or LinkedIn experience here..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] resize-none"
          />
          {rawText.trim().length > 15 && (
            <button
              onClick={() => submitToParser(rawText)}
              disabled={isLoading}
              className="mt-2 w-full py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E25C38]" />
              <span>Analyze with Kin</span>
            </button>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Loading Spinner with Mascot */}
        {isLoading && (
          <div className="absolute inset-0 rounded-3xl bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="relative w-20 h-20 mb-3"
            >
              <Image
                src="/images/kin_mascot_transparent.png"
                alt="Kin AI Analyzing"
                fill
                className="object-contain"
              />
            </motion.div>
            <h3 className="text-sm font-bold text-slate-900">Kin is reading your CV...</h3>
            <p className="text-xs text-slate-500 mt-1 text-center">
              Extracting skills, career trajectory, and finding high-match opportunities
            </p>
            <div className="mt-4 w-40 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-[#E25C38] rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
