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
      setTimeout(() => {
        confirmVouch();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-[36px] shadow-[0_25px_80px_rgba(20,24,21,0.2)] overflow-hidden border border-black/10 flex flex-col text-[#141815]">
        
        {/* Header */}
        <div className="p-6 border-b border-black/[0.08] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#E25C38] flex items-center justify-center text-white shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-extrabold text-[#141815]">60-Second Technical Micro-Audit</h2>
              <p className="text-[11px] font-mono text-[#E25C38] font-bold">COLD-PATH TRUST UNLOCK FOR {selectedNode.name.toUpperCase()}</p>
            </div>
          </div>

          <button
            onClick={() => setIsMicroAuditModalOpen(false)}
            className="p-2 rounded-full text-zinc-400 hover:text-[#141815] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-left">
          <p className="text-xs text-zinc-600 font-mono leading-relaxed">
            {challenge.context}
          </p>

          <div className="p-4 rounded-2xl bg-[#F7F5F0] border border-black/10 font-mono text-xs text-[#141815]">
            <span className="text-[#E25C38] font-bold block mb-1">PROMPT:</span>
            {challenge.question}
          </div>

          {/* Options */}
          <div className="space-y-2">
            {challenge.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                disabled={isAudited}
                className={`w-full text-left p-3.5 rounded-2xl border text-xs font-mono transition-all ${
                  selectedOption === opt.id
                    ? 'bg-[#141815] text-white border-[#141815] shadow-sm font-medium'
                    : 'bg-white border-black/10 text-zinc-700 hover:bg-[#FAF8F5]'
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`p-3.5 rounded-2xl border text-xs font-mono ${
              isAudited ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}>
              {feedback}
            </div>
          )}

          {isAudited ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-1">
              <div className="text-xs font-bold font-mono text-emerald-800 flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Micro-Audit Passed! Cold Route Transformed into Solid Gold Vouch!</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-mono">
                Auto-creating 3-person WhatsApp intro group with {selectedNode.name}.
              </p>
            </div>
          ) : (
            <button
              onClick={handleVerify}
              disabled={selectedOption === null}
              className="w-full py-3.5 rounded-full bg-[#E25C38] hover:bg-[#C94B29] text-white font-extrabold text-xs font-mono tracking-wider shadow-md transition-all disabled:opacity-40"
            >
              SUBMIT & UNLOCK WARM ROUTE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
