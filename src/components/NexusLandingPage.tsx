"use client";

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useNetwork } from '@/context/NetworkContext';
import { PersonaType, CampusNode } from '@/types';
import { 
  Network, 
  ShieldCheck, 
  GitCommit, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Search, 
  Orbit, 
  Terminal, 
  Zap, 
  Smartphone,
  Building2,
  Code2,
  SlidersHorizontal,
  Compass,
  ArrowUpRight,
  GraduationCap,
  Briefcase,
  Users,
  Sparkles,
  Play,
  RotateCcw,
  Layers,
  ChevronRight,
  Flame,
  Radio
} from 'lucide-react';

// Dynamic import of 3D Solar Graph
const LivingCampusSolarGraph = dynamic(
  () => import('@/components/LivingCampusSolarGraph'),
  { ssr: false }
);

// Dynamic import of 2D Force-Directed Canvas
const LivingNetworkCanvas = dynamic(
  () => import('@/components/LivingNetworkCanvas'),
  { ssr: false }
);

// Dynamic import of GSAP Connoisseur Stack Interactor
const ConnoisseurStackInteractor = dynamic(
  () => import('@/components/ui/connoisseur-stack-interactor'),
  { ssr: false }
);

// Dynamic import of SolarLoader
const SolarLoader = dynamic(
  () => import('@/components/ui/solar-loader'),
  { ssr: false }
);

// Intent Router Panel (Rendered embedded)
const IntentRouterPanel = dynamic(
  () => import('@/components/IntentRouterPanel'),
  { ssr: false }
);

export default function NexusLandingPage() {
  const {
    nodes,
    intents,
    selectNode,
    selectedNodeId,
    requestWarmVouch,
    toggleWhatsApp,
    setIsIngestModalOpen,
    setIsRadarModalOpen,
    setIsMicroAuditModalOpen,
    selectIntent,
    activeIntentId,
    searchIntentsByText
  } = useNetwork();

  const [graphViewMode, setGraphViewMode] = useState<'solar' | 'physics'>('solar');
  const [nodeSearchQuery, setNodeSearchQuery] = useState('');
  const [selectedPersonaTab, setSelectedPersonaTab] = useState<PersonaType | 'all'>('all');
  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [solarDemoSpeed, setSolarDemoSpeed] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtered nodes for the Proof-of-Work Matrix
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchSearch = nodeSearchQuery === '' ||
        n.name.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
        n.role.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
        n.department.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
        (n.proofOfWork?.repos?.[0]?.name && n.proofOfWork.repos[0].name.toLowerCase().includes(nodeSearchQuery.toLowerCase()));

      const matchPersona = selectedPersonaTab === 'all' || n.persona === selectedPersonaTab;
      return matchSearch && matchPersona;
    });
  }, [nodes, nodeSearchQuery, selectedPersonaTab]);

  const totalVerifiedCommits = useMemo(() => {
    return nodes.reduce((acc, curr) => acc + (curr.proofOfWork?.totalCommits || 0), 0);
  }, [nodes]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearchInput.trim()) return;
    searchIntentsByText(heroSearchInput);
    scrollTo('trust-graph');
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F5F0] text-[#141815] font-sans overflow-x-hidden relative selection:bg-[#E25C38]/20 selection:text-[#E25C38]">
      
      {/* Warm Ambient Studio Lighting & Gentle Texture */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(238,230,215,0.7),transparent_70%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* =========================================================================
          1. FLOATING PILL NAVIGATION BAR (KUMO & PLAYBIT INSPIRED)
         ========================================================================= */}
      <header className="sticky top-4 z-40 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="w-full backdrop-blur-2xl bg-white/90 border border-black/[0.08] shadow-[0_12px_36px_rgba(20,24,21,0.06)] rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all">
          
          {/* Brand Mark & Retro 2026 Stamp (Playbit style) */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-8 h-8 rounded-full bg-[#E25C38] flex items-center justify-center text-white shadow-sm">
              <Network className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-[#141815]">
                NEXUS
              </span>
              <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-[#F3EFEA] border border-black/5 text-[#E25C38] font-bold">
                / 2026
              </span>
            </div>
          </div>

          {/* Center Nav Links (Playbit pill capsules) */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold text-zinc-600">
            <button 
              onClick={() => scrollTo('trust-graph')}
              className="px-3.5 py-1.5 rounded-full hover:bg-[#F3EFEA] hover:text-[#141815] transition-all"
            >
              Trust Orbit
            </button>
            <button 
              onClick={() => scrollTo('architecture')}
              className="px-3.5 py-1.5 rounded-full hover:bg-[#F3EFEA] hover:text-[#141815] transition-all"
            >
              Architecture
            </button>
            <button 
              onClick={() => scrollTo('intent-engine')}
              className="px-3.5 py-1.5 rounded-full hover:bg-[#F3EFEA] hover:text-[#141815] transition-all"
            >
              Intent Scout
            </button>
            <button 
              onClick={() => scrollTo('proof-matrix')}
              className="px-3.5 py-1.5 rounded-full hover:bg-[#F3EFEA] hover:text-[#141815] transition-all"
            >
              Proof Matrix
            </button>
            <button 
              onClick={() => scrollTo('solar-clock')}
              className="px-3.5 py-1.5 rounded-full hover:bg-[#F3EFEA] hover:text-[#141815] transition-all"
            >
              Solar Clock
            </button>
          </nav>

          {/* Action Pills (Kumo Matcha & Playbit Terracotta) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsIngestModalOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#EFECE5] hover:bg-[#E5E0D7] border border-black/5 text-xs font-semibold text-[#141815] transition-all"
            >
              <Code2 className="w-3.5 h-3.5 text-[#E25C38]" />
              <span>Ingest Repo</span>
            </button>

            <button
              onClick={() => toggleWhatsApp(true, 'intent-drop')}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-[#254B33] hover:bg-[#1C3B27] text-white text-xs font-bold transition-all shadow-[0_4px_14px_rgba(37,75,51,0.25)] hover:scale-[1.02]"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>WhatsApp Bridge</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION: WARM TACTILE BENTO & PROBLEM STATEMENT 1
         ========================================================================= */}
      <section id="hero" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 flex flex-col items-center text-center">
        
        {/* Problem Statement 1 Badge (From user slide: Alumni Network & Professional Connections) */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-bold text-[#141815] shadow-sm mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E25C38] animate-pulse" />
          <span className="text-[#E25C38] uppercase tracking-wider font-mono text-[11px]">Track 1</span>
          <span className="text-zinc-300">•</span>
          <span>Alumni Network & Professional Connections</span>
          <span className="text-zinc-300">•</span>
          <span className="text-zinc-500 font-normal">Building a Network, Not a Directory</span>
        </div>

        {/* High-Impact Headline (Image 3 Swirlzy & Image 4 Playbit Display) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-[#141815] max-w-5xl">
          A LIVING NETWORK.
          <br />
          <span className="text-[#E25C38]">
            NOT A DIRECTORY.
          </span>
        </h1>

        {/* Grounded Subhead (Directly solving the slide's problem) */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 max-w-2xl leading-relaxed font-normal">
          Build an intelligent platform connecting students, alumni, faculty, founders, and recruiters based on verified GitHub code artifacts, Dijkstra shortest trust paths, and 1-tap WhatsApp vouch handshakes.
        </p>

        {/* etail.me-style Large Floating Search / Broadcast Pill */}
        <div className="w-full max-w-3xl mt-10">
          <form 
            onSubmit={handleHeroSearch}
            className="w-full p-2 sm:p-2.5 rounded-full bg-white border border-black/[0.08] shadow-[0_16px_40px_rgba(20,24,21,0.08)] flex items-center justify-between transition-all focus-within:ring-2 focus-within:ring-[#E25C38]/40"
          >
            <div className="flex items-center space-x-3 pl-3 sm:pl-4 flex-1">
              <div className="w-8 h-8 rounded-full bg-[#F3EFEA] flex items-center justify-center text-[#E25C38] shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={heroSearchInput}
                onChange={(e) => setHeroSearchInput(e.target.value)}
                placeholder="Broadcast intent: 'Find YC alumni founders in Bengaluru looking for Rust / Next.js builders'..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#141815] placeholder-zinc-400 focus:outline-none font-medium"
              />
            </div>
            
            <button
              type="submit"
              className="px-5 sm:px-6 py-2.5 rounded-full bg-[#141815] hover:bg-[#254B33] text-white text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all shrink-0 shadow-sm"
            >
              <span>Match Orbit</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E25C38]" />
            </button>
          </form>

          {/* Quick Intent Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-medium text-zinc-500">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Quick Intents:</span>
            {intents.slice(0, 3).map((intent) => (
              <button
                key={intent.id}
                onClick={() => {
                  selectIntent(intent.id);
                  scrollTo('trust-graph');
                }}
                className={`px-3 py-1 rounded-full border text-xs transition-all ${
                  activeIntentId === intent.id
                    ? 'bg-[#E25C38] text-white border-[#E25C38] font-bold'
                    : 'bg-white/80 hover:bg-white border-black/[0.06] text-zinc-700'
                }`}
              >
                {intent.authorRole || intent.category}: "{intent.query.slice(0, 32)}..."
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================================
            Swirlzy-Style Bento 4-Persona Grid (Image 3)
           ========================================================================= */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 text-left">
          
          {/* Card 1: Alumni Founders (Honey Ochre) */}
          <div 
            onClick={() => {
              setSelectedPersonaTab('founder');
              scrollTo('trust-graph');
            }}
            className="p-6 rounded-[32px] bg-[#F5B853] text-[#1F1707] shadow-[0_10px_30px_rgba(245,184,83,0.2)] flex flex-col justify-between min-h-[190px] cursor-pointer hover:-translate-y-1 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/40">
                  ( 18 YC / SEED )
                </span>
                <Briefcase className="w-5 h-5 text-[#1F1707]/70 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mt-3">
                FOUNDERS
              </h3>
              <p className="text-xs text-[#1F1707]/80 mt-1 leading-relaxed">
                Alumni founders scouting students with verified AST commits for founding engineer roles.
              </p>
            </div>
            <div className="pt-3 border-t border-[#1F1707]/10 flex items-center justify-between text-xs font-bold">
              <span>View Founder Orbits</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Faculty Research (Soft Sky Blue) */}
          <div 
            onClick={() => {
              setSelectedPersonaTab('faculty');
              scrollTo('trust-graph');
            }}
            className="p-6 rounded-[32px] bg-[#8EC3E6] text-[#0D2132] shadow-[0_10px_30px_rgba(142,195,230,0.2)] flex flex-col justify-between min-h-[190px] cursor-pointer hover:-translate-y-1 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/40">
                  ( 14 LABS )
                </span>
                <GraduationCap className="w-5 h-5 text-[#0D2132]/70 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mt-3">
                FACULTY LABS
              </h3>
              <p className="text-xs text-[#0D2132]/80 mt-1 leading-relaxed">
                Direct 1-Hop academic advisors & distributed systems co-authors providing warm vouches.
              </p>
            </div>
            <div className="pt-3 border-t border-[#0D2132]/10 flex items-center justify-between text-xs font-bold">
              <span>View Faculty Hops</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Senior Tech Alumni (Terracotta Coral) */}
          <div 
            onClick={() => {
              setSelectedPersonaTab('alumni');
              scrollTo('trust-graph');
            }}
            className="p-6 rounded-[32px] bg-[#EB7A53] text-[#280E06] shadow-[0_10px_30px_rgba(235,122,83,0.2)] flex flex-col justify-between min-h-[190px] cursor-pointer hover:-translate-y-1 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/40">
                  ( 42 MENTORS )
                </span>
                <Users className="w-5 h-5 text-[#280E06]/70 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mt-3">
                STAFF ALUMNI
              </h3>
              <p className="text-xs text-[#280E06]/80 mt-1 leading-relaxed">
                Staff engineers at Google, Stripe, and OpenAI offering 1-tap WhatsApp vouch handshakes.
              </p>
            </div>
            <div className="pt-3 border-t border-[#280E06]/10 flex items-center justify-between text-xs font-bold">
              <span>View Senior Mentors</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Recruiters & Talent (Matcha Forest Green) */}
          <div 
            onClick={() => {
              setSelectedPersonaTab('recruiter');
              scrollTo('trust-graph');
            }}
            className="p-6 rounded-[32px] bg-[#2A5239] text-white shadow-[0_10px_30px_rgba(42,82,57,0.2)] flex flex-col justify-between min-h-[190px] cursor-pointer hover:-translate-y-1 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/20">
                  ( $120K GRANTS )
                </span>
                <Building2 className="w-5 h-5 text-white/70 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mt-3">
                INSTITUTIONS
              </h3>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Campus scouts, tech talent partners, and micro-audit sponsors cutting through resume slop.
              </p>
            </div>
            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold">
              <span>View Talent Leads</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          3. SECTION: THE LIVING CAMPUS TRUST GRAPH (SOLAR ORBIT + PHYSICS)
         ========================================================================= */}
      <section id="trust-graph" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E25C38]" />
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-500 font-bold">
                Orbital Trust Architecture
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#141815] tracking-tight mt-1">
              The Living Campus Trust Graph
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-xl">
              You are the central sun. Orbiting bodies are <strong>real alumni squircle cards</strong> (not generic planets) positioned by Dijkstra shortest trust distance.
            </p>
          </div>

          {/* View Mode Toggle (Playbit capsules) */}
          <div className="flex items-center p-1 bg-white border border-black/[0.08] rounded-full shadow-sm text-xs font-semibold">
            <button
              onClick={() => setGraphViewMode('solar')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full transition-all ${
                graphViewMode === 'solar'
                  ? 'bg-[#141815] text-white shadow-sm'
                  : 'text-zinc-600 hover:text-[#141815]'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Solar Orbits</span>
            </button>

            <button
              onClick={() => setGraphViewMode('physics')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full transition-all ${
                graphViewMode === 'physics'
                  ? 'bg-[#141815] text-white shadow-sm'
                  : 'text-zinc-600 hover:text-[#141815]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Force Physics</span>
            </button>
          </div>
        </div>

        {/* Graph Stage */}
        <div className="w-full">
          {graphViewMode === 'solar' ? (
            <LivingCampusSolarGraph 
              onSwitchToPhysicsGraph={() => setGraphViewMode('physics')} 
            />
          ) : (
            <div className="relative w-full h-[640px] rounded-[36px] overflow-hidden border border-black/[0.08] bg-[#EFECE5] shadow-[0_20px_60px_rgba(20,24,21,0.06)]">
              <LivingNetworkCanvas />
              <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/10 text-xs font-mono text-zinc-800 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>60 FPS Force Directed Physics Active</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          4. SECTION: KINETIC ARCHITECTURE STACK (GSAP APERTURES - NO BURGER)
         ========================================================================= */}
      <section id="architecture" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8 text-left">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E25C38]" />
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-500 font-bold">
              Engineering Specs
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#141815] tracking-tight mt-1">
            Engineered For Pure Signal
          </h2>
          <p className="text-sm text-zinc-600 mt-1 max-w-xl">
            Hover over each pillar to trigger kinetic optical SVG apertures and inspect verified platform mechanics.
          </p>
        </div>

        {/* Clean GSAP SVG Interactor (Upgraded warm porcelain, no hamburger) */}
        <ConnoisseurStackInteractor />
      </section>

      {/* =========================================================================
          5. SECTION: EMBEDDED INTENT ROUTER (CONTAINED IN LAYOUT)
         ========================================================================= */}
      <section id="intent-engine" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 text-left">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E25C38]" />
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-500 font-bold">
                Broadcast Engine
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#141815] tracking-tight mt-1">
              Live Intent Routing
            </h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Alumni founders and lab leads broadcast concrete technical needs. The engine parses the query against repository ASTs to discover students with genuine code artifacts.
            </p>

            <div className="mt-6 space-y-3">
              <div className="p-5 rounded-[24px] bg-white border border-black/[0.08] shadow-sm">
                <h4 className="text-xs font-bold text-[#141815] flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-[#E25C38]" />
                  <span>AST Code Extraction</span>
                </h4>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Extracts genuine dependencies, commit velocity, and test passing rates directly from public repositories without requiring manual resumes.
                </p>
              </div>

              <div className="p-5 rounded-[24px] bg-white border border-black/[0.08] shadow-sm">
                <h4 className="text-xs font-bold text-[#141815] flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Warm Introduction Handshake</span>
                </h4>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Introductions require an advisor vouch, completely eliminating unvetted spam and ensuring 90%+ reply rates.
                </p>
              </div>
            </div>
          </div>

          {/* Contained, Embedded Intent Router */}
          <div className="lg:col-span-7">
            <IntentRouterPanel embedded={true} />
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SECTION: PROOF-OF-WORK VERIFIED MATRIX
         ========================================================================= */}
      <section id="proof-matrix" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E25C38]" />
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-500 font-bold">
                Verifiable Evidence
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#141815] tracking-tight mt-1">
              Proof-of-Work Matrix
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              Select any student or alumnus to inspect real commit messages and verified citations.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by tech or name..."
                value={nodeSearchQuery}
                onChange={(e) => setNodeSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white border border-black/10 text-xs text-[#141815] placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#E25C38] font-mono shadow-sm"
              />
            </div>

            <div className="flex items-center p-1 bg-white border border-black/[0.08] rounded-full shadow-sm text-xs font-semibold">
              {(['all', 'student', 'founder', 'faculty', 'alumni'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedPersonaTab(tab)}
                  className={`px-3 py-1 rounded-full capitalize transition-all ${
                    selectedPersonaTab === tab 
                      ? 'bg-[#141815] text-white' 
                      : 'text-zinc-600 hover:text-[#141815]'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab + 's'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Matrix Grid (Tactile Porcelain Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNodes.slice(0, 9).map(node => {
            const isSelected = selectedNodeId === node.id;
            const topRepo = node.proofOfWork?.repos?.[0];
            const impactScore = node.proofOfWork?.verifiedImpactScore || 90;

            return (
              <div
                key={node.id}
                onClick={() => selectNode(node.id)}
                className={`p-5 rounded-[28px] border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-white border-[#E25C38] shadow-[0_12px_30px_rgba(226,92,56,0.15)] ring-2 ring-[#E25C38]/20' 
                    : 'bg-white border-black/[0.08] hover:border-black/20 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={node.avatar}
                        alt={node.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-black/10 shadow-sm"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-[#141815] flex items-center space-x-1.5">
                          <span>{node.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </h4>
                        <p className="text-xs text-zinc-500">{node.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono uppercase text-zinc-400">Score</span>
                      <div className="text-xs font-black font-mono text-[#E25C38]">
                        {impactScore}<span className="text-[9px] text-zinc-400">/100</span>
                      </div>
                    </div>
                  </div>

                  {topRepo && (
                    <div className="mt-3.5 p-3 rounded-2xl bg-[#F7F5F0] border border-black/[0.05]">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-[#141815] truncate max-w-[170px]">
                          {topRepo.name}
                        </span>
                        <span className="text-zinc-500 text-[11px]">
                          {topRepo.commitsCount} commits
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2">
                        {topRepo.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {node.institution.split('/')[0]}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestWarmVouch(node.id);
                      toggleWhatsApp(true, 'vouch-handshake');
                    }}
                    className="px-3 py-1 rounded-full bg-[#EFECE5] hover:bg-[#E25C38] hover:text-white border border-black/5 text-[11px] font-bold text-zinc-800 flex items-center space-x-1 transition-all"
                  >
                    <span>Vouch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          7. SECTION: SOLAR LOADER SHOWCASE (TACTILE STUDIO CONTAINER)
         ========================================================================= */}
      <section id="solar-clock" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="p-8 sm:p-12 rounded-[36px] bg-white border border-black/[0.08] shadow-[0_16px_40px_rgba(20,24,21,0.06)] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md text-left">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E25C38]" />
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-500 font-bold">
                Orbital Synchronizer
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#141815] tracking-tight mt-1">
              Solar Engine Clock
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
              Every verified connection in Nexus runs on an active celestial clock. Real-time updates from GitHub Webhooks and WhatsApp drops propagate dynamically across all peer nodes.
            </p>

            <div className="mt-6 flex items-center space-x-3">
              <button
                onClick={() => setSolarDemoSpeed(s => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
                className="px-4 py-2 rounded-full bg-[#141815] hover:bg-[#254B33] text-white text-xs font-bold transition-all shadow-sm"
              >
                Speed: {solarDemoSpeed}x
              </button>

              <button
                onClick={() => setIsMicroAuditModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#EFECE5] hover:bg-[#E5E0D7] border border-black/5 text-xs font-semibold text-[#141815] transition-all"
              >
                Launch Micro-Audit
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 bg-[#F7F5F0] rounded-[32px] border border-black/[0.06]">
            <SolarLoader size={36} speed={solarDemoSpeed} />
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. TACTILE STUDIO FOOTER
         ========================================================================= */}
      <footer className="relative z-10 border-t border-black/[0.08] py-10 px-4 sm:px-6 bg-[#EFECE6] mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600 font-mono">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-[#E25C38] flex items-center justify-center text-white">
              <Network className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-[#141815]">NEXUS</span>
            <span>• PROOF-OF-WORK CAMPUS NETWORK</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span className="text-emerald-700 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Campus Network 100% Operational</span>
            </span>
            <span className="text-zinc-500">IIITD HackShift 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
