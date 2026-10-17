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
  GraduationCap,
  Briefcase,
  Building2,
  Users
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
  cardSize: number; // in px
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

  // Center node: The Student / User
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
    // Orbit 1 (145px): Faculty & Research Mentors (Hop 1)
    {
      nodeId: 'node-dr-wu',
      name: 'Dr. Jennifer Wu',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'Chair of Distributed Systems',
      company: 'Campus AI Research Lab',
      persona: 'faculty',
      orbitRadius: 145,
      duration: 18,
      cardSize: 44,
      accentColor: '#D97706', // Warm Amber
      badgeBg: '#FEF3C7',
      impactScore: 95,
      recentCommit: 'zero-knowledge consensus proof benchmarks',
      trustHop: 'Direct Thesis Advisor (1 Hop)',
      verifiedTech: ['ZK-Proofs', 'Raft', 'Formal Proofs']
    },
    {
      nodeId: 'node-marcus-vance',
      name: 'Prof. Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Associate Professor & Systems Lead',
      company: 'Autonomous Systems Lab',
      persona: 'faculty',
      orbitRadius: 145,
      duration: 22,
      cardSize: 40,
      accentColor: '#CA8A04',
      badgeBg: '#FEF9C3',
      impactScore: 91,
      recentCommit: 'Formal ledger state transition verification',
      trustHop: 'Faculty Mentor (1 Hop)',
      verifiedTech: ['ROS2', 'RTOS', 'Distributed Memory']
    },

    // Orbit 2 (230px): YC Founders & Startups (Hop 2)
    {
      nodeId: 'node-elena-rostova',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      role: 'Founder & CEO',
      company: 'Kroma Health (YC W24)',
      persona: 'founder',
      orbitRadius: 230,
      duration: 28,
      cardSize: 48,
      accentColor: '#15803D', // Matcha Forest
      badgeBg: '#DCFCE7',
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
      orbitRadius: 230,
      duration: 34,
      cardSize: 42,
      accentColor: '#0F766E', // Teal
      badgeBg: '#CCFBF1',
      impactScore: 96,
      recentCommit: 'Sub-millisecond pgvector cluster indexing',
      trustHop: 'Warm Routed via Batchmate (2 Hops)',
      verifiedTech: ['pgvector', 'FastAPI', 'Multi-Tenant']
    },

    // Orbit 3 (315px): Senior Engineers & Staff Alumni (Hop 2-3)
    {
      nodeId: 'node-liam-chen',
      name: 'Liam Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Staff Systems Engineer',
      company: 'Stripe Payments Infra',
      persona: 'alumni',
      orbitRadius: 315,
      duration: 42,
      cardSize: 46,
      accentColor: '#4338CA', // Indigo
      badgeBg: '#E0E7FF',
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
      orbitRadius: 315,
      duration: 48,
      cardSize: 42,
      accentColor: '#6D28D9', // Deep Violet
      badgeBg: '#EDE9FE',
      impactScore: 94,
      recentCommit: 'Global edge cache invalidation protocol',
      trustHop: 'Lab Alumna (Class of 2020)',
      verifiedTech: ['Edge Runtime', 'Turbopack', 'HTTP/3']
    },

    // Orbit 4 (395px): Tech Recruiters & Campus Talent Partners (Hop 3)
    {
      nodeId: 'node-jordan-hayes',
      name: 'Jordan Hayes',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      role: 'Head of Engineering Talent',
      company: 'Benchmark Capital Portfolio',
      persona: 'recruiter',
      orbitRadius: 395,
      duration: 58,
      cardSize: 40,
      accentColor: '#BE123C', // Rose Terracotta
      badgeBg: '#FFE4E6',
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
      orbitRadius: 395,
      duration: 64,
      cardSize: 38,
      accentColor: '#BE185D',
      badgeBg: '#FCE7F3',
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

  const orbits = [145, 230, 315, 395];
  const orbitTierNames = [
    'Hop 1: Faculty Research Advisors',
    'Hop 2: YC Founders & Startups',
    'Hop 3: Senior Tech Alumni',
    'Hop 4: Campus Talent Leads'
  ];

  return (
    <div className="relative w-full rounded-[36px] bg-[#EFECE5] border border-black/[0.08] overflow-hidden shadow-[0_20px_60px_rgba(30,35,32,0.08)] p-6 sm:p-10 transition-all">
      {/* Warm Ambient Studio Lighting & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,transparent_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* Header Controls (Playbit & Swirlzy tactile style) */}
      <div className="relative z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-black/[0.08]">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E25C38]" />
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-600 font-bold">
              The Living Campus Trust Graph
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-[10px] font-mono font-semibold text-zinc-700 shadow-sm border border-black/5">
              Interactive Solar Engine
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#181D19] tracking-tight mt-1 font-sans">
            Orbital Alumni Constellation
          </h3>
          <p className="text-xs text-zinc-600 mt-0.5 max-w-lg font-medium">
            Central student builder surrounded by real alumni and faculty. Orbit depth represents shortest Dijkstra campus trust hops.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Persona Filter Pills */}
          <div className="flex items-center p-1 bg-white/80 backdrop-blur-md border border-black/5 rounded-2xl shadow-sm text-xs">
            {(['all', 'founder', 'faculty', 'alumni', 'recruiter'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActivePersonaFilter(filter)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all font-semibold ${
                  activePersonaFilter === filter 
                    ? 'bg-[#181D19] text-white shadow-sm' 
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                {filter === 'all' ? 'All Hops' : filter + 's'}
              </button>
            ))}
          </div>

          {/* Speed & 3D Tilt */}
          <div className="flex items-center space-x-1.5 p-1 bg-white/80 backdrop-blur-md border border-black/5 rounded-2xl shadow-sm text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl text-zinc-700 hover:bg-black/5 transition-colors"
              title={isPlaying ? "Pause Orbits" : "Resume Orbits"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={() => setSpeedMultiplier(prev => (prev === 1 ? 1.75 : prev === 1.75 ? 0.6 : 1))}
              className="px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold text-zinc-800 hover:bg-black/5 transition-colors"
              title="Toggle Speed"
            >
              {speedMultiplier}x
            </button>

            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold transition-all ${
                is3DMode 
                  ? 'bg-[#E25C38] text-white shadow-sm' 
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              {is3DMode ? '3D Isometric' : '2D Planar'}
            </button>
          </div>

          {onSwitchToPhysicsGraph && (
            <button
              onClick={onSwitchToPhysicsGraph}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-zinc-50 border border-black/5 shadow-sm text-xs font-bold text-zinc-800 transition-all hover:scale-102"
            >
              <Compass className="w-3.5 h-3.5 text-[#E25C38]" />
              <span>Force Graph</span>
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
            transform: is3DMode ? "rotateX(52deg) rotateZ(-8deg)" : "none",
            width: "840px",
            height: "840px"
          }}
        >
          {/* Concentric Orbit Rings (Tactile chalk lines) */}
          {orbits.map((radius, idx) => (
            <div
              key={idx}
              className="absolute rounded-full border border-dashed border-black/[0.14] pointer-events-none"
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
              }}
            >
              {/* Orbit Badge */}
              <span 
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold tracking-wider text-zinc-500 uppercase bg-[#EFECE5] px-2.5 py-0.5 rounded-full border border-black/10 shadow-xs"
                style={{ transform: is3DMode ? "rotateX(-52deg)" : "none" }}
              >
                {orbitTierNames[idx].split(':')[0]}
              </span>
            </div>
          ))}

          {/* =========================================================================
              THE CENTER: "YOU" / STUDENT BUILDER MEDALLION
             ========================================================================= */}
          <div
            onClick={() => selectNode(centerUser.id)}
            className="absolute z-30 cursor-pointer group flex items-center justify-center"
            style={{
              width: "100px",
              height: "100px",
              transform: is3DMode ? "translateZ(35px) rotateX(-52deg)" : "none",
            }}
          >
            {/* Soft Warm Halo */}
            <div className="absolute inset-0 rounded-full bg-[#E25C38]/20 animate-ping" />
            <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-[#E25C38]/30 via-amber-300/40 to-emerald-300/30 blur-lg opacity-70" />
            
            {/* Physical Porcelain Medallion */}
            <div className="relative w-full h-full rounded-full p-1.5 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)] border-2 border-black/5 flex items-center justify-center">
              <img
                src={centerUser.avatar}
                alt={centerUser.name}
                className="w-full h-full rounded-full object-cover shadow-inner"
              />
              
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#181D19] border-2 border-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-3 h-3 text-[#E25C38]" />
              </span>
            </div>

            {/* Floating Tactile Chip */}
            <div className="absolute -bottom-8 whitespace-nowrap bg-white px-3 py-1 rounded-full border border-black/10 text-[10px] font-sans font-extrabold text-[#181D19] shadow-md pointer-events-none">
              YOU • <span className="font-semibold text-zinc-500">{centerUser.name}</span>
            </div>
          </div>

          {/* =========================================================================
              ORBITING ALUMNI NODES (TACTILE SQUIRCLE CARDS - KUMO STYLE)
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
                {/* Physical Tactile Squircle Card */}
                <div
                  onMouseEnter={() => setHoveredAlumni(alumni)}
                  onMouseLeave={() => setHoveredAlumni(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectNode(alumni.nodeId);
                  }}
                  className={`pointer-events-auto absolute cursor-pointer transition-all duration-300 group ${
                    isSelected ? 'scale-115' : ''
                  }`}
                  style={{
                    top: "50%",
                    left: "100%",
                    transform: `translate(-50%, -50%) ${is3DMode ? 'rotateX(-52deg)' : ''} ${isHovered ? 'scale(1.2)' : ''}`,
                    zIndex: isHovered ? 50 : 25,
                  }}
                >
                  {/* Porcelain Elevated Squircle (Like Kumo cards in Image 2) */}
                  <div
                    className="p-1.5 rounded-[22px] bg-white border border-black/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.1)] flex items-center space-x-2.5 transition-all duration-200 group-hover:shadow-[0_20px_45px_rgba(0,0,0,0.16)]"
                    style={{
                      borderLeft: `4px solid ${alumni.accentColor}`
                    }}
                  >
                    <img
                      src={alumni.avatar}
                      alt={alumni.name}
                      className="w-9 h-9 rounded-[14px] object-cover shadow-xs"
                    />

                    <div className="pr-2 flex flex-col text-left">
                      <div className="flex items-center space-x-1">
                        <span className="text-[11px] font-bold text-[#181D19] leading-tight font-sans">
                          {alumni.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 font-semibold truncate max-w-[100px]">
                        {alumni.company.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            FLOATING TACTILE DOSSIER (BENTO CARD STYLE)
           ========================================================================= */}
        {hoveredAlumni && (
          <div className="absolute bottom-6 left-6 z-40 max-w-sm w-full bg-white border border-black/[0.08] rounded-[28px] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.14)] animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <img
                  src={hoveredAlumni.avatar}
                  alt={hoveredAlumni.name}
                  className="w-12 h-12 rounded-[18px] object-cover shadow-sm"
                  style={{ border: `3px solid ${hoveredAlumni.accentColor}` }}
                />

                <div>
                  <h4 className="text-sm font-extrabold text-[#181D19] flex items-center space-x-1.5 font-sans">
                    <span>{hoveredAlumni.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </h4>
                  <p className="text-xs text-zinc-600 font-medium">
                    {hoveredAlumni.role}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono font-semibold">
                    {hoveredAlumni.company}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono uppercase text-zinc-400 font-bold">Impact</span>
                <div className="text-sm font-black font-mono text-[#E25C38]">
                  {hoveredAlumni.impactScore}<span className="text-[10px] text-zinc-400 font-normal">/100</span>
                </div>
              </div>
            </div>

            {/* AST Citation Chip */}
            <div className="mt-3.5 p-3 rounded-2xl bg-[#F6F4EE] border border-black/[0.04] text-[11px] text-zinc-700 flex items-start space-x-2">
              <GitCommit className="w-3.5 h-3.5 text-[#E25C38] shrink-0 mt-0.5" />
              <span className="font-mono line-clamp-2">"{hoveredAlumni.recentCommit}"</span>
            </div>

            {/* Tech Tags */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {hoveredAlumni.verifiedTech.map((tech, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-[#EFECE5] text-[9px] font-mono font-semibold text-zinc-700"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Trust Path & CTA */}
            <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-amber-700 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>{hoveredAlumni.trustHop}</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => selectNode(hoveredAlumni.nodeId)}
                  className="px-3 py-1.5 rounded-xl bg-[#181D19] hover:bg-black text-white font-bold text-[11px] transition-colors flex items-center space-x-1 shadow-sm"
                >
                  <span>Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    requestWarmVouch(hoveredAlumni.nodeId);
                    toggleWhatsApp(true, 'vouch-handshake');
                  }}
                  className="p-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                  title="1-Tap WhatsApp Vouch"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orbit Tier Footnote Strip */}
      <div className="relative z-20 mt-4 pt-4 border-t border-black/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-2xl bg-white/70 border border-black/5 shadow-xs flex items-center justify-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-zinc-700 font-semibold">Hop 1: Faculty Mentors</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-white/70 border border-black/5 shadow-xs flex items-center justify-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span className="text-zinc-700 font-semibold">Hop 2: YC Founders</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-white/70 border border-black/5 shadow-xs flex items-center justify-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <span className="text-zinc-700 font-semibold">Hop 3: Tech Alumni</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-white/70 border border-black/5 shadow-xs flex items-center justify-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
          <span className="text-zinc-700 font-semibold">Hop 4: Talent Leads</span>
        </div>
      </div>
    </div>
  );
}
