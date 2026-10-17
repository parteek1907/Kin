'use client';

import React from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { PersonaType } from '@/types';
import { 
  Network, 
  PlusCircle, 
  Radio, 
  Smartphone, 
  Layers, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Building2, 
  Compass, 
  GraduationCap, 
  Briefcase 
} from 'lucide-react';

export default function TopNavigation() {
  const {
    nodes,
    edges,
    intents,
    activePersonaFilter,
    setPersonaFilter,
    setIsIngestModalOpen,
    setIsRadarModalOpen,
    toggleWhatsApp,
    isWhatsAppOpen,
    whatsAppMessages
  } = useNetwork();

  const personaPills: { label: string; value: PersonaType | 'all' | 'institution-radar'; icon: any; colorClass: string }[] = [
    { label: 'All Network', value: 'all', icon: Compass, colorClass: 'border-white/20 text-white' },
    { label: 'Founder / Alumni View', value: 'founder', icon: Briefcase, colorClass: 'border-emerald-500/50 text-emerald-400' },
    { label: 'Student Builder View', value: 'student', icon: GraduationCap, colorClass: 'border-cyan-500/50 text-cyan-400' },
    { label: 'Faculty Research View', value: 'faculty', icon: ShieldCheck, colorClass: 'border-amber-500/50 text-amber-400' },
    { label: 'Recruiter View', value: 'recruiter', icon: Sparkles, colorClass: 'border-rose-500/50 text-rose-400' },
    { label: 'Institution Radar', value: 'institution-radar', icon: Building2, colorClass: 'border-indigo-500/50 text-indigo-400' },
  ];

  const totalCommits = nodes.reduce((sum, n) => sum + (n.proofOfWork?.totalCommits || 0), 0);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 glass-panel border-b border-white/10 px-4 flex items-center justify-between">
      {/* Brand lockup & Live Telemetry */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <img src="/images/kin_logo.png" alt="KIN" className="w-8 h-8 object-contain" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-[0.24em] text-white">
                KIN
              </span>
              <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-semibold">
                LIVING TRUST NETWORK
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5">
              <span>IIT/IIIT CAMPUS GRAPH</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium">ZERO-FORM PROOF-OF-WORK</span>
            </div>
          </div>
        </div>

        {/* Live Telemetry Pulse Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{nodes.length} Verified Nodes</span>
          <span className="text-emerald-600">•</span>
          <span>{edges.length} Trust Edges</span>
          <span className="text-emerald-600">•</span>
          <span>{intents.length} Active Intents</span>
        </div>
      </div>

      {/* Instant Persona View Switcher (Pill Selector) */}
      <div className="hidden md:flex items-center space-x-1 p-1 rounded-xl bg-obsidian-surface/90 border border-white/10 shadow-inner">
        {personaPills.map((pill) => {
          const Icon = pill.icon;
          const isActive = activePersonaFilter === pill.value;
          return (
            <button
              key={pill.value}
              onClick={() => setPersonaFilter(pill.value)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm border border-white/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Triggers */}
      <div className="flex items-center space-x-2.5">
        {/* Toggle back to Almas Landing Page */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('switch-view', { detail: 'landing' }));
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition-all shadow-sm"
        >
          <span>💎 Almas Landing Page</span>
        </button>


        {/* Institution Radar trigger (for mobile or quick toggle) */}
        <button
          onClick={() => setIsRadarModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 text-xs font-medium transition-all"
        >
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Radar</span>
        </button>

        {/* WhatsApp Bridge Live Simulator Trigger */}
        <button
          onClick={() => toggleWhatsApp()}
          className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isWhatsAppOpen
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-glow-green font-semibold'
              : 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WhatsApp Bridge</span>
          <span className="sm:hidden">Bridge</span>
          
          {/* Notification Ping Badge */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </button>
      </div>
    </header>
  );
}
