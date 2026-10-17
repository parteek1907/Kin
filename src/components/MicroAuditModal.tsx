'use client';

import React, { useState } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { 
  Lock, 
  X, 
  CheckCircle2, 
  Terminal, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Code2
} from 'lucide-react';

export default function MicroAuditModal() {
  const {
    isMicroAuditModalOpen,
    setIsMicroAuditModalOpen,
    selectedNode,
    activeIntent,
    confirmVouch
  } = useNetwork();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAudited, setIsAudited] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isMicroAuditModalOpen || !selectedNode) return null;

  const challenge = {
    title: 'Cold-Path Technical Architecture Micro-Audit (60s)',
    context: `To bypass cold outreach spam and protect ${selectedNode.name}'s calendar without a warm campus bridge, solve this 1-question architecture problem generated directly from ${selectedNode.proofOfWork?.repos[0]?.name || 'ziro-offline-fintech'}:`,
    question: 'How does the IndexedDB local ledger prevent double-spending when two offline peer devices execute conflicting transactions before reconnecting to the consensus relay?',
    options: [
      {
        id: 0,
        text: 'A. Uses Merkle-DAG state tree hashing with deterministic sequence numbers and Lamport logical clocks to order offline mutations.',
        correct: true,
        critique: '✅ Correct! Exactly matches the implementation in src/sync/ledger-store.ts: L142-L189.'
      },
      {
        id: 1,
        text: 'B. Relies on client wall-clock timestamps (Date.now()) and discards transactions older than 60 seconds.',
        correct: false,
        critique: '❌ Incorrect. Wall-clock time is vulnerable to clock skew and replay attacks.'
      },
      {
        id: 2,
        text: 'C. Rejects all offline transactions until an active 5G/Wi-Fi WebSocket connection is established.',
        correct: false,
        critique: '❌ Incorrect. Conduit proof-of-work verifies zero-connectivity offline-first operation.'
      }
    ]
  };

  const handleVerify = () => {
    if (selectedOption === null) return;
    const opt = challenge.options[selectedOption];
    setFeedback(opt.critique);
    if (opt.correct) {
      setIsAudited(true);
      // Automatically unlock warm vouch
      setTimeout(() => {
        confirmVouch();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl glass-panel rounded-3xl shadow-2xl overflow-hidden border border-cyan-500/30 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-obsidian-surface/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan">
              <Lock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">60-Second Technical Micro-Audit</h2>
              <p className="text-[11px] font-mono text-cyan-400">COLD-PATH TRUST UNLOCK FOR {selectedNode.name.toUpperCase()}</p>
            </div>
          </div>

          <button
            onClick={() => setIsMicroAuditModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            {challenge.context}
          </p>

          <div className="p-3.5 rounded-xl bg-obsidian-deep border border-white/10 font-mono text-xs text-white">
            <span className="text-cyan-400 font-bold block mb-1">PROMPT:</span>
            {challenge.question}
          </div>

          {/* Options */}
          <div className="space-y-2">
            {challenge.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                disabled={isAudited}
                className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition-all ${
                  selectedOption === opt.id
                    ? 'bg-cyan-950/80 border-cyan-400 text-white font-medium shadow-glow-cyan'
                    : 'bg-obsidian-surface border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`p-3 rounded-xl border text-xs font-mono ${
              isAudited ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}>
              {feedback}
            </div>
          )}

          {isAudited ? (
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-400 text-center space-y-1">
              <div className="text-xs font-bold font-mono text-emerald-300 flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Micro-Audit Passed! Cold Route Transformed into Solid Gold Vouch!</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                Auto-creating 3-person WhatsApp intro group with {selectedNode.name}.
              </p>
            </div>
          ) : (
            <button
              onClick={handleVerify}
              disabled={selectedOption === null}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-obsidian font-extrabold text-xs font-mono tracking-wider shadow-glow-cyan transition-all disabled:opacity-40"
            >
              SUBMIT & UNLOCK WARM ROUTE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
