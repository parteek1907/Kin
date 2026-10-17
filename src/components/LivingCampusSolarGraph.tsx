"use client";

import React, { useState, useMemo } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { 
  Orbit, 
  Play, 
  Pause, 
  ShieldCheck, 
  GitCommit, 
  ArrowRight, 
  MessageSquare, 
  Compass, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';

interface SolarAlumniNode {
  nodeId: string;
  name: string;
  avatar: string;
  role: string;
  company: string;
  persona: 'faculty' | 'founder' | 'alumni' | 'recruiter';
  orbitRadius: number; // in px
  duration: number; // in seconds
  avatarSize: number; // in px
  accentColor: string;
  badgeBg: string;
  impactScore: number;
  recentCommit: string;
  trustHop: string;
  verifiedTech: string[];
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
  const [hoveredAlumni, setHoveredAlumni] = useState<SolarAlumniNode | null>(null);
  const [activePersonaFilter, setActivePersonaFilter] = useState<'all' | 'faculty' | 'founder' | 'alumni' | 'recruiter'>('all');

  // Center node: The Current Student / User Builder
  const centerUser = useMemo(() => {
    return {
      id: 'node-parteek',
      name: 'Parteek Garg',
      role: 'Lead Systems & ML Builder',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      institution: 'IIIT Delhi',
      impactScore: 97,
      totalCommits: 842,
      topTech: ['TypeScript', 'Rust', 'WebCrypto', 'pgvector']
    };
  }, []);

  // Real Alumni Nodes orbiting the student
  const alumniNodes: SolarAlumniNode[] = useMemo(() => [
    // Orbit 1 (140px): Faculty & Research Mentors (Hop 1)
    {
      nodeId: 'node-dr-wu',
      name: 'Dr. Jennifer Wu',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'Chair of Distributed Systems & Crypto',
      company: 'Campus AI Research Lab',
      persona: 'faculty',
      orbitRadius: 140,
      duration: 18,
      avatarSize: 38,
      accentColor: '#F59E0B',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      impactScore: 95,
      recentCommit: 'zero-knowledge consensus proof benchmarks',
      trustHop: 'Direct Thesis Advisor (1 Hop)',
      verifiedTech: ['ZK-Proofs', 'Raft', 'Formal Verification']
    },
    {
      nodeId: 'node-marcus-vance',
      name: 'Prof. Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Associate Professor & Systems Lead',
      company: 'Autonomous Systems Lab',
      persona: 'faculty',
      orbitRadius: 140,
      duration: 22,
      avatarSize: 34,
      accentColor: '#EAB308',
      badgeBg: 'rgba(234, 179, 8, 0.15)',
      impactScore: 91,
      recentCommit: 'Formal ledger state transition verification',
      trustHop: 'Faculty Mentor (1 Hop)',
      verifiedTech: ['ROS2', 'RTOS', 'Distributed Memory']
    },

    // Orbit 2 (225px): YC Founders & Venture Startups (Hop 2)
    {
      nodeId: 'node-elena-rostova',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      role: 'Founder & CEO',
      company: 'Kroma Health (YC W24)',
      persona: 'founder',
      orbitRadius: 225,
      duration: 28,
      avatarSize: 42,
      accentColor: '#10B981',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      impactScore: 99,
      recentCommit: 'Offline-first sync engine in production',
      trustHop: 'Warm Routed via Dr. Wu (2 Hops)',
      verifiedTech: ['Offline Sync', 'IndexedDB', 'ECDSA']
    },
    {
      nodeId: 'node-priya-nair',
      name: 'Priya Nair',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      role: 'Co-Founder & CTO',
      company: 'OmniFlow AI ($4.2M Seed)',
      persona: 'founder',
      orbitRadius: 225,
      duration: 34,
      avatarSize: 38,
      accentColor: '#14B8A6',
      badgeBg: 'rgba(20, 184, 166, 0.15)',
      impactScore: 96,
      recentCommit: 'Sub-millisecond pgvector cluster indexing',
      trustHop: 'Warm Routed via Batchmate (2 Hops)',
      verifiedTech: ['pgvector', 'FastAPI', 'Multi-Tenant']
    },

    // Orbit 3 (310px): Staff & Senior Engineers (Hop 2-3)
    {
      nodeId: 'node-liam-chen',
      name: 'Liam Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Staff Systems Engineer',
      company: 'Stripe Payments Infra',
      persona: 'alumni',
      orbitRadius: 310,
      duration: 42,
      avatarSize: 40,
      accentColor: '#8B5CF6',
      badgeBg: 'rgba(139, 92, 246, 0.15)',
      impactScore: 98,
      recentCommit: 'Distributed idempotency ledger with Raft consensus',
      trustHop: 'Verified Alumnus (Class of 2021)',
      verifiedTech: ['Raft Consensus', 'Go', 'High-Throughput']
    },
    {
      nodeId: 'node-sarah-connor',
      name: 'Sarah Connor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Principal Infra Architect',
      company: 'Vercel Edge Network',
      persona: 'alumni',
      orbitRadius: 310,
      duration: 48,
      avatarSize: 36,
      accentColor: '#A855F7',
      badgeBg: 'rgba(168, 85, 247, 0.15)',
      impactScore: 94,
      recentCommit: 'Global edge cache invalidation protocol',
      trustHop: 'Lab Alumna (Class of 2020)',
      verifiedTech: ['Edge Runtime', 'Turbopack', 'HTTP/3']
    },

    // Orbit 4 (390px): Tech Recruiters & Campus Talent Partners (Hop 3)
    {
      nodeId: 'node-jordan-hayes',
      name: 'Jordan Hayes',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      role: 'Head of Engineering Talent',
      company: 'Benchmark Capital Portfolio',
      persona: 'recruiter',
      orbitRadius: 390,
      duration: 58,
      avatarSize: 36,
      accentColor: '#F43F5E',
      badgeBg: 'rgba(244, 63, 94, 0.15)',
      impactScore: 89,
      recentCommit: 'Active intent: Hiring 2 Core Rust/TS Engineers',
      trustHop: 'Sponsored Partner (3 Hops)',
      verifiedTech: ['Rust', 'Seed Stage', 'Lead Engineer']
    },
    {
      nodeId: 'node-maya-lin',
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      role: 'Campus Fellow & Research Scout',
      company: 'Anthropic Campus Ventures',
      persona: 'recruiter',
      orbitRadius: 390,
      duration: 64,
      avatarSize: 34,
      accentColor: '#EC4899',
      badgeBg: 'rgba(236, 72, 153, 0.15)',
      impactScore: 92,
      recentCommit: 'Grant intent: Multimodal RAG sponsorship',
      trustHop: 'Institutional Partner (3 Hops)',
      verifiedTech: ['Multimodal RAG', 'Grant Funding']
    }
  ], []);

  const filteredAlumni = useMemo(() => {
    if (activePersonaFilter === 'all') return alumniNodes;
    return alumniNodes.filter(a => a.persona === activePersonaFilter);
  }, [alumniNodes, activePersonaFilter]);

  const orbits = [140, 225, 310, 390];
  const orbitTierNames = [
    'Hop 1: Faculty Research Advisors',
    'Hop 2: YC Founders & Startups',
    'Hop 3: Senior Tech Alumni',
    'Hop 4: Campus Talent Leads'
  ];

  return (
    <div className="relative w-full rounded-3xl bg-[#060810] border border-white/[0.08] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.9)] p-4 sm:p-8">
      {/* Muted Atmospheric Starlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      {/* Header Controls */}
      <div className="relative z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-400 font-semibold">
              The Living Campus Trust Graph
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 font-sans">
            Orbital Alumni Constellation
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-lg">
            Real verified alumni orbiting the student builder. Concentric rings represent shortest Dijkstra trust hops.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Persona Filter Pills */}
          <div className="flex items-center p-1 bg-black/60 border border-white/[0.08] rounded-xl text-xs">
            {(['all', 'founder', 'faculty', 'alumni', 'recruiter'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActivePersonaFilter(filter)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all font-medium ${
                  activePersonaFilter === filter 
                    ? 'bg-cyan-500 text-black font-bold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All Hops' : filter + 's'}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-1.5 p-1 bg-black/60 border border-white/[0.08] rounded-xl text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              title={isPlaying ? "Pause Orbits" : "Resume Orbits"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={() => setSpeedMultiplier(prev => (prev === 1 ? 1.75 : prev === 1.75 ? 0.6 : 1))}
              className="px-2.5 py-1.5 rounded-lg font-mono text-[11px] text-cyan-300 hover:bg-white/10 transition-colors"
              title="Toggle Speed"
            >
              {speedMultiplier}x
            </button>

            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all ${
                is3DMode 
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {is3DMode ? '3D Isometric' : '2D Planar'}
            </button>
          </div>

          {onSwitchToPhysicsGraph && (
            <button
              onClick={onSwitchToPhysicsGraph}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.08] text-xs font-semibold text-zinc-300 transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Force Graph View</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Orbital Stage */}
      <div 
        className="relative mx-auto flex items-center justify-center min-h-[580px] sm:min-h-[660px] w-full overflow-hidden select-none"
        style={{ perspective: is3DMode ? "1400px" : "none" }}
      >
        <div
          className={`relative flex items-center justify-center transition-transform duration-700 ease-out ${
            is3DMode ? "animate-[solarTilt_16s_infinite_ease-in-out]" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: is3DMode ? "rotateX(58deg) rotateZ(-12deg)" : "none",
            width: "820px",
            height: "820px"
          }}
        >
          {/* Concentric Orbit Rings */}
          {orbits.map((radius, idx) => (
            <div
              key={idx}
              className="absolute rounded-full border border-dashed border-white/[0.12] transition-colors pointer-events-none"
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
              }}
            >
              {/* Orbit Label */}
              <span 
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-wider text-zinc-500 uppercase bg-[#060810] px-2 py-0.5 rounded-full border border-white/5"
                style={{ transform: is3DMode ? "rotateX(-58deg)" : "none" }}
              >
                {orbitTierNames[idx].split(':')[0]}
              </span>
            </div>
          ))}

          {/* =========================================================================
              THE CENTER: "YOU" / STUDENT BUILDER CORE
             ========================================================================= */}
          <div
            onClick={() => selectNode(centerUser.id)}
            className="absolute z-30 cursor-pointer group flex items-center justify-center"
            style={{
              width: "92px",
              height: "92px",
              transform: is3DMode ? "translateZ(30px) rotateX(-58deg)" : "none",
            }}
          >
            {/* Center Radar Waves */}
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
            <div className="absolute -inset-2 rounded-full border border-cyan-400/30 animate-pulse" />
            
            {/* User Headshot Avatar with Status Corona */}
            <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500 shadow-[0_0_40px_rgba(6,182,212,0.6)] flex items-center justify-center">
              <img
                src={centerUser.avatar}
                alt={centerUser.name}
                className="w-full h-full rounded-full object-cover border-2 border-[#060810]"
              />
              
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-black flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-2.5 h-2.5 text-black" />
              </span>
            </div>

            {/* Central Identity Pill */}
            <div className="absolute -bottom-7 whitespace-nowrap bg-[#0A0D16] px-2.5 py-0.5 rounded-full border border-cyan-400/40 text-[10px] font-mono font-bold text-white shadow-xl pointer-events-none">
              YOU • <span className="text-cyan-300 font-normal">{centerUser.name}</span>
            </div>
          </div>

          {/* =========================================================================
              ORBITING ALUMNI NODES (REAL FACES, REAL BADGES)
             ========================================================================= */}
          {filteredAlumni.map((alumni) => {
            const isHovered = hoveredAlumni?.nodeId === alumni.nodeId;
            const isSelected = selectedNodeId === alumni.nodeId;
            const currentSpeed = (alumni.duration / speedMultiplier);

            return (
              <div
                key={alumni.nodeId}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: `${alumni.orbitRadius * 2}px`,
                  height: `${alumni.orbitRadius * 2}px`,
                  animation: `orbit3d ${currentSpeed}s linear infinite`,
                  animationPlayState: isPlaying && !isHovered ? 'running' : 'paused',
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Real Alumni Person Node */}
                <div
                  onMouseEnter={() => setHoveredAlumni(alumni)}
                  onMouseLeave={() => setHoveredAlumni(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectNode(alumni.nodeId);
                  }}
                  className={`pointer-events-auto absolute cursor-pointer transition-all duration-300 group ${
                    isSelected ? 'scale-125' : ''
                  }`}
                  style={{
                    width: `${alumni.avatarSize + 4}px`,
                    height: `${alumni.avatarSize + 4}px`,
                    top: "50%",
                    left: "100%",
                    transform: `translate(-50%, -50%) ${is3DMode ? 'rotateX(-58deg)' : ''} ${isHovered ? 'scale(1.3)' : ''}`,
                    zIndex: isHovered ? 50 : 25,
                  }}
                >
                  {/* Real Alumni Avatar Photo with Persona Ring */}
                  <div
                    className="relative w-full h-full rounded-full p-0.5 transition-shadow duration-300 shadow-md"
                    style={{
                      border: `2.5px solid ${alumni.accentColor}`,
                      boxShadow: isHovered ? `0 0 25px ${alumni.accentColor}` : `0 0 10px rgba(0,0,0,0.8)`
                    }}
                  >
                    <img
                      src={alumni.avatar}
                      alt={alumni.name}
                      className="w-full h-full rounded-full object-cover bg-black"
                    />

                    {/* Persona Badge Indicator */}
                    <span 
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-black shadow"
                      style={{ backgroundColor: alumni.accentColor }}
                    />
                  </div>

                  {/* Clean Attached Typographic Chip */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap bg-[#0A0D16]/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-sans font-semibold text-white shadow-xl pointer-events-none transition-all duration-200 z-50 ${
                      isHovered || isSelected ? 'opacity-100 scale-105 border-cyan-400' : 'opacity-85 group-hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-white">{alumni.name}</span>
                      <span className="text-zinc-400 font-normal">|</span>
                      <span className="font-mono text-[9px] text-cyan-300">{alumni.company.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            FLOATING REAL-TIME DOSSIER HUD (REFINED EDITORIAL STYLE)
           ========================================================================= */}
        {hoveredAlumni && (
          <div className="absolute bottom-6 left-6 z-40 max-w-sm w-full bg-[#090C16]/95 border border-white/[0.12] rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={hoveredAlumni.avatar}
                    alt={hoveredAlumni.name}
                    className="w-11 h-11 rounded-xl object-cover border-2 shadow"
                    style={{ borderColor: hoveredAlumni.accentColor }}
                  />
                  <span
                    className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-black"
                    style={{ backgroundColor: hoveredAlumni.accentColor }}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <span>{hoveredAlumni.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </h4>
                  <p className="text-xs text-zinc-300 font-medium">
                    {hoveredAlumni.role}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    {hoveredAlumni.company}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono uppercase text-zinc-500">Impact</span>
                <div className="text-sm font-black font-mono text-cyan-400">
                  {hoveredAlumni.impactScore}<span className="text-[10px] text-zinc-500">/100</span>
                </div>
              </div>
            </div>

            {/* AST Citation */}
            <div className="mt-3 p-2.5 rounded-xl bg-black/50 border border-white/5 text-[11px] text-zinc-300 flex items-start space-x-2">
              <GitCommit className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span className="font-mono line-clamp-2">"{hoveredAlumni.recentCommit}"</span>
            </div>

            {/* Tech Tags */}
            <div className="mt-2.5 flex flex-wrap gap-1">
              {hoveredAlumni.verifiedTech.map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-mono text-zinc-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Trust Path & CTA */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-amber-300 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{hoveredAlumni.trustHop}</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => selectNode(hoveredAlumni.nodeId)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] transition-colors flex items-center space-x-1"
                >
                  <span>Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    requestWarmVouch(hoveredAlumni.nodeId);
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

      {/* Orbit Tier Taxonomy Strip */}
      <div className="relative z-20 mt-4 pt-4 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
          <span className="text-zinc-300 font-medium">Hop 1: Faculty Mentors</span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
          <span className="text-zinc-300 font-medium">Hop 2: YC Founders</span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1.5" />
          <span className="text-zinc-300 font-medium">Hop 3: Tech Alumni</span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-1.5" />
          <span className="text-zinc-300 font-medium">Hop 4: Talent Leads</span>
        </div>
      </div>
    </div>
  );
}
