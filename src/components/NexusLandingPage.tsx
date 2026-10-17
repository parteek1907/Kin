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
  ArrowUpRight
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
    activeIntentId
  } = useNetwork();

  const [graphViewMode, setGraphViewMode] = useState<'solar' | 'physics'>('solar');
  const [nodeSearchQuery, setNodeSearchQuery] = useState('');
  const [selectedPersonaTab, setSelectedPersonaTab] = useState<PersonaType | 'all'>('all');
  const [solarDemoSpeed, setSolarDemoSpeed] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtered nodes
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
    <div className="w-full min-h-screen bg-[#04060A] text-[#EDEDED] font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden relative">
      {/* Background Subtle Gradient Atmosphere */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-cyan-500/[0.07] to-transparent blur-[160px] pointer-events-none z-0"
        style={{ transform: `translate(-50%, ${scrollY * 0.1}px)` }}
      />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* =========================================================================
          1. STICKY TOP NAVIGATION BAR (CLEAN, EDOLUS-STYLE)
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#04060A]/85 border-b border-white/[0.08] px-6 sm:px-10 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollTo('hero')}>
          <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center">
            <Network className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-widest text-white uppercase font-mono">
                NEXUS
              </span>
              <span className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                CAMPUS PROOF NETWORK
              </span>
            </div>
          </div>
        </div>

        {/* Center Live Telemetry */}
        <div className="hidden lg:flex items-center space-x-8 text-xs font-mono text-zinc-400">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{nodes.length} Verified Nodes</span>
          </div>
          <div className="flex items-center space-x-2">
            <GitCommit className="w-3.5 h-3.5 text-zinc-500" />
            <span>{totalVerifiedCommits.toLocaleString()} Indexed Commits</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
            <span>94.2% Vouch Rate</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ingest Repo</span>
          </button>

          <button
            onClick={() => toggleWhatsApp(true, 'intent-drop')}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-white text-black text-xs font-bold transition-all hover:bg-zinc-200"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>WhatsApp Bridge</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION: EDITORIAL PRECISION & INTENT PRESETS
         ========================================================================= */}
      <section id="hero" className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-20 sm:pt-28 pb-16 flex flex-col items-center text-center">
        {/* Subtle Category Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-xs font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>ZERO-FORM PROOF-OF-WORK • SHORTEST WARM CAMPUS ROUTING</span>
        </div>

        {/* Clean, Massive Editorial Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-white font-sans max-w-5xl">
          A LIVING NETWORK.
          <br />
          <span className="text-zinc-500">
            NOT A DIRECTORY.
          </span>
        </h1>

        {/* Restrained Subhead */}
        <p className="mt-8 text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed font-normal">
          Traditional alumni portals are static graveyards of unverified resumes and dead cold DMs. Nexus verifies real GitHub commits, builds multi-hop campus trust paths, and introduces founders via WhatsApp.
        </p>

        {/* 1-Click Interactive Intent Presets */}
        <div className="w-full max-w-4xl mt-12 p-6 rounded-3xl bg-[#080B12] border border-white/[0.08] text-left">
          <div className="flex items-center justify-between mb-4 text-xs font-mono">
            <span className="text-zinc-400 uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Broadcast Intent Test Bench:</span>
            </span>
            <span className="text-zinc-500">Select to trigger live graph match</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {intents.slice(0, 4).map((intent) => {
              const isActive = activeIntentId === intent.id;
              return (
                <button
                  key={intent.id}
                  onClick={() => {
                    selectIntent(intent.id);
                    scrollTo('trust-graph');
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between ${
                    isActive 
                      ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]' 
                      : 'bg-black/40 border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white truncate flex items-center justify-between">
                      <span>{intent.role}</span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {intent.matchedNodeIds?.length || 2} matches
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                      "{intent.query}"
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>{intent.category}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => scrollTo('trust-graph')}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)]"
          >
            <Orbit className="w-4 h-4" />
            <span>Explore 3D Constellation</span>
          </button>

          <button
            onClick={() => toggleWhatsApp(true, 'intent-drop')}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs tracking-wider uppercase transition-colors"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Open WhatsApp Simulator</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          3. SECTION: THE LIVING CAMPUS TRUST GRAPH (SOLAR ORBIT + PHYSICS)
         ========================================================================= */}
      <section id="trust-graph" className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-400 font-semibold">
              Live Campus Graph
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1 font-sans">
              3D Orbital Trust Constellation
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-lg">
              You are the central sun. Orbiting nodes are real verified alumni, research leads, and founders positioned by Dijkstra trust distance.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#080B12] border border-white/[0.08] rounded-xl text-xs font-medium">
            <button
              onClick={() => setGraphViewMode('solar')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
                graphViewMode === 'solar'
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>3D Solar Orbits</span>
            </button>

            <button
              onClick={() => setGraphViewMode('physics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
                graphViewMode === 'physics'
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
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
            <div className="relative w-full h-[640px] rounded-3xl overflow-hidden border border-white/[0.08] bg-[#060810] shadow-2xl">
              <LivingNetworkCanvas />
              <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>60 FPS Force Directed Physics Active</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          4. SECTION: KINETIC ARCHITECTURE STACK (GSAP APERTURES)
         ========================================================================= */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-16">
        <div className="mb-10 text-left">
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-400 font-semibold">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 font-sans">
            Engineered For Pure Signal
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Hover over each pillar to trigger live kinetic SVG apertures and inspect the verified mechanics of the platform.
          </p>
        </div>

        {/* Clean GSAP SVG Interactor (No Burger) */}
        <ConnoisseurStackInteractor />
      </section>

      {/* =========================================================================
          5. SECTION: EMBEDDED INTENT ROUTER (CONTAINED, NOT FLOATING)
         ========================================================================= */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-400 font-semibold">
              Broadcast Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 font-sans">
              Live Intent Routing
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Alumni founders and lab leads broadcast concrete technical needs. The engine parses the query against repository ASTs to discover students with genuine code artifacts.
            </p>

            <div className="mt-6 space-y-3">
              <div className="p-4 rounded-2xl bg-[#080B12] border border-white/[0.06]">
                <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AST Code Extraction</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Extracts genuine dependencies, commit frequency, and unit test passing rates directly from public repositories.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#080B12] border border-white/[0.06]">
                <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Warm Introduction Handshake</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
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
      <section className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-emerald-400 font-semibold">
              Verifiable Evidence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 font-sans">
              Proof-of-Work Matrix
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Select any student or alumnus to inspect real commit messages and verified citations.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by tech or name..."
                value={nodeSearchQuery}
                onChange={(e) => setNodeSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="flex items-center p-1 bg-[#080B12] border border-white/[0.08] rounded-lg text-xs">
              {(['all', 'student', 'founder', 'faculty', 'alumni'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedPersonaTab(tab)}
                  className={`px-2.5 py-1 rounded capitalize transition-all ${
                    selectedPersonaTab === tab 
                      ? 'bg-white text-black font-bold' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab + 's'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNodes.slice(0, 9).map(node => {
            const isSelected = selectedNodeId === node.id;
            const topRepo = node.proofOfWork?.repos?.[0];
            const impactScore = node.proofOfWork?.verifiedImpactScore || 90;

            return (
              <div
                key={node.id}
                onClick={() => selectNode(node.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-white/[0.06] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.2)]' 
                    : 'bg-[#080B12] border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.02]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={node.avatar}
                        alt={node.name}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                          <span>{node.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        </h4>
                        <p className="text-xs text-zinc-400">{node.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono uppercase text-zinc-500">Score</span>
                      <div className="text-xs font-black font-mono text-cyan-400">
                        {impactScore}<span className="text-[9px] text-zinc-500">/100</span>
                      </div>
                    </div>
                  </div>

                  {topRepo && (
                    <div className="mt-3.5 p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white truncate max-w-[170px]">
                          {topRepo.name}
                        </span>
                        <span className="text-zinc-400 text-[11px]">
                          {topRepo.commitsCount} commits
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                        {topRepo.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-zinc-400">
                    {node.institution.split('/')[0]}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestWarmVouch(node.id);
                      toggleWhatsApp(true, 'vouch-handshake');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-cyan-300 flex items-center space-x-1"
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
          7. SECTION: SOLAR LOADER DEMO SHOWCASE
         ========================================================================= */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#080B12] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-400 font-semibold">
              Orbital Synchronizer
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 font-sans">
              Solar Engine Clock
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              Every verified connection in Nexus runs on an active celestial clock. Real-time updates from GitHub Webhooks and WhatsApp drops propagate dynamically across all peer nodes.
            </p>

            <div className="mt-6 flex items-center space-x-3">
              <button
                onClick={() => setSolarDemoSpeed(s => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
                className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-bold transition-all"
              >
                Speed: {solarDemoSpeed}x
              </button>

              <button
                onClick={() => setIsMicroAuditModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-all"
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
          8. MINIMALIST FOOTER
         ========================================================================= */}
      <footer className="relative z-10 border-t border-white/[0.08] py-10 px-6 sm:px-10 bg-[#030509]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center space-x-2.5">
            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
              <Network className="w-3 h-3 text-cyan-400" />
            </div>
            <span className="font-bold text-white">NEXUS</span>
            <span>• PROOF-OF-WORK NETWORK</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span className="text-emerald-400 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Campus Network 100% Operational</span>
            </span>
            <span>IIITD HackShift 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
