'use client';

import React, { useState } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { IntentCapsule } from '@/types';
import { 
  Radio, 
  Search, 
  Sparkles, 
  Clock, 
  Users, 
  Send, 
  CheckCircle2, 
  Compass, 
  X, 
  Flame, 
  ChevronRight,
  Code2
} from 'lucide-react';

export default function IntentRouterPanel() {
  const {
    intents,
    activeIntentId,
    selectIntent,
    broadcastIntent,
    resetIntentFilter
  } = useNetwork();

  const [searchQuery, setSearchQuery] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [newIntentText, setNewIntentText] = useState('');
  const [newIntentCategory, setNewIntentCategory] = useState<'Fintech' | 'AI / RAG' | 'Systems' | 'Spatial Computing'>('Fintech');
  const [newIntentRole, setNewIntentRole] = useState('Founder @ Stealth Seed (YC)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset demo chips
  const presetChips = [
    {
      id: 'intent-founder-fintech',
      icon: '🚀',
      tag: 'Founder Intent',
      title: 'Fintech Offline Sync + WebCrypto',
      text: 'Fintech seed startup seeking student with offline-first sync + WebCrypto commits for paid 6-week sprint.'
    },
    {
      id: 'intent-faculty-rag',
      icon: '🔬',
      tag: 'Faculty Intent',
      title: 'Multimodal OCR + RAG',
      text: 'Seeking 2 undergrad researchers with PyTorch multimodal OCR + RAG pipelines & an industry alumnus co-advisor.'
    },
    {
      id: 'intent-recruiter-systems',
      icon: '💼',
      tag: 'Recruiter Intent',
      title: 'FastAPI & pgvector Systems',
      text: 'Hiring systems engineer with real FastAPI, pgvector, and deterministic entity resolution production repos.'
    },
    {
      id: 'intent-student-ar',
      icon: '🎓',
      tag: 'Student Intent',
      title: 'AR Campus Mesh Review',
      text: 'Built an AR campus routing prototype; seeking 15-min architecture review from an alumnus in geospatial/AR systems.'
    }
  ];

  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await broadcastIntent(searchQuery, 'AI / RAG', 'Venture Tech Lead', '₹1,00,000 / mo');
    setSearchQuery('');
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntentText.trim()) return;
    setIsSubmitting(true);
    await broadcastIntent(newIntentText, newIntentCategory, newIntentRole);
    setNewIntentText('');
    setIsBroadcasting(false);
    setIsSubmitting(false);
  };

  return (
    <aside className="fixed top-20 left-4 z-30 w-84 sm:w-96 max-h-[calc(100vh-6rem)] flex flex-col glass-panel rounded-2xl shadow-2xl overflow-hidden border border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-surface/60">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Live Intent Router</h2>
            <p className="text-[10px] font-mono text-cyan-400">ARTIFACT-MATCHED DEMAND</p>
          </div>
        </div>

        {activeIntentId && (
          <button
            onClick={resetIntentFilter}
            className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/15 text-[11px] text-slate-300 font-mono transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      {/* Natural Language Search / Broadcast Input */}
      <div className="p-3 border-b border-white/10 bg-obsidian-deep/40">
        <form onSubmit={handleCustomSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type any natural language intent..."
            className="w-full pl-8 pr-16 py-2 rounded-xl bg-obsidian-surface border border-white/15 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#07090E] font-bold text-[10px] tracking-wide transition-all shadow-glow-cyan"
          >
            ROUTE
          </button>
        </form>

        {/* 1-Click Preset Demo Intent Chips */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>1-Click Live Demo Presets</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {presetChips.map(chip => {
              const isSelected = activeIntentId === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => selectIntent(chip.id)}
                  className={`text-left p-2 rounded-xl border text-[11px] transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-glow-cyan text-white font-medium'
                      : 'bg-obsidian-surface/60 border-white/10 hover:border-white/20 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-xs">{chip.icon}</span>
                    <span className="text-[9px] font-mono text-cyan-400 font-semibold uppercase">{chip.tag}</span>
                  </div>
                  <div className="text-[10px] font-medium leading-tight line-clamp-1">{chip.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Broadcast Capsule Action Button */}
      <div className="p-2 border-b border-white/10 bg-gradient-to-r from-cyan-950/30 to-purple-950/30 flex items-center justify-between">
        <button
          onClick={() => setIsBroadcasting(prev => !prev)}
          className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 flex items-center justify-center space-x-2 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isBroadcasting ? 'Close Intent Creator' : '+ Broadcast New Intent Capsule'}</span>
        </button>
      </div>

      {/* Inline Broadcast Form Drawer */}
      {isBroadcasting && (
        <form onSubmit={handleBroadcastSubmit} className="p-3 border-b border-white/10 bg-obsidian-elevated/80 space-y-2.5">
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">YOUR IDENTITY / ROLE</label>
            <input
              type="text"
              value={newIntentRole}
              onChange={(e) => setNewIntentRole(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian-deep border border-white/10 text-xs text-white font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">PROBLEM STATEMENT / SPECIFICATION</label>
            <textarea
              rows={2}
              value={newIntentText}
              onChange={(e) => setNewIntentText(e.target.value)}
              placeholder="e.g. Seeking 2nd-year student with offline-first sync commits..."
              className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian-deep border border-white/10 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <select
              value={newIntentCategory}
              onChange={(e: any) => setNewIntentCategory(e.target.value)}
              className="px-2 py-1 rounded bg-obsidian-deep border border-white/10 text-[11px] text-slate-300 font-mono"
            >
              <option value="Fintech">Fintech</option>
              <option value="AI / RAG">AI / RAG</option>
              <option value="Systems">Systems</option>
              <option value="Spatial Computing">Spatial Computing</option>
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-obsidian font-bold text-xs flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Broadcast</span>
            </button>
          </div>
        </form>
      )}

      {/* Live Active Intent Capsules Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Active Campus Capsules ({intents.length})</span>
          <span className="text-emerald-400">Live Telemetry</span>
        </div>

        {intents.map(intent => {
          const isSelected = activeIntentId === intent.id;
          return (
            <div
              key={intent.id}
              onClick={() => selectIntent(intent.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-obsidian-elevated/90 border-cyan-400 shadow-glow-cyan'
                  : 'bg-obsidian-surface/60 border-white/10 hover:border-white/20 hover:bg-obsidian-surface'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-semibold uppercase">
                    {intent.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{intent.expiresIn}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{intent.topMatchIds.length} Verified Matches</span>
                </div>
              </div>

              {/* Author */}
              <div className="text-[11px] font-bold text-white mb-1 flex items-center space-x-1.5">
                <span>{intent.authorName}</span>
                <span className="text-slate-500 text-[10px] font-normal">• {intent.authorRole}</span>
              </div>

              {/* Query Body */}
              <p className="text-xs text-slate-300 leading-snug mb-2 font-mono line-clamp-2">
                "{intent.query}"
              </p>

              {/* Compensation & Duration */}
              {intent.compensation && (
                <div className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 border border-white/5 text-amber-300 flex items-center justify-between">
                  <span>💰 {intent.compensation}</span>
                  <span className="text-slate-400">{intent.duration}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
