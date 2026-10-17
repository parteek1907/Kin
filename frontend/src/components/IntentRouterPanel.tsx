'use client';

import React, { useState } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { 
  Radio, 
  Search, 
  Send, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  PlusCircle, 
  X,
  Flame,
  Zap,
  ArrowRight
} from 'lucide-react';

interface IntentRouterPanelProps {
  embedded?: boolean;
  className?: string;
}

export default function IntentRouterPanel({ embedded = false, className = '' }: IntentRouterPanelProps) {
  const {
    intents,
    activeIntentId,
    selectIntent,
    searchIntentsByText,
    broadcastIntent,
    resetIntentFilter
  } = useNetwork();

  const [searchQuery, setSearchQuery] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [newIntentRole, setNewIntentRole] = useState('Founding Engineer Scout');
  const [newIntentText, setNewIntentText] = useState('');
  const [newIntentCategory, setNewIntentCategory] = useState<'Fintech' | 'AI / RAG' | 'Systems' | 'Spatial Computing'>('AI / RAG');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1-Click Interactive Preset Intent Chips
  const presetChips = [
    {
      id: 'intent-fintech-1',
      title: 'Rust / ZK-Rollup Builder',
      tag: 'FINTECH',
      icon: '⚡'
    },
    {
      id: 'intent-rag-2',
      title: 'Agentic RAG / pgvector',
      tag: 'AI / RAG',
      icon: '🧠'
    },
    {
      id: 'intent-systems-3',
      title: 'eBPF / Distributed Kernel',
      tag: 'SYSTEMS',
      icon: '⚙️'
    },
    {
      id: 'intent-spatial-4',
      title: 'WebGL / Kinetic Engine',
      tag: 'SPATIAL',
      icon: '🪐'
    }
  ];

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    searchIntentsByText(searchQuery);
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

  const containerClasses = embedded
    ? `w-full flex flex-col bg-white rounded-[32px] shadow-[0_16px_40px_rgba(20,24,21,0.06)] overflow-hidden border border-black/[0.08] text-[#141815] ${className}`
    : `fixed top-20 left-4 z-40 w-84 sm:w-96 max-h-[calc(100vh-6rem)] flex flex-col bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_25px_60px_rgba(20,24,21,0.15)] overflow-hidden border border-black/10 text-[#141815] ${className}`;

  return (
    <aside className={containerClasses}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-black/[0.08] flex items-center justify-between bg-[#FAF8F5]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#E25C38] flex items-center justify-center shadow-sm">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#141815]">Live Intent Router</h2>
            <p className="text-[10px] font-mono text-[#E25C38] font-bold">ARTIFACT-MATCHED DEMAND</p>
          </div>
        </div>

        {activeIntentId && (
          <button
            onClick={resetIntentFilter}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#EFECE5] hover:bg-[#E5E0D7] text-[11px] text-zinc-700 font-mono transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      {/* Natural Language Search / Broadcast Input */}
      <div className="p-4 border-b border-black/[0.08] bg-[#F7F5F0]">
        <form onSubmit={handleCustomSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type any natural language intent..."
            className="w-full pl-8 pr-16 py-2.5 rounded-full bg-white border border-black/10 focus:border-[#E25C38] text-xs text-[#141815] placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#E25C38] transition-all font-mono shadow-sm"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3.5" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-full bg-[#141815] hover:bg-[#E25C38] text-white font-bold text-[10px] tracking-wide transition-all shadow-sm"
          >
            ROUTE
          </button>
        </form>

        {/* 1-Click Preset Demo Intent Chips */}
        <div className="mt-3.5 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center space-x-1 font-bold">
              <Flame className="w-3 h-3 text-[#E25C38]" />
              <span>1-Click Live Demo Presets</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {presetChips.map(chip => {
              const isSelected = activeIntentId === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => selectIntent(chip.id)}
                  className={`text-left p-2.5 rounded-2xl border text-[11px] transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#141815] text-white border-[#141815] shadow-sm font-medium'
                      : 'bg-white border-black/[0.08] hover:border-black/20 text-zinc-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-xs">{chip.icon}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase ${isSelected ? 'text-[#E25C38]' : 'text-[#E25C38]'}`}>
                      {chip.tag}
                    </span>
                  </div>
                  <div className="text-[10px] font-medium leading-tight line-clamp-1">{chip.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Broadcast Capsule Action Button */}
      <div className="p-3 border-b border-black/[0.08] bg-[#FAF8F5] flex items-center justify-between">
        <button
          onClick={() => setIsBroadcasting(prev => !prev)}
          className="w-full py-2 px-3 rounded-full bg-white hover:bg-[#EFECE5] border border-black/10 text-xs font-semibold text-zinc-800 flex items-center justify-center space-x-2 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E25C38]" />
          <span>{isBroadcasting ? 'Close Intent Creator' : '+ Broadcast New Intent Capsule'}</span>
        </button>
      </div>

      {/* Inline Broadcast Form Drawer */}
      {isBroadcasting && (
        <form onSubmit={handleBroadcastSubmit} className="p-4 border-b border-black/[0.08] bg-[#F7F5F0] space-y-3 text-left">
          <div>
            <label className="text-[10px] font-mono text-zinc-500 block mb-1">YOUR IDENTITY / ROLE</label>
            <input
              type="text"
              value={newIntentRole}
              onChange={(e) => setNewIntentRole(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs text-[#141815] font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-zinc-500 block mb-1">PROBLEM STATEMENT / SPECIFICATION</label>
            <textarea
              rows={2}
              value={newIntentText}
              onChange={(e) => setNewIntentText(e.target.value)}
              placeholder="e.g. Seeking 2nd-year student with offline-first sync commits..."
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs text-[#141815] font-mono placeholder-zinc-400 focus:outline-none focus:border-[#E25C38]"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <select
              value={newIntentCategory}
              onChange={(e: any) => setNewIntentCategory(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-white border border-black/10 text-[11px] text-zinc-700 font-mono shadow-sm"
            >
              <option value="Fintech">Fintech</option>
              <option value="AI / RAG">AI / RAG</option>
              <option value="Systems">Systems</option>
              <option value="Spatial Computing">Spatial Computing</option>
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-full bg-[#E25C38] hover:bg-[#C94B29] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <Send className="w-3 h-3" />
              <span>Broadcast</span>
            </button>
          </div>
        </form>
      )}

      {/* Live Active Intent Capsules Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[360px]">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
          <span>Active Campus Capsules ({intents.length})</span>
          <span className="text-emerald-700 font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Live Telemetry</span>
          </span>
        </div>

        {intents.map(intent => {
          const isSelected = activeIntentId === intent.id;
          return (
            <div
              key={intent.id}
              onClick={() => selectIntent(intent.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all text-left ${
                isSelected
                  ? 'bg-[#FFF7F4] border-[#E25C38] shadow-sm ring-1 ring-[#E25C38]/30'
                  : 'bg-white border-black/[0.08] hover:border-black/20 hover:shadow-sm'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#F3EFEA] text-[#E25C38] font-bold uppercase">
                    {intent.category}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>{intent.expiresIn}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{intent.topMatchIds.length} Verified</span>
                </div>
              </div>

              {/* Author */}
              <div className="text-[11px] font-bold text-[#141815] mb-1 flex items-center space-x-1.5">
                <span>{intent.authorName}</span>
                <span className="text-zinc-500 text-[10px] font-normal">• {intent.authorRole}</span>
              </div>

              {/* Query Body */}
              <p className="text-xs text-zinc-600 leading-snug mb-2 font-mono line-clamp-2">
                "{intent.query}"
              </p>

              {/* Compensation & Duration */}
              {intent.compensation && (
                <div className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#FEF3C7] border border-amber-200 text-amber-800 flex items-center justify-between">
                  <span>💰 {intent.compensation}</span>
                  <span className="text-amber-700 font-semibold">{intent.duration}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
