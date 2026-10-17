'use client';

import React, { useEffect } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { Sparkles, CheckCircle2, X, Zap } from 'lucide-react';

export default function ToastAlert() {
  const { lastToast, clearToast } = useNetwork();

  useEffect(() => {
    if (!lastToast) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [lastToast, clearToast]);

  if (!lastToast) return null;

  const isGold = lastToast.type === 'gold';
  const isCyan = lastToast.type === 'cyan';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div className={`p-4 rounded-2xl glass-panel shadow-2xl border flex items-start space-x-3 ${
        isGold
          ? 'border-amber-400 bg-amber-950/80 shadow-glow-gold'
          : isCyan
          ? 'border-cyan-400 bg-cyan-950/80 shadow-glow-cyan'
          : 'border-emerald-400 bg-emerald-950/80 shadow-glow-green'
      }`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isGold ? 'bg-amber-400 text-obsidian' : isCyan ? 'bg-cyan-400 text-obsidian' : 'bg-emerald-400 text-obsidian'
        }`}>
          {isGold ? <Sparkles className="w-5 h-5" /> : isCyan ? <Zap className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>

        <div className="flex-1">
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{lastToast.title}</h4>
          <p className="text-xs text-slate-200 mt-0.5 leading-snug">{lastToast.message}</p>
        </div>

        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
