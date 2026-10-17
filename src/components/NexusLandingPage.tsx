"use client";

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useNetwork } from '@/context/NetworkContext';
import { PersonaType, CampusNode } from '@/types';
import { 
  Network, 
  Sparkles, 
  Radio, 
  Smartphone, 
  ShieldCheck, 
  GitCommit, 
  GitBranch, 
  Layers, 
  Compass, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Users, 
  Award, 
  Search, 
  SlidersHorizontal, 
  Play, 
  Code, 
  Terminal, 
  Orbit, 
  Cpu, 
  Zap, 
  MessageSquare,
  Building2,
  TrendingUp,
  FileCheck
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

// Intent Router Panel
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
    isWhatsAppOpen,
    setIsIngestModalOpen,
    setIsRadarModalOpen,
    setIsMicroAuditModalOpen,
    selectIntent,
    activeIntentId,
    setPersonaFilter,
    activePersonaFilter
  } = useNetwork();

  // View mode for the Trust Graph (Solar 3D vs Force Physics)
  const [graphViewMode, setGraphViewMode] = useState<'solar' | 'physics'>('solar');
  const [nodeSearchQuery, setNodeSearchQuery] = useState('');
  const [selectedPersonaTab, setSelectedPersonaTab] = useState<PersonaType | 'all'>('all');
  const [solarDemoSpeed, setSolarDemoSpeed] = useState(1);

  // Filtered nodes for the Proof-of-Work matrix
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

  return (
    <div className="w-full min-h-screen bg-[#030509] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">
      {/* Background Ambient Glow & Grid Mesh */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* =========================================================================
          1. STICKY TOP HUD BAR
         ========================================================================= */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#030509]/80 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollTo('hero')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center">
            <div className="w-full h-full bg-[#050811] rounded-[10px] flex items-center justify-center">
              <Network className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-wider text-white">
                NEXUS
              </span>
              <span className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-semibold uppercase">
                PROOF NETWORK
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-tight hidden sm:block">
              NOT A DIRECTORY • VERIFIED INTENT & WARM ROUTING
            </p>
          </div>
        </div>

        {/* Live Network Telemetry Badges */}
        <div className="hidden lg:flex items-center space-x-6 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-zinc-400">Verified Nodes:</span>
            <span className="font-bold text-white">{nodes.length} Live</span>
          </div>
          <div className="flex items-center space-x-2">
            <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400">AST Commits:</span>
            <span className="font-bold text-cyan-300">{totalVerifiedCommits.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">Vouch Rate:</span>
            <span className="font-bold text-amber-300">94.2%</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-200 transition-all hover:scale-105"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ingest Repo</span>
          </button>

          <button
            onClick={() => setIsRadarModalOpen(true)}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-200 transition-all hover:scale-105"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Campus Radar</span>
          </button>

          <button
            onClick={() => toggleWhatsApp(true, 'intent-drop')}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105"
          >
            <Smartphone className="w-4 h-4 fill-current" />
            <span>WhatsApp Bridge</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION: KINETIC STATEMENT & INSTANT INTENT TRIGGER
         ========================================================================= */}
      <section id="hero" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-16 flex flex-col items-center text-center">
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>ZERO-FORM ARTIFACT INGESTION & SHORTEST CAMPUS TRUST PATHS</span>
        </div>

        {/* Kinetic Hero Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] max-w-5xl">
          <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            A LIVING NETWORK.
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
            NOT A DEAD DIRECTORY.
          </span>
        </h1>

        {/* Crisp Subhead */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed font-normal">
          Traditional alumni portals are static databases filled with unverified self-reported keywords and ignored cold messages. <strong className="text-white font-semibold">Nexus</strong> replaces them with <strong className="text-cyan-300 font-semibold">AST-verified GitHub commits</strong>, <strong className="text-amber-300 font-semibold">mutual advisor vouches</strong>, and a <strong className="text-emerald-300 font-semibold">zero-login WhatsApp action bridge</strong>.
        </p>

        {/* 1-Click Interactive Intent Presets (Instant Graph Reaction) */}
        <div className="w-full max-w-4xl mt-10 p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-zinc-400 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>TEST A LIVE BROADCAST INTENT (1-CLICK DEMO):</span>
            </span>
            <span className="text-cyan-400 font-semibold">Instant Graph Highlight</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {intents.slice(0, 4).map((intent) => {
              const isActive = activeIntentId === intent.id;
              return (
                <button
                  key={intent.id}
                  onClick={() => {
                    selectIntent(intent.id);
                    scrollTo('trust-graph');
                  }}
                  className={`p-3 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between ${
                    isActive 
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-102' 
                      : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="font-semibold text-white truncate flex items-center justify-between">
                    <span>{intent.role}</span>
                    <span className="text-[10px] font-mono text-cyan-300">
                      {intent.matchedNodeIds?.length || 2} matches
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                    "{intent.query}"
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="text-amber-300">{intent.category.toUpperCase()}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => scrollTo('trust-graph')}
            className="flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-sm transition-all shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105"
          >
            <Orbit className="w-4 h-4 fill-current" />
            <span>Launch Living Campus Graph</span>
          </button>

          <button
            onClick={() => toggleWhatsApp(true, 'intent-drop')}
            className="flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition-all hover:scale-105"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Simulate WhatsApp Voice Drop</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          3. SECTION: THE LIVING CAMPUS TRUST GRAPH (SOLAR ORBITAL + PHYSICS CANVAS)
         ========================================================================= */}
      <section id="trust-graph" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <Orbit className="w-4 h-4" />
              <span>THE LIVING CAMPUS TRUST GRAPH</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              3D Orbital Trust Constellation
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Instead of static cards, explore verified connections in orbital physics. You are the center; each orbit represents verified trust hops through advisors and batchmates.
            </p>
          </div>

          {/* Toggle between Solar Orbit Graph and Force-Directed Graph */}
          <div className="flex items-center p-1 bg-black/60 border border-white/10 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setGraphViewMode('solar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                graphViewMode === 'solar'
                  ? 'bg-cyan-500 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>3D Solar Orbits</span>
            </button>

            <button
              onClick={() => setGraphViewMode('physics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                graphViewMode === 'physics'
                  ? 'bg-cyan-500 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Force Physics Graph</span>
            </button>
          </div>
        </div>

        {/* The Graph Canvas Container */}
        <div className="w-full">
          {graphViewMode === 'solar' ? (
            <LivingCampusSolarGraph 
              onSwitchToPhysicsGraph={() => setGraphViewMode('physics')} 
            />
          ) : (
            <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-white/10 bg-[#07090E] shadow-2xl">
              <LivingNetworkCanvas />
              <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Force-Directed Physics Engine Active</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          4. SECTION: THE KINETIC NEXUS STACK INTERACTOR (GSAP SVG MASK ANIMATION)
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Architecture Pillars
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Engineered For Pure Signal
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Hover over each core engine pillar to trigger live kinetic SVG clipping masks and explore how Nexus eliminates directory noise.
          </p>
        </div>

        {/* Integrated GSAP Stack Interactor */}
        <ConnoisseurStackInteractor />
      </section>

      {/* =========================================================================
          5. SECTION: NATURAL LANGUAGE INTENT ROUTER PANEL (EMBEDDED LIVE)
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Live Intent Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Time-Bound Problem Capsules
            </h2>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              Alumni founders and research leads broadcast problems, not boring job descriptions. Nexus decomposes natural language queries into AST code requirements and matches verified students across the campus graph in real time.
            </p>

            <div className="mt-6 space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AST Semantic Decomposition</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Analyzes actual code imports (e.g. `indexedDB`, `WebCrypto`, `pgvector`) rather than self-reported resume bullets.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Shortest Warm Trust Path</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Finds the highest-confidence route through mutual faculty advisors or past project collaborators.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">60-Second Technical Micro-Audit</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Unlocks immediate introductions via live interactive algorithmic challenges directly on the web.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <IntentRouterPanel />
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SECTION: ZERO-FORM VERIFIED PROOF MATRIX (STUDENT & ALUMNI DIRECTORY)
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Verifiable Evidence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              Verified Proof-of-Work Matrix
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-lg">
              Click any node to open their verified dossier with commit hash citations, language byte distributions, and campus warm paths.
            </p>
          </div>

          {/* Search & Persona Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search name, repo, or tech..."
                value={nodeSearchQuery}
                onChange={(e) => setNodeSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="flex items-center p-1 bg-black/60 border border-white/10 rounded-xl text-xs">
              {(['all', 'student', 'founder', 'faculty', 'alumni'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedPersonaTab(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    selectedPersonaTab === tab 
                      ? 'bg-cyan-500 text-black font-bold' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab + 's'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Node Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNodes.slice(0, 9).map(node => {
            const isSelected = selectedNodeId === node.id;
            const topRepo = node.proofOfWork?.repos?.[0];
            const impactScore = node.proofOfWork?.verifiedImpactScore || 90;

            return (
              <div
                key={node.id}
                onClick={() => selectNode(node.id)}
                className={`group p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-102' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={node.avatar}
                          alt={node.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                        />
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${
                          node.persona === 'student' ? 'bg-cyan-400' :
                          node.persona === 'founder' ? 'bg-emerald-400' :
                          node.persona === 'faculty' ? 'bg-amber-400' : 'bg-purple-400'
                        }`} />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center space-x-1">
                          <span>{node.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 inline" />
                        </h4>
                        <p className="text-xs text-zinc-400">{node.role}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{node.institution}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-zinc-500">Score</span>
                      <div className="text-sm font-black font-mono text-cyan-400">
                        {impactScore}<span className="text-[10px] text-zinc-500">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Verified Repo Artifact */}
                  {topRepo && (
                    <div className="mt-4 p-3 rounded-2xl bg-black/40 border border-white/5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white truncate max-w-[180px]">
                          {topRepo.name}
                        </span>
                        <span className="text-cyan-300 font-bold">
                          {topRepo.commitsCount} commits
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                        {topRepo.description}
                      </p>
                      {topRepo.recentCommitHash && (
                        <div className="mt-2 text-[10px] font-mono text-amber-300/80 flex items-center space-x-1">
                          <GitCommit className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">#{topRepo.recentCommitHash}: "{topRepo.recentCommitMessage}"</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Specializations / Tech Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {node.proofOfWork?.specializations?.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-zinc-300"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-zinc-400">
                    {node.phoneBridged ? '📱 WhatsApp Bridged' : '🌐 Web Verified'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestWarmVouch(node.id);
                      toggleWhatsApp(true, 'vouch-handshake');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300 flex items-center space-x-1"
                  >
                    <span>Warm Vouch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          7. SECTION: SOLAR LOADER SHOWCASE (THEMED LOADER DEMO)
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Orbital Synchronizer
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Synchronized Campus Orbits
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              Every connection in Nexus runs on an active celestial clock. Real-time updates from GitHub Webhooks and WhatsApp drops propagate dynamically across all peer nodes.
            </p>

            <div className="mt-6 flex items-center space-x-3">
              <button
                onClick={() => setSolarDemoSpeed(s => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-lg"
              >
                Speed: {solarDemoSpeed}x
              </button>

              <button
                onClick={() => setIsMicroAuditModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
              >
                Launch Micro-Audit
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center py-6">
            <SolarLoader size={34} speed={solarDemoSpeed} />
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FOOTER
         ========================================================================= */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-4 sm:px-8 bg-black/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Network className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wider">NEXUS</span>
              <span className="text-[10px] font-mono ml-2">PROOF-OF-WORK ALUMNI NETWORK</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 font-mono text-[11px]">
            <span className="text-emerald-400 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Campus Network 100% Operational</span>
            </span>
            <span>Zero-Form Verification</span>
            <span>IIITD HackShift 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
