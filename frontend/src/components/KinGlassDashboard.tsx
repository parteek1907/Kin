'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  History,
  Trophy,
  ShieldCheck,
  Radio,
  Users,
  Bell,
  Search,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Plus,
  GitCommit,
  X,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Handshake,
  ExternalLink
} from 'lucide-react';
import {
  MOCK_CAREER_MILESTONES,
  MOCK_SKILL_GAP,
  MOCK_BOUNTIES,
  MOCK_POLICIES,
  MOCK_RADAR_OPPORTUNITIES,
  MOCK_SOCIAL_FEED,
  SkillBounty
} from '@/services/dashboardService';

type ActiveTab = 'overview' | 'time-machine' | 'bounties' | 'auto-connect' | 'radar' | 'community';

export default function KinGlassDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentTime, setCurrentTime] = useState('10:02 PM');
  const [autoAcceptThreshold, setAutoAcceptThreshold] = useState(64);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Action card toggles (Bottom row like Image 3)
  const [trackedBounties, setTrackedBounties] = useState<{ [id: number]: boolean }>({
    101: true,
    102: false,
    301: true,
    302: false,
  });

  // Modal and submission state
  const [selectedBounty, setSelectedBounty] = useState<SkillBounty | null>(null);
  const [submitPrModalOpen, setSubmitPrModalOpen] = useState(false);
  const [isPlayingPulse, setIsPlayingPulse] = useState(true);
  const [pulseIndex, setPulseIndex] = useState(0);

  // Career Time Machine scrubber state
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(1);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleBountyTrack = (id: number, name: string) => {
    setTrackedBounties((prev) => {
      const next = !prev[id];
      showToast(next ? `Tracking ${name}` : `Untracked ${name}`);
      return { ...prev, [id]: next };
    });
  };

  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutGrid },
    { id: 'time-machine' as ActiveTab, label: 'Career Time Machine', icon: History },
    { id: 'bounties' as ActiveTab, label: 'Skill Bounty Network', icon: Trophy },
    { id: 'auto-connect' as ActiveTab, label: 'Qualification Auto-Connect', icon: ShieldCheck },
    { id: 'radar' as ActiveTab, label: 'Unclaimed Talent Radar', icon: Radio },
    { id: 'community' as ActiveTab, label: 'Community Feed', icon: Users },
  ];

  const activePost = MOCK_SOCIAL_FEED[pulseIndex % MOCK_SOCIAL_FEED.length];

  const getCardsForTab = () => {
    if (activeTab === 'bounties') {
      return MOCK_BOUNTIES.map((b) => ({
        id: b.id,
        icon: Trophy,
        iconColor: 'text-amber-600',
        badge: `$${b.rewardUsdc} USDC Bounty`,
        badgeColor: 'text-amber-800',
        title: b.title,
        desc: b.requiredSkills.slice(0, 3).join(' • '),
        active: !!trackedBounties[b.id],
        onToggle: () => toggleBountyTrack(b.id, b.title),
      }));
    }
    if (activeTab === 'radar') {
      return MOCK_RADAR_OPPORTUNITIES.map((r) => ({
        id: r.id,
        icon: Radio,
        iconColor: 'text-purple-600',
        badge: `${r.matchScore}% Skill Bridge`,
        badgeColor: 'text-purple-800',
        title: r.organization,
        desc: r.industry,
        active: !!trackedBounties[r.id],
        onToggle: () => toggleBountyTrack(r.id, r.organization),
      }));
    }
    if (activeTab === 'auto-connect') {
      return [
        {
          id: 501,
          icon: ShieldCheck,
          iconColor: 'text-emerald-600',
          badge: 'Alumni Systems Builders',
          badgeColor: 'text-emerald-800',
          title: 'Auto-Accept Policy',
          desc: 'Score cutoff: 78% • Min 50 Commits',
          active: true,
          onToggle: () => showToast('Toggled Alumni Auto-Accept policy'),
        },
        {
          id: 502,
          icon: GitCommit,
          iconColor: 'text-sky-600',
          badge: 'Open Source Maintainers',
          badgeColor: 'text-sky-800',
          title: 'Manual Review Mode',
          desc: 'Rust / C++ maintainers with 120+ commits',
          active: false,
          onToggle: () => showToast('Toggled OSS Review policy'),
        },
        {
          id: 503,
          icon: Users,
          iconColor: 'text-indigo-600',
          badge: 'Institution Whitelist',
          badgeColor: 'text-indigo-800',
          title: 'Tier-1 Engineering Nodes',
          desc: 'IIIT Delhi, IIT Delhi, Stanford verified',
          active: true,
          onToggle: () => showToast('Toggled Institution filter'),
        },
        {
          id: 504,
          icon: Sparkles,
          iconColor: 'text-purple-600',
          badge: 'Deterministic AST Runner',
          badgeColor: 'text-purple-800',
          title: 'Automated Test Passing',
          desc: 'Only connects when PR test suite is 100%',
          active: true,
          onToggle: () => showToast('Toggled AST verification mandate'),
        },
      ];
    }
    if (activeTab === 'time-machine') {
      return [
        {
          id: 601,
          icon: History,
          iconColor: 'text-[#E25C38]',
          badge: 'Trajectory Path 1',
          badgeColor: 'text-[#E25C38]',
          title: 'AI Inference Systems Lead',
          desc: '74% empirical fit • 4.2 Yrs to Staff',
          active: true,
          onToggle: () => showToast('Selected AI Inference trajectory'),
        },
        {
          id: 602,
          icon: Sparkles,
          iconColor: 'text-[#E25C38]',
          badge: 'Trajectory Path 2',
          badgeColor: 'text-[#E25C38]',
          title: 'Distributed Raft Architect',
          desc: '88% empirical fit • 3.5 Yrs to Staff',
          active: false,
          onToggle: () => showToast('Selected Distributed Raft trajectory'),
        },
        {
          id: 603,
          icon: Trophy,
          iconColor: 'text-[#E25C38]',
          badge: 'Trajectory Path 3',
          badgeColor: 'text-[#E25C38]',
          title: 'Compiler Engine Specialist',
          desc: '92% empirical fit • 2.8 Yrs to Staff',
          active: false,
          onToggle: () => showToast('Selected Compiler trajectory'),
        },
        {
          id: 604,
          icon: Radio,
          iconColor: 'text-[#E25C38]',
          badge: 'Trajectory Path 4',
          badgeColor: 'text-[#E25C38]',
          title: 'Kernel & eBPF Security Lead',
          desc: '81% empirical fit • 4.0 Yrs to Staff',
          active: false,
          onToggle: () => showToast('Selected Kernel Security trajectory'),
        },
      ];
    }
    if (activeTab === 'community') {
      return MOCK_SOCIAL_FEED.slice(0, 4).map((p) => ({
        id: p.id,
        icon: Users,
        iconColor: 'text-slate-800',
        badge: p.author.institution || 'Verified Alumni',
        badgeColor: 'text-slate-800',
        title: p.author.name,
        desc: p.author.role,
        active: true,
        onToggle: () => showToast(`Vouch verified for ${p.author.name}`),
      }));
    }
    // Default Overview: 2 bounties + 2 radar bridges
    return [
      {
        id: 101,
        icon: Trophy,
        iconColor: 'text-amber-600',
        badge: '$850 USDC Bounty',
        badgeColor: 'text-amber-800',
        title: 'Shared Memory Buffer',
        desc: 'High-throughput IPC for Linux',
        active: !!trackedBounties[101],
        onToggle: () => toggleBountyTrack(101, 'Ring Buffer Bounty'),
      },
      {
        id: 102,
        icon: GitCommit,
        iconColor: 'text-amber-600',
        badge: '$586 USDC Bounty',
        badgeColor: 'text-amber-800',
        title: 'TypeScript AST Pruner',
        desc: 'Dependency graph solver',
        active: !!trackedBounties[102],
        onToggle: () => toggleBountyTrack(102, 'TypeScript AST Pruner'),
      },
      {
        id: 301,
        icon: Radio,
        iconColor: 'text-purple-600',
        badge: '92% Skill Bridge',
        badgeColor: 'text-purple-800',
        title: 'Computational Biology',
        desc: 'Genomics ETL Engine',
        active: !!trackedBounties[301],
        onToggle: () => toggleBountyTrack(301, 'Bio-Informatics Bridge'),
      },
      {
        id: 302,
        icon: Sparkles,
        iconColor: 'text-purple-600',
        badge: '89% Skill Bridge',
        badgeColor: 'text-purple-800',
        title: 'Autonomous Robotics',
        desc: '3D Obstacle Traversal',
        active: !!trackedBounties[302],
        onToggle: () => toggleBountyTrack(302, 'Robotics Mesh Bridge'),
      },
    ];
  };

  const activeCards = getCardsForTab();

  return (
    <div className="relative w-full min-h-screen font-sans text-slate-900 selection:bg-[#E25C38]/20 selection:text-[#E25C38] overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════════════
          NATURAL DAYLIGHT MODERN LIVING ROOM BACKGROUND (VisionOS Style)
          Soft daylight, crisp white walls, floor-to-ceiling windows
          ═══════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none overflow-hidden">
        <Image
          src="/images/visionos_interior_bg.jpg"
          alt="Modern Minimalist Interior Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center w-full h-full filter brightness-[0.98] contrast-[1.02]"
        />
        {/* Soft daylight ambient wash */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px]" />
      </div>

      {/* ─── Toast Notification ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-8 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 border border-white/90 text-slate-900 shadow-[0_15px_35px_rgba(0,0,0,0.12)] backdrop-blur-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-[#E25C38]" />
            <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CANVAS: LIGHT GRAY TRANSPARENT GLASS (1:1 with Image 3)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full min-h-screen p-3 sm:p-5 lg:p-8 flex flex-col justify-between items-center">
        
        {/* ─── DETACHED LEFT FLOATING GLASS CAPSULE DOCK ─── */}
        <aside className="fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3 py-4 px-2.5 rounded-full bg-white/40 border border-white/70 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08),_inset_0_1px_2px_rgba(255,255,255,0.85)]">
          {/* Logo Home button */}
          <Link
            href="/"
            title="Return to Landing Page"
            className="w-10 h-10 rounded-full bg-white/60 hover:bg-white border border-white/80 flex items-center justify-center transition-all hover:scale-105 shadow-sm"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-[#E25C38]" />
          </Link>

          <div className="w-5 h-[1px] bg-slate-300/50 my-1" />

          {/* 5 Feature Icons + Overview */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md scale-105'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E25C38]' : ''}`} />
                {/* Micro Tooltip */}
                <span className="absolute left-13 px-3 py-1.5 rounded-xl bg-white/90 text-xs font-semibold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/90 shadow-xl backdrop-blur-2xl">
                  {item.label}
                </span>
              </button>
            );
          })}

          <div className="w-5 h-[1px] bg-slate-300/50 my-1" />

          {/* Minimalist Profile Indicator */}
          <div className="w-9 h-9 rounded-full border border-white/80 bg-white/60 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-800 shadow-sm">
            KIN
          </div>
        </aside>

        {/* ─── TOP MINIMAL HEADER BAR ─── */}
        <header className="w-full max-w-[1320px] md:pl-14 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-black tracking-tight text-slate-900">KIN</span>
              <span className="text-xs font-medium text-slate-600">Campus Intelligence</span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/50 hover:bg-white/80 border border-white/70 text-xs font-semibold text-slate-800 transition-all shadow-sm backdrop-blur-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back to Home</span>
            </Link>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════
            THE UNIFIED FLOATING VISIONOS GLASS WINDOW (1:1 with Image 3)
            Clean, light-gray/transparent frosted glass panel
            ═══════════════════════════════════════════════════════════════ */}
        <main className="w-full max-w-[1320px] md:pl-14">
          <div className="rounded-[36px] bg-white/45 hover:bg-white/50 border border-white/70 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.07),_inset_0_1.5px_2px_rgba(255,255,255,0.85)] p-5 sm:p-7 transition-all">
            
            {/* Split Screen Layout: Left Zone (Main Bento) + Right Zone (Dial & Controls) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
              
              {/* ────────────────────────────────────────────────────────
                  LEFT ZONE (8 cols): Hero, Chart, Metrics, Quick Cards
                  ──────────────────────────────────────────────────────── */}
              <div className="lg:col-span-8 flex flex-col justify-between gap-5">
                
                {/* ── TOP ROW: Career Time Machine Hero (Left) + Verification Velocity Chart (Right) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                  
                  {/* Hero Card: Career Time Machine (7 cols) */}
                  <div className="sm:col-span-7 rounded-3xl p-5 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-[0_10px_25px_rgba(0,0,0,0.04),_inset_0_1px_1.5px_rgba(255,255,255,0.8)] flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Career Time Machine
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].period}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].role}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].company}
                      </p>

                      {/* Stat Metrics Box (Time Usage / Velocity like Image 3) */}
                      <div className="rounded-2xl p-3 bg-white/40 border border-white/60 my-3 flex items-center justify-between">
                        <div>
                          <div className="text-base font-black text-slate-900">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].duration}
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium">Trajectory Span</div>
                        </div>
                        <div className="w-[1px] h-7 bg-slate-300/60" />
                        <div>
                          <div className="text-base font-black text-[#E25C38]">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].velocityScore}% Match
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium">Empirical Fit</div>
                        </div>
                      </div>

                      {/* Timeline Scrubber (Like Image 3 Brightness / Time Slider) */}
                      <div className="my-2">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-1.5">
                          <span>Timeline Stage</span>
                          <span>{selectedMilestoneIndex + 1} of {MOCK_CAREER_MILESTONES.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {MOCK_CAREER_MILESTONES.map((m, idx) => (
                            <button
                              key={m.id}
                              onClick={() => setSelectedMilestoneIndex(idx)}
                              className={`flex-1 h-2 rounded-full transition-all cursor-pointer ${
                                selectedMilestoneIndex === idx
                                  ? 'bg-[#E25C38]'
                                  : selectedMilestoneIndex > idx
                                  ? 'bg-slate-400/70'
                                  : 'bg-slate-200/80'
                              }`}
                              title={m.role}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-300/40 flex items-center justify-between text-[11px] text-slate-600">
                      <span>Alumni: <strong className="text-slate-900">Dr. Aarav Sharma</strong> (Anthropic)</span>
                      <button
                        onClick={() => setActiveTab('time-machine')}
                        className="font-bold text-slate-900 hover:text-[#E25C38] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Full Path</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Skill Velocity Activity Chart (5 cols - 1:1 with Image 3 Power Chart) */}
                  <div className="sm:col-span-5 rounded-3xl p-5 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-[0_10px_25px_rgba(0,0,0,0.04),_inset_0_1px_1.5px_rgba(255,255,255,0.8)] flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Skill Velocity
                          </span>
                          <span className="text-xs font-bold text-slate-800">AST Commits</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#0284c7] px-2 py-0.5 rounded-full bg-sky-100/70 border border-sky-300">
                          169 Peak
                        </span>
                      </div>

                      {/* Bar Chart (Jan - Jun with highlighted bar like Image 3) */}
                      <div className="flex items-end justify-between h-28 pt-2 px-1">
                        {[
                          { month: 'Jan', value: 55, active: false },
                          { month: 'Feb', value: 75, active: false },
                          { month: 'Mar', value: 100, active: true },
                          { month: 'Apr', value: 65, active: false },
                          { month: 'May', value: 85, active: false },
                          { month: 'Jun', value: 70, active: false },
                        ].map((bar) => (
                          <div key={bar.month} className="flex flex-col items-center gap-1.5 flex-1">
                            <div className="w-full h-20 flex items-end justify-center">
                              <div
                                style={{ height: `${bar.value}%` }}
                                className={`w-3 sm:w-3.5 rounded-full transition-all ${
                                  bar.active
                                    ? 'bg-[#0284c7] shadow-sm'
                                    : 'bg-slate-300/80 hover:bg-slate-400'
                                }`}
                              />
                            </div>
                            <span className="text-[10px] text-slate-600 font-semibold">{bar.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-300/40 flex items-center justify-between text-[11px] text-slate-600">
                      <span>Evaluated monthly</span>
                      <span className="text-emerald-700 font-bold">+28% Velocity</span>
                    </div>
                  </div>

                </div>

                {/* ── MIDDLE ROW: 3 Key Metric Tiles (1:1 with Image 3 Consumption, Humidity, Temp) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl p-4 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm transition-all">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Verified Builders
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-1">76,420</div>
                    <span className="text-[10px] text-emerald-700 font-bold">14 Active Clusters</span>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm transition-all">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Skill Bounty Escrow
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-1">$3,600 USDC</div>
                    <span className="text-[10px] text-amber-700 font-bold">4 Open Challenges</span>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm transition-all">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Talent Radar Matches
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-1">18 Discovered</div>
                    <span className="text-[10px] text-purple-700 font-bold">Cross-Industry Transfer</span>
                  </div>
                </div>

                {/* ── BOTTOM ROW: 4 Dynamic Action Cards with Toggle Switches (1:1 with Image 3) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {activeCards.map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <div
                        key={card.id}
                        className="rounded-2xl p-4 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm flex flex-col justify-between transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-8 h-8 rounded-xl bg-white/60 border border-white/80 flex items-center justify-center ${card.iconColor} shadow-sm`}>
                            <CardIcon className="w-4 h-4" />
                          </div>
                          <button
                            onClick={card.onToggle}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                              card.active ? 'bg-[#0284c7]' : 'bg-slate-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                card.active ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold ${card.badgeColor}`}>
                            {card.badge}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">
                            {card.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* ────────────────────────────────────────────────────────
                  RIGHT ZONE (4 cols): Clock, Dial, Mode Presets, Pulse
                  1:1 with Image 3 Right Column (Thermostat + Music Player)
                  ──────────────────────────────────────────────────────── */}
              <div className="lg:col-span-4 rounded-3xl p-5 sm:p-6 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-[0_10px_25px_rgba(0,0,0,0.04),_inset_0_1px_1.5px_rgba(255,255,255,0.8)] flex flex-col justify-between transition-all">
                
                <div>
                  {/* Top Header: Clock + Dial Toggle (1:1 with Image 3 10:02 PM + Thermostat) */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-mono font-bold text-slate-800 tracking-tight">
                      {currentTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">Auto-Connect</span>
                      <button
                        onClick={() => {
                          setAutoAcceptEnabled(!autoAcceptEnabled);
                          showToast(`Auto-accept ${!autoAcceptEnabled ? 'Active' : 'Paused'}`);
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          autoAcceptEnabled ? 'bg-[#E25C38]' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                            autoAcceptEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* ── Circular Arc Dial (1:1 with Image 3 64° Dial) ── */}
                  <div className="relative w-44 h-44 mx-auto my-3 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      {/* Background track circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="39"
                        fill="none"
                        stroke="rgba(203, 213, 225, 0.45)"
                        strokeWidth="7"
                      />
                      {/* Active Blue Arc (Exact same blue as Image 3 thermostat) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="39"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="7"
                        strokeDasharray="245"
                        strokeDashoffset={245 - (245 * autoAcceptThreshold) / 100}
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Center Dial readout */}
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-black text-slate-900 tracking-tight">
                        {autoAcceptThreshold}%
                      </span>
                      <span className="text-[11px] text-slate-600 font-semibold mt-0.5">
                        Cutoff Score
                      </span>
                    </div>
                  </div>

                  {/* Minus & Plus Buttons (1:1 with Image 3 underneath dial) */}
                  <div className="flex items-center justify-center gap-4 my-2">
                    <button
                      onClick={() => setAutoAcceptThreshold(Math.max(40, autoAcceptThreshold - 2))}
                      className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center text-sm font-bold shadow-sm transition-all cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setAutoAcceptThreshold(Math.min(98, autoAcceptThreshold + 2))}
                      className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center text-sm font-bold shadow-sm transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* 4 Policy Mode Presets (1:1 with Image 3 Hot / Eco / Fan / Cold buttons) */}
                  <div className="grid grid-cols-4 gap-1.5 my-3 pt-3 border-t border-slate-300/40">
                    {[
                      { l: 'Strict', s: 85 },
                      { l: 'Alumni', s: 75 },
                      { l: 'OSS', s: 64 },
                      { l: 'Open', s: 50 },
                    ].map((p) => (
                      <button
                        key={p.l}
                        onClick={() => {
                          setAutoAcceptThreshold(p.s);
                          showToast(`Mode preset: ${p.l} (${p.s}%)`);
                        }}
                        className={`py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                          autoAcceptThreshold === p.s
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white/60 text-slate-700 hover:bg-white'
                        }`}
                      >
                        {p.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Bottom Widget: Community Live Vouch & Pulse (1:1 with Image 3 Music Player) ── */}
                <div className="rounded-2xl p-4 bg-white/40 border border-white/60 mt-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Community Pulse
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">Verified Alumni</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {activePost.author.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      “{activePost.content}”
                    </p>
                  </div>

                  {/* Scrub progress wave (like audio progress in Image 3) */}
                  <div className="my-2.5">
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                      <div className="w-2/5 h-full bg-[#E25C38] rounded-full" />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                      <span>{activePost.timestamp}</span>
                      <span>{activePost.mutualConnections} mutual vouches</span>
                    </div>
                  </div>

                  {/* Interactive Controls (Prev / Pause / Next / Handshake) */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setPulseIndex((p) => (p - 1 + MOCK_SOCIAL_FEED.length) % MOCK_SOCIAL_FEED.length)}
                      className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Previous Vouch"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsPlayingPulse(!isPlayingPulse);
                        showToast(isPlayingPulse ? 'Paused pulse stream' : 'Resumed pulse stream');
                      }}
                      className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-all shadow-sm cursor-pointer"
                    >
                      {isPlayingPulse ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                    </button>
                    <button
                      onClick={() => setPulseIndex((p) => (p + 1) % MOCK_SOCIAL_FEED.length)}
                      className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Next Vouch"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => showToast(`1-Tap Handshake Sent to ${activePost.author.name}`)}
                      className="text-[#E25C38] hover:text-[#d04e2e] transition-colors cursor-pointer"
                      title="1-Tap Handshake"
                    >
                      <Handshake className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>

        {/* ═══════════════════════════════════════════════════════════════
            FLOATING BOTTOM CAPSULE TAB SWITCHER (1:1 with Image 3 Pill Bar)
            Detached rounded-full frosted glass capsule bar
            ═══════════════════════════════════════════════════════════════ */}
        <footer className="mt-5 mb-2 flex justify-center w-full md:pl-14">
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/45 border border-white/75 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08),_inset_0_1.5px_2px_rgba(255,255,255,0.9)] overflow-x-auto max-w-full">
            {[
              { id: 'overview' as ActiveTab, label: 'Overview' },
              { id: 'time-machine' as ActiveTab, label: 'Career Time Machine' },
              { id: 'bounties' as ActiveTab, label: 'Skill Bounties' },
              { id: 'auto-connect' as ActiveTab, label: 'Auto Connect' },
              { id: 'radar' as ActiveTab, label: 'Talent Radar' },
              { id: 'community' as ActiveTab, label: 'Community' },
            ].map((pill) => {
              const isSelected = activeTab === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    setActiveTab(pill.id);
                    if (pill.id === 'time-machine') {
                      showToast('Focusing Career Time Machine Trajectory');
                    } else if (pill.id === 'bounties') {
                      showToast('Focusing Skill Bounty Network');
                    } else if (pill.id === 'auto-connect') {
                      showToast('Focusing Qualification Auto-Connect');
                    } else if (pill.id === 'radar') {
                      showToast('Focusing Unclaimed Talent Radar');
                    } else if (pill.id === 'community') {
                      showToast('Focusing Community Feed');
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md font-bold scale-105'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}

            <div className="w-[1px] h-4 bg-slate-300/60 mx-1" />

            <button
              onClick={() => {
                setSelectedBounty(MOCK_BOUNTIES[0]);
                setSubmitPrModalOpen(true);
              }}
              className="w-7 h-7 rounded-full bg-[#0284c7] hover:bg-sky-600 text-white flex items-center justify-center font-bold shadow transition-transform hover:scale-110 cursor-pointer"
              title="Submit AST PR Challenge"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </footer>

      </div>

      {/* ─── Submit PR Modal ─── */}
      <AnimatePresence>
        {submitPrModalOpen && selectedBounty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full rounded-3xl bg-white/90 border border-white p-6 shadow-2xl backdrop-blur-3xl text-slate-900"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-[#E25C38] font-bold">AST PR Verification</span>
                <button onClick={() => setSubmitPrModalOpen(false)} className="text-slate-500 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{selectedBounty.title}</h3>
              <p className="text-xs text-slate-600 mb-4">
                Enter your GitHub Pull Request link. The automated AST runner will evaluate test coverage and skill verification deterministically.
              </p>
              <input
                type="text"
                placeholder="https://github.com/org/repo/pull/42"
                className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSubmitPrModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSubmitPrModalOpen(false);
                    showToast(`PR queued for AST verification on ${selectedBounty.title}`);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#E25C38] hover:bg-[#d04e2e] text-white text-xs font-bold shadow"
                >
                  Submit PR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
