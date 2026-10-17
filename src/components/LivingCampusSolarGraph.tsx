"use client";

import React, { useState, useMemo } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { CampusNode } from '@/types';
import { 
  Sparkles, 
  Orbit, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldCheck, 
  ExternalLink, 
  MessageSquare, 
  GitCommit, 
  Award, 
  Eye,
  Zap,
  Users,
  Compass,
  ArrowRight
} from 'lucide-react';

interface SolarAlumniPlanet {
  nodeId: string;
  name: string;
  role: string;
  persona: 'faculty' | 'founder' | 'alumni' | 'recruiter';
  orbitRadius: number; // in px
  duration: number; // in seconds
  size: number; // planet diameter in px
  color: string;
  glowColor: string;
  ring?: boolean;
  angleOffset: number; // initial angle in degrees
  companyOrDept: string;
  impactScore: number;
  recentCommit?: string;
  trustHop: string;
}

export default function LivingCampusSolarGraph({
  onSwitchToPhysicsGraph
}: {
  onSwitchToPhysicsGraph?: () => void;
}) {
  const { 
    nodes, 
    selectNode, 
    selectedNodeId, 
    requestWarmVouch, 
    toggleWhatsApp 
  } = useNetwork();

  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [is3DMode, setIs3DMode] = useState(true);
  const [hoveredPlanet, setHoveredPlanet] = useState<SolarAlumniPlanet | null>(null);
  const [activePersonaFilter, setActivePersonaFilter] = useState<'all' | 'faculty' | 'founder' | 'alumni' | 'recruiter'>('all');

  // Center node: The Current User / Student Builder
  const centerUser = useMemo(() => {
    return nodes.find(n => n.id === 'node-parteek') || nodes[0] || {
      id: 'node-parteek',
      name: 'Parteek Garg',
      role: 'Lead Systems & ML Builder',
      handle: '@parteekgarg',
      impactScore: 97,
      totalCommits: 842
    };
  }, [nodes]);

  // Orbiting Alumni Planetesimal configurations mapped to real nodes
  const planetsConfig: SolarAlumniPlanet[] = useMemo(() => [
    // Orbit 1: Faculty / Lab Research Advisors (Hop 1)
    {
      nodeId: 'node-dr-wu',
      name: 'Dr. Jennifer Wu',
      role: 'Chair of Distributed Systems & Cryptography',
      persona: 'faculty',
      orbitRadius: 130,
      duration: 16,
      size: 26,
      color: 'from-amber-400 to-amber-600',
      glowColor: 'rgba(245, 158, 11, 0.7)',
      angleOffset: 45,
      companyOrDept: 'Faculty Advisor • Campus Lab',
      impactScore: 95,
      recentCommit: 'Published zero-knowledge consensus proof benchmark',
      trustHop: 'Direct Advisor (1 Hop)'
    },
    {
      nodeId: 'node-marcus-vance',
      name: 'Prof. Marcus Vance',
      role: 'Associate Professor & Systems Lead',
      persona: 'faculty',
      orbitRadius: 130,
      duration: 20,
      size: 22,
      color: 'from-yellow-500 to-amber-700',
      glowColor: 'rgba(234, 179, 8, 0.6)',
      angleOffset: 225,
      companyOrDept: 'Faculty Mentor',
      impactScore: 91,
      recentCommit: 'Formal verification of ledger state transitions',
      trustHop: 'Thesis Supervisor (1 Hop)'
    },

    // Orbit 2: YC Founders & Alumni Startups (Hop 2)
    {
      nodeId: 'node-elena-rostova',
      name: 'Elena Rostova',
      role: 'Founder & CEO at Kroma (YC W24)',
      persona: 'founder',
      orbitRadius: 210,
      duration: 26,
      size: 30,
      color: 'from-emerald-400 to-teal-600',
      glowColor: 'rgba(16, 185, 129, 0.8)',
      angleOffset: 110,
      companyOrDept: 'Kroma Health • YC W24',
      impactScore: 99,
      recentCommit: 'Shipped offline-first sync engine in prod',
      trustHop: 'Warm Routed via Dr. Wu (2 Hops)',
      ring: true
    },
    {
      nodeId: 'node-priya-nair',
      name: 'Priya Nair',
      role: 'Co-Founder & CTO at OmniFlow',
      persona: 'founder',
      orbitRadius: 210,
      duration: 32,
      size: 28,
      color: 'from-teal-400 to-emerald-700',
      glowColor: 'rgba(20, 184, 166, 0.7)',
      angleOffset: 290,
      companyOrDept: 'OmniFlow AI • Series A',
      impactScore: 96,
      recentCommit: 'pgvector sub-millisecond retrieval cluster',
      trustHop: 'Warm Routed via Batchmate (2 Hops)'
    },

    // Orbit 3: Staff & Senior Alumni Engineers (Hop 2-3)
    {
      nodeId: 'node-liam-chen',
      name: 'Liam Chen',
      role: 'Staff Distributed Systems Engineer',
      persona: 'alumni',
      orbitRadius: 290,
      duration: 40,
      size: 32,
      color: 'from-purple-500 to-indigo-700',
      glowColor: 'rgba(139, 92, 246, 0.8)',
      angleOffset: 15,
      companyOrDept: 'Stripe Payments Infra',
      impactScore: 98,
      recentCommit: 'Distributed idempotency ledger with Raft consensus',
      trustHop: 'Verified Alumnus (Class of 2021)',
      ring: true
    },
    {
      nodeId: 'node-sarah-connor',
      name: 'Sarah Connor',
      role: 'Principal Infra Architect',
      persona: 'alumni',
      orbitRadius: 290,
      duration: 46,
      size: 26,
      color: 'from-violet-400 to-purple-800',
      glowColor: 'rgba(168, 85, 247, 0.7)',
      angleOffset: 190,
      companyOrDept: 'Vercel Edge Network',
      impactScore: 94,
      recentCommit: 'Global edge cache invalidation protocol',
      trustHop: 'Lab Alumna (Class of 2020)'
    },

    // Orbit 4: Tech Recruiters & Campus Talent Partners (Hop 3)
    {
      nodeId: 'node-jordan-hayes',
      name: 'Jordan Hayes',
      role: 'Head of Engineering Talent',
      persona: 'recruiter',
      orbitRadius: 365,
      duration: 56,
      size: 24,
      color: 'from-rose-400 to-pink-600',
      glowColor: 'rgba(244, 63, 94, 0.7)',
      angleOffset: 140,
      companyOrDept: 'Benchmark Capital Portfolio',
      impactScore: 89,
      recentCommit: 'Active intent: Hiring 2 Core Rust/TS Engineers',
      trustHop: 'Sponsored Partner (3 Hops)'
    },
    {
      nodeId: 'node-maya-lin',
      name: 'Maya Lin',
      role: 'Campus Fellow & Research Scout',
      persona: 'recruiter',
      orbitRadius: 365,
      duration: 62,
      size: 22,
      color: 'from-pink-500 to-rose-700',
      glowColor: 'rgba(236, 72, 153, 0.6)',
      angleOffset: 330,
      companyOrDept: 'Anthropic Campus Ventures',
      impactScore: 92,
      recentCommit: 'Intent: Multimodal RAG grant sponsorship',
      trustHop: 'Institutional Partner (3 Hops)'
    }
  ], []);

  // Filtered planets
  const filteredPlanets = useMemo(() => {
    if (activePersonaFilter === 'all') return planetsConfig;
    return planetsConfig.filter(p => p.persona === activePersonaFilter);
  }, [planetsConfig, activePersonaFilter]);

  const orbits = [130, 210, 290, 365];
  const orbitLabels = [
    'Hop 1: Research Mentors & Faculty Advisors',
    'Hop 2: YC Founders & Verified Startups',
    'Hop 3: Staff Engineers & Tech Alumni',
    'Hop 4: Campus Talent Leads & Partners'
  ];

  return (
    <div className="relative w-full rounded-3xl bg-[#050811] border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] p-4 sm:p-8">
      {/* Dynamic Background Starlight Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/15 via-[#050811]/90 to-[#030509] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Top Controls Header */}
      <div className="relative z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">
              Living Solar Trust Engine
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
              60 FPS Physics
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Orbital Alumni Constellation
          </h3>
          <p className="text-xs text-zinc-400 max-w-lg mt-0.5">
            You are the central sun. Concentric orbits represent verified campus trust hops. Hover to inspect real AST citations; click to warm vouch.
          </p>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Persona Filters */}
          <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-xl text-xs">
            {(['all', 'founder', 'faculty', 'alumni', 'recruiter'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActivePersonaFilter(filter)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all font-medium ${
                  activePersonaFilter === filter 
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.6)]' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All Orbits' : filter + 's'}
              </button>
            ))}
          </div>

          {/* Speed & 3D Tilt Controls */}
          <div className="flex items-center space-x-1.5 p-1 bg-white/5 border border-white/10 rounded-xl text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              title={isPlaying ? "Pause Orbits" : "Play Orbits"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={() => setSpeedMultiplier(prev => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1))}
              className="px-2.5 py-1.5 rounded-lg font-mono text-[11px] text-cyan-300 hover:bg-white/10 transition-colors"
              title="Toggle Speed"
            >
              {speedMultiplier}x
            </button>

            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all ${
                is3DMode 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {is3DMode ? '3D Isometric' : '2D Planar'}
            </button>
          </div>

          {/* Switch to Full Physics Graph */}
          {onSwitchToPhysicsGraph && (
            <button
              onClick={onSwitchToPhysicsGraph}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition-all hover:scale-105"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Full Graph View</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Orbital Canvas Stage */}
      <div 
        className="relative mx-auto flex items-center justify-center min-h-[580px] sm:min-h-[640px] w-full overflow-hidden select-none"
        style={{ perspective: is3DMode ? "1300px" : "none" }}
      >
        <div
          className={`relative flex items-center justify-center transition-transform duration-700 ease-out ${
            is3DMode ? "animate-[solarTilt_14s_infinite_ease-in-out]" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: is3DMode ? "rotateX(58deg) rotateZ(-12deg)" : "none",
            width: "800px",
            height: "800px"
          }}
        >
          {/* Concentric Orbit Rings */}
          {orbits.map((radius, idx) => (
            <div
              key={idx}
              className="absolute rounded-full border border-dashed border-cyan-500/20 hover:border-cyan-400/50 transition-colors pointer-events-none"
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                boxShadow: idx === 0 ? "0 0 25px rgba(6,182,212,0.1), inset 0 0 25px rgba(6,182,212,0.05)" : "none",
              }}
            >
              {/* Subtle Orbit Hop Tag */}
              <span 
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-wider text-cyan-300/40 uppercase bg-[#050811]/90 px-2 py-0.5 rounded-full border border-white/5"
                style={{ transform: is3DMode ? "rotateX(-58deg)" : "none" }}
              >
                {orbitLabels[idx].split(':')[0]}
              </span>
            </div>
          ))}

          {/* =========================================================================
              THE SUN: "YOU" / CENTRAL USER NODE
             ========================================================================= */}
          <div
            onClick={() => selectNode(centerUser.id)}
            className="absolute z-30 cursor-pointer group flex items-center justify-center"
            style={{
              width: "88px",
              height: "88px",
              transform: is3DMode ? "translateZ(30px) rotateX(-58deg)" : "none",
            }}
          >
            {/* Pulsing Sun Aura */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-yellow-300 animate-ping opacity-30" />
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-500 to-amber-400 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
            
            {/* Sun Core Container */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-700 p-1 shadow-[0_0_50px_rgba(6,182,212,0.9),inset_0_0_20px_rgba(255,255,255,0.8)] border-2 border-white flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-950 font-mono">
                YOU
              </span>
              <span className="text-[11px] font-bold text-white leading-tight px-1 truncate max-w-[80px]">
                {centerUser.name.split(' ')[0]}
              </span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
                <span className="text-[9px] font-mono font-black text-yellow-200">
                  97 Impact
                </span>
              </div>
            </div>

            {/* Floating Tag */}
            <div className="absolute -bottom-8 whitespace-nowrap bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-cyan-400/40 text-[10px] font-mono text-cyan-300 shadow-lg pointer-events-none">
              Artifact Verified Origin
            </div>
          </div>

          {/* =========================================================================
              THE PLANETS: ALUMNI, FOUNDERS, RESEARCHERS & RECRUITERS
             ========================================================================= */}
          {filteredPlanets.map((planet) => {
            const isHovered = hoveredPlanet?.nodeId === planet.nodeId;
            const isSelected = selectedNodeId === planet.nodeId;
            const currentSpeed = (planet.duration / speedMultiplier);

            return (
              <div
                key={planet.nodeId}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: `${planet.orbitRadius * 2}px`,
                  height: `${planet.orbitRadius * 2}px`,
                  animation: `orbit3d ${currentSpeed}s linear infinite`,
                  animationPlayState: isPlaying && !isHovered ? 'running' : 'paused',
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Planet Body */}
                <div
                  onMouseEnter={() => setHoveredPlanet(planet)}
                  onMouseLeave={() => setHoveredPlanet(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectNode(planet.nodeId);
                  }}
                  className={`pointer-events-auto absolute cursor-pointer transition-all duration-300 group ${
                    isSelected ? 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-black scale-125' : ''
                  }`}
                  style={{
                    width: `${planet.size}px`,
                    height: `${planet.size}px`,
                    top: "50%",
                    left: "100%",
                    transform: `translate(-50%, -50%) ${is3DMode ? 'rotateX(-58deg)' : ''} ${isHovered ? 'scale(1.4)' : ''}`,
                    zIndex: isHovered ? 50 : 25,
                  }}
                >
                  {/* Planet Sphere */}
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-br ${planet.color} shadow-lg relative flex items-center justify-center`}
                    style={{
                      boxShadow: `0 0 25px ${planet.glowColor}, inset -4px -4px 8px rgba(0,0,0,0.7), inset 3px 3px 6px rgba(255,255,255,0.4)`
                    }}
                  >
                    {/* Planet Ring (e.g. for Founders & Staff) */}
                    {planet.ring && (
                      <div
                        className="absolute w-[220%] h-[3px] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-75 rounded-full pointer-events-none"
                        style={{ transform: "rotate(28deg)" }}
                      />
                    )}

                    {/* Specular highlight */}
                    <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-white/60 blur-[1px]" />
                  </div>

                  {/* Planet Persona Indicator Dot */}
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white border border-slate-900 shadow" />

                  {/* Quick Name Badge (Visible on hover or when selected) */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[10px] font-sans font-bold text-white shadow-xl pointer-events-none transition-opacity duration-200 z-50 ${
                      isHovered || isSelected ? 'opacity-100 scale-105' : 'opacity-80 group-hover:opacity-100'
                    }`}
                  >
                    <span className="text-cyan-300 font-mono">[{planet.impactScore}]</span> {planet.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            HOVERED / SELECTED ALUMNI DOSSIER CARD (Floating HUD)
           ========================================================================= */}
        {hoveredPlanet && (
          <div className="absolute bottom-6 left-6 z-40 max-w-sm w-full bg-[#0B0F1A]/95 border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_40px_rgba(6,182,212,0.3)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${hoveredPlanet.color} flex items-center justify-center font-bold text-white shadow-md text-base`}>
                  {hoveredPlanet.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white leading-tight">
                    {hoveredPlanet.name}
                  </h4>
                  <p className="text-xs text-cyan-300 font-medium">
                    {hoveredPlanet.role}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {hoveredPlanet.companyOrDept}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-zinc-400">Impact</div>
                <div className="text-base font-black text-cyan-400 font-mono">
                  {hoveredPlanet.impactScore}<span className="text-xs text-zinc-500">/100</span>
                </div>
              </div>
            </div>

            {/* Proof of Work Citation */}
            {hoveredPlanet.recentCommit && (
              <div className="mt-3 p-2 rounded-lg bg-black/40 border border-white/10 text-[11px] text-zinc-300 flex items-start space-x-2">
                <GitCommit className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="font-mono line-clamp-2">"{hoveredPlanet.recentCommit}"</span>
              </div>
            )}

            {/* Trust Path & CTA */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-amber-300 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>{hoveredPlanet.trustHop}</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => selectNode(hoveredPlanet.nodeId)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] transition-colors flex items-center space-x-1"
                >
                  <span>Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    requestWarmVouch(hoveredPlanet.nodeId);
                    toggleWhatsApp(true, 'vouch-handshake');
                  }}
                  className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300"
                  title="1-Tap WhatsApp Vouch"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orbit Taxonomy Footnotes */}
      <div className="relative z-20 mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
          <span className="text-zinc-300 font-medium">Hop 1: Faculty Mentors</span>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
          <span className="text-zinc-300 font-medium">Hop 2: YC Founders</span>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1.5" />
          <span className="text-zinc-300 font-medium">Hop 3: Tech Alumni</span>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-1.5" />
          <span className="text-zinc-300 font-medium">Hop 4: Talent Partners</span>
        </div>
      </div>
    </div>
  );
}
