'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Settings,
  Search,
  Mail,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Code2,
  Sliders,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Flame,
  Plus,
  Compass,
  ArrowUpRight,
  Filter,
  Check,
  X,
  Lock,
  Unlock,
  Building,
  Target
} from 'lucide-react';
import {
  INITIAL_DASHBOARD_STATS,
  MOCK_CAREER_MILESTONES,
  MOCK_SKILL_GAP,
  MOCK_BOUNTIES,
  MOCK_POLICIES,
  MOCK_RADAR_OPPORTUNITIES,
  MOCK_SOCIAL_FEED,
  SkillBounty,
  RadarOpportunity
} from '@/services/dashboardService';

type ActiveTab = 'overview' | 'time-machine' | 'bounties' | 'auto-connect' | 'radar' | 'community';

export default function KinGlassDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentTime, setCurrentTime] = useState('10:02 PM');
  const [dialScore, setDialScore] = useState(64);
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBounty, setSelectedBounty] = useState<SkillBounty | null>(null);
  const [bountiesList, setBountiesList] = useState(MOCK_BOUNTIES);
  const [submittedModalOpen, setSubmittedModalOpen] = useState(false);
  const [selectedRadarItem, setSelectedRadarItem] = useState<RadarOpportunity | null>(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [connectedUserIds, setConnectedUserIds] = useState<number[]>([401, 403]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live time ticker
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
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConnectToggle = (id: number, name: string) => {
    if (connectedUserIds.includes(id)) {
      setConnectedUserIds(prev => prev.filter(uid => uid !== id));
      showToast(`Disconnected from ${name}`);
    } else {
      setConnectedUserIds(prev => [...prev, id]);
      showToast(`1-Tap Handshake Sent to ${name}!`);
    }
  };

  // Nav icons configuration matching the 5 requested features + overview
  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutGrid },
    { id: 'time-machine' as ActiveTab, label: 'Career Time Machine', icon: History, badge: 'AI' },
    { id: 'bounties' as ActiveTab, label: 'Skill Bounty Network', icon: Trophy, count: bountiesList.length },
    { id: 'auto-connect' as ActiveTab, label: 'Qualification Auto-Connect', icon: ShieldCheck, status: 'Active' },
    { id: 'radar' as ActiveTab, label: 'Unclaimed Talent Radar', icon: Radio, pulse: true },
    { id: 'community' as ActiveTab, label: 'Community & Social', icon: Users, badge: 'Live' },
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#0e0f12] text-zinc-100 font-sans selection:bg-[#ff5500]/25 selection:text-[#ff7733] overflow-x-hidden flex">
      {/* ─── Ambient Glow Gradients (Matching Image 1 & 2) ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-[#e65c00]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-[#00a3ff]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-[#f59e0b]/5 rounded-full blur-[160px]" />
        {/* Subtle grid pattern for depth */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      {/* ─── Toast Alert ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1a1b22]/95 border border-white/10 text-white shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5500] animate-ping" />
            <span className="text-xs font-medium tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          LEFT FLOATING DOCK / RAIL (1:1 with Image 1 & 2)
          ═══════════════════════════════════════════════════════════════ */}
      <aside className="fixed left-4 top-5 bottom-5 z-40 w-[68px] hidden md:flex flex-col items-center justify-between py-6 rounded-[28px] bg-[#16171d]/85 border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Top: Custom KIN Brand Glyph */}
        <Link 
          href="/" 
          title="Back to Landing Page"
          className="group relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 hover:border-[#ff5500]/50 transition-all shadow-inner"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-[#ff5500]/20 blur-sm group-hover:bg-[#ff5500]/40 transition-all" />
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-zinc-100 group-hover:text-[#ff5500] transition-colors" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M6 6l12 12M6 18L18 6" />
            </svg>
          </div>
          {/* Tooltip */}
          <span className="absolute left-[80px] px-2.5 py-1 rounded-lg bg-[#202128] text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-lg">
            KIN Home
          </span>
        </Link>

        {/* Center: 6 Main Navigation Icons with Tooltips */}
        <div className="flex flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-b from-[#2a2b34] to-[#1c1d24] text-white border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#ff6b2b]' : ''}`} />

                {/* Status Dot / Count */}
                {item.pulse && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ff5500] ring-2 ring-[#16171d] animate-pulse" />
                )}
                {item.count && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#ff5500] text-white">
                    {item.count}
                  </span>
                )}

                {/* Floating Tooltip Label */}
                <div className="absolute left-[80px] px-3 py-1.5 rounded-xl bg-[#1c1d24] text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-2xl flex items-center gap-2 z-50">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#ff5500]/20 text-[#ff7733] border border-[#ff5500]/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom: Notification Bell with Dot & Settings */}
        <div className="flex flex-col items-center gap-3">
          <button 
            onClick={() => showToast('All 5 backend relay microservices operational')}
            className="group relative flex items-center justify-center w-11 h-11 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ff5500]" />
            <span className="absolute left-[80px] px-2.5 py-1 rounded-lg bg-[#202128] text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-lg">
              Notifications (3)
            </span>
          </button>

          <button 
            onClick={() => showToast('Settings: Deterministic AST & Privacy Guard Active')}
            className="group relative flex items-center justify-center w-11 h-11 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            <span className="absolute left-[80px] px-2.5 py-1 rounded-lg bg-[#202128] text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-lg">
              System Settings
            </span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CANVAS CONTENT
          ═══════════════════════════════════════════════════════════════ */}
      <main className="relative z-10 flex-1 md:pl-[104px] pr-4 sm:pr-8 pt-5 pb-24 max-w-[1600px] mx-auto w-full">
        {/* ─── Top Header Bar (1:1 with Image 1 & 2) ─── */}
        <header className="flex items-center justify-between mb-6 pb-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              {activeTab === 'overview' && 'Intelligence Overview'}
              {activeTab === 'time-machine' && 'Career Time Machine'}
              {activeTab === 'bounties' && 'Skill Bounty Network'}
              {activeTab === 'auto-connect' && 'Qualification Auto-Connect'}
              {activeTab === 'radar' && 'Unclaimed Talent Radar'}
              {activeTab === 'community' && 'Community & Social'}
            </h1>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>IIITD Node Relay Active</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input Pill */}
            <div className="relative hidden sm:flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, bounties, alumni..."
                className="w-56 lg:w-72 pl-10 pr-4 py-2 rounded-2xl bg-[#16171d]/80 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff5500]/50 transition-all backdrop-blur-xl"
              />
            </div>

            {/* Quick Envelope Action */}
            <button 
              onClick={() => showToast('1-Tap Encrypted Dispatch Loaded')}
              className="w-10 h-10 rounded-2xl bg-[#16171d]/80 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-white/20 transition-all backdrop-blur-xl"
            >
              <Mail className="w-4 h-4" />
            </button>

            {/* Avatar Profile */}
            <div className="flex items-center gap-3 pl-2">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-white/20 p-0.5 bg-gradient-to-br from-[#ff7733] to-[#ff3300]">
                <Image
                  src="/images/hero_builder_avatar.jpg"
                  alt="Verified User Avatar"
                  width={40}
                  height={40}
                  className="rounded-2xl object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </header>

        {/* ═════════════════════════════════════════════════════════════
            OVERVIEW TAB VIEW (Image 1 Bento Layout + Image 2 Dial & Bars)
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* ─── Top Grid: Hero Card + Active Users Curve + Latest Bounties ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 1. Large Hero Banner Card (7 cols) with Translucent Stat Pill */}
              <div className="lg:col-span-7 relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#1d1f27]/90 to-[#121318]/90 border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.4)] backdrop-blur-3xl min-h-[420px] flex flex-col justify-between p-7 sm:p-9 group">
                {/* Background Studio Portrait with Radial Glow */}
                <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[55%] pointer-events-none overflow-hidden opacity-90 sm:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#121318] via-[#121318]/60 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121318] via-transparent to-transparent z-10" />
                  <div className="absolute -top-10 -right-10 w-[300px] h-[300px] bg-[#ff5500]/25 rounded-full blur-[90px]" />
                  <Image
                    src="/images/hero_builder_avatar.jpg"
                    alt="Builder Persona"
                    fill
                    className="object-cover object-top filter contrast-[1.05]"
                  />
                </div>

                {/* Content Overlay */}
                <div className="relative z-20 max-w-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-4 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-[#ff6b2b]" />
                    <span>Popular Solution</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                    Optimize <br />
                    Your Metrics
                  </h2>
                  <button
                    onClick={() => setActiveTab('time-machine')}
                    className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-[#101114] text-xs font-bold tracking-wide uppercase shadow-[0_8px_20px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Start Now</span>
                    <ArrowUpRight className="w-4 h-4 text-[#101114]" />
                  </button>
                </div>

                {/* Floating Translucent Frosted Glass Stat Pill (1:1 with Image 1!) */}
                <div className="relative z-20 mt-8 w-full rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#ff5500]/40 via-[#e65100]/30 to-[#ff7700]/20 border border-[#ff7733]/40 backdrop-blur-2xl shadow-[0_10px_35px_rgba(230,81,0,0.35)] flex items-center justify-between">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 flex-1">
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {INITIAL_DASHBOARD_STATS.verifiedBuilders}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/80 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span>Users</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {INITIAL_DASHBOARD_STATS.activeCommits}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/80 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-pink-400" />
                        <span>Clicks</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {INITIAL_DASHBOARD_STATS.escrowVolume}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/80 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Sales</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {INITIAL_DASHBOARD_STATS.openBounties}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/80 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Items</span>
                      </div>
                    </div>
                  </div>

                  {/* Forward Arrow Circle Button */}
                  <button 
                    onClick={() => setActiveTab('bounties')}
                    className="w-11 h-11 rounded-full bg-[#16171d]/90 hover:bg-[#16171d] text-white flex items-center justify-center border border-white/20 shadow-lg hover:scale-105 transition-all ml-4 shrink-0"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* 2. Top Right Column: Dual-Curve Wave Chart + Latest Sales (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Active Users Dual Curve Wave Chart (Image 1 top right) */}
                <div className="rounded-[32px] p-6 bg-[#16171d]/85 border border-white/[0.08] backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.35)] flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                      Active Users right now 💡
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Live Telemetry</span>
                  </div>

                  {/* SVG Dual Wave Graph with Pin Tooltip */}
                  <div className="relative h-32 w-full flex items-end">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-mono text-zinc-500">
                      <span>60</span>
                      <span>40</span>
                      <span>20</span>
                      <span>0</span>
                    </div>

                    {/* Wave Path Container */}
                    <div className="ml-7 mr-2 w-full h-full relative">
                      <svg viewBox="0 0 320 100" preserveAspectRatio="none" className="w-full h-[80%] overflow-visible">
                        {/* Secondary soft curve */}
                        <path
                          d="M 0 70 C 40 45, 80 85, 120 40 C 160 15, 200 65, 240 25 C 280 40, 300 30, 320 45"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.4)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Primary gold/amber curve */}
                        <path
                          d="M 0 60 C 50 80, 90 20, 140 45 C 190 70, 230 10, 270 20 C 290 25, 305 50, 320 65"
                          fill="none"
                          stroke="#eab308"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* Hover Pin Indicator showing "50" */}
                      <div className="absolute right-8 top-1 flex flex-col items-center">
                        <div className="px-2.5 py-0.5 rounded-full bg-[#202128] border border-white/20 text-[11px] font-bold text-white shadow-lg">
                          50
                        </div>
                        <div className="w-2 h-2 rounded-full bg-[#eab308] mt-1 ring-4 ring-[#eab308]/20" />
                        <div className="w-[1px] h-14 bg-gradient-to-b from-[#eab308]/60 to-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="flex justify-between pl-8 pr-4 text-[10px] font-mono text-zinc-500 pt-1">
                    <span>Oct</span>
                    <span>Mar</span>
                    <span>Jul</span>
                    <span>Aug</span>
                  </div>
                </div>

                {/* Latest Sales / Bounties Card with 3D Holographic Token (Image 1 middle right) */}
                <div className="rounded-[32px] p-6 bg-[#16171d]/85 border border-white/[0.08] backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.35)] flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-zinc-400 mb-2">Latest Sales</div>
                    <div className="flex items-center gap-2 mb-2">
                      {/* Mini green wave sparkline */}
                      <svg viewBox="0 0 50 16" className="w-12 h-4">
                        <path d="M 0 12 Q 15 2, 25 10 T 50 2" fill="none" stroke="#22c55e" strokeWidth="2" />
                      </svg>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                        ▲ 6%
                      </span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight mb-2">
                      $ 586
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] text-zinc-200">
                        ⚡
                      </div>
                      <span>Your total earnings</span>
                    </div>
                  </div>

                  {/* 3D Item Card (Image 1 backpack render -> our 3D faceted token) */}
                  <div className="w-36 h-36 rounded-2xl overflow-hidden bg-[#20222b]/80 border border-white/10 flex flex-col items-center justify-center p-2 relative group hover:border-[#ff5500]/40 transition-all">
                    <div className="relative w-24 h-24">
                      <Image
                        src="/images/bounty_3d_token.jpg"
                        alt="3D Holographic Artifact"
                        fill
                        className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400 text-center truncate max-w-full">
                      Synthetics bounty
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Middle Section: Image 2 VisionOS Widgets (Dial, Bars & Sensors) ─── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Dial Gauge Card (Image 2 Thermostat 64° style -> Qualification Dial) */}
              <div className="md:col-span-4 rounded-[32px] p-6 bg-[#16171d]/85 border border-white/[0.08] backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.35)] flex flex-col items-center justify-between">
                <div className="w-full flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span className="font-semibold text-white">Qualification Score Dial</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">{currentTime}</span>
                    <button
                      onClick={() => setAutoAcceptEnabled(!autoAcceptEnabled)}
                      className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                        autoAcceptEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          autoAcceptEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Circular Gauge */}
                <div className="relative w-44 h-44 flex items-center justify-center my-2">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#00a3ff"
                      strokeWidth="6"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * dialScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-white tracking-tight">{dialScore}°</span>
                    <span className="text-[11px] text-zinc-400 font-medium">Auto-Accept Min</span>
                  </div>
                </div>

                {/* Minus / Plus Buttons */}
                <div className="flex items-center gap-3 my-2">
                  <button
                    onClick={() => setDialScore(Math.max(40, dialScore - 2))}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setDialScore(Math.min(98, dialScore + 2))}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Mode Selector Pills (Image 2 style) */}
                <div className="grid grid-cols-4 gap-2 w-full pt-2">
                  {[
                    { label: 'Hot', icon: Flame },
                    { label: 'Eco', icon: Target },
                    { label: 'Strict', icon: ShieldCheck },
                    { label: 'Auto', icon: CheckCircle2 },
                  ].map((mode, i) => {
                    const ModeIcon = mode.icon;
                    return (
                      <button
                        key={mode.label}
                        onClick={() => showToast(`Dial profile adjusted to ${mode.label}`)}
                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] font-medium transition-all ${
                          i === 0
                            ? 'bg-[#ff5500]/20 text-[#ff7733] border border-[#ff5500]/40'
                            : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <ModeIcon className="w-3.5 h-3.5" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Power / Skill Velocity Vertical Bar Chart (Image 2 middle) */}
              <div className="md:col-span-5 rounded-[32px] p-6 bg-[#16171d]/85 border border-white/[0.08] backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.35)] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Power & Velocity (XP)</div>
                    <div className="text-xs text-zinc-400">Monthly AST-verified commit velocity</div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-[#00a3ff]/20 text-[#00a3ff] border border-[#00a3ff]/30 text-[11px] font-mono font-bold">
                    169 kWh
                  </div>
                </div>

                {/* Vertical Bar Columns */}
                <div className="flex items-end justify-between h-44 px-3 pt-6 pb-2">
                  {[
                    { month: 'Jan', val: 55, active: false },
                    { month: 'Feb', val: 78, active: false },
                    { month: 'Mar', val: 96, active: true },
                    { month: 'Apr', val: 68, active: false },
                    { month: 'May', val: 82, active: false },
                    { month: 'Jun', val: 74, active: false },
                  ].map((bar) => (
                    <div key={bar.month} className="flex flex-col items-center gap-2 group flex-1">
                      <div className="w-full flex justify-center h-32 items-end">
                        <div
                          style={{ height: `${bar.val}%` }}
                          className={`w-6 sm:w-8 rounded-full transition-all duration-300 ${
                            bar.active
                              ? 'bg-gradient-to-t from-[#0077cc] to-[#00a3ff] shadow-[0_0_20px_rgba(0,163,255,0.6)]'
                              : 'bg-white/10 group-hover:bg-white/20'
                          }`}
                        />
                      </div>
                      <span className={`text-[10px] font-mono ${bar.active ? 'text-[#00a3ff] font-bold' : 'text-zinc-500'}`}>
                        {bar.month}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs text-zinc-400">
                  <span>Current Velocity: <strong className="text-white">1.5 k/h</strong></span>
                  <span>Match Rate: <strong className="text-white">48.2%</strong></span>
                  <span>Trust Temp: <strong className="text-white">68° F</strong></span>
                </div>
              </div>

              {/* Mini Audio / Bounty Activity Player (Image 2 bottom right) */}
              <div className="md:col-span-3 rounded-[32px] p-6 bg-[#16171d]/85 border border-white/[0.08] backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.35)] flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Neural Audio Feed
                  </div>
                  <h3 className="text-base font-bold text-white truncate">Greater Than One</h3>
                  <div className="text-xs text-zinc-400">Ericdoa x Valorant</div>
                </div>

                {/* Progress bar */}
                <div className="my-4">
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="w-2/5 h-full bg-[#ff5500] rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                    <span>0:34</span>
                    <span>2:27</span>
                  </div>
                </div>

                {/* Audio controls */}
                <div className="flex items-center justify-between text-zinc-400">
                  <button className="hover:text-white transition-colors">
                    <Repeat className="w-4 h-4" />
                  </button>
                  <button className="hover:text-white transition-colors">
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                    className="w-10 h-10 rounded-full bg-white text-[#101114] flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <button className="hover:text-white transition-colors">
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button className="hover:text-white transition-colors">
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Bottom Card: Your Top Videos / Milestones in this period (Image 1 bottom) ─── */}
            <div className="rounded-[32px] p-6 sm:p-7 bg-[#16171d]/85 border border-white/[0.08] backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Your top milestones in this period</h3>
                  <p className="text-xs text-zinc-400">Verified AST commits and career time machine checkpoints</p>
                </div>

                {/* Popularity Filter Pill */}
                <div className="relative">
                  <button
                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-zinc-200 border border-white/10 transition-all cursor-pointer"
                  >
                    <span>Popularity</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                  </button>
                </div>
              </div>

              {/* Table Column Header */}
              <div className="grid grid-cols-12 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider pb-3 border-b border-white/[0.06]">
                <div className="col-span-5">Milestone / Pipeline</div>
                <div className="col-span-3">Views / Commits</div>
                <div className="col-span-3">Average duration / Match</div>
                <div className="col-span-1 text-right">Trend</div>
              </div>

              {/* Milestone Rows */}
              <div className="divide-y divide-white/[0.04]">
                {MOCK_CAREER_MILESTONES.map((m, idx) => (
                  <div
                    key={m.id}
                    className="grid grid-cols-12 items-center py-4 hover:bg-white/[0.02] rounded-2xl px-2 transition-colors group cursor-pointer"
                    onClick={() => setActiveTab('time-machine')}
                  >
                    {/* Col 1: Video / Milestone title with badge */}
                    <div className="col-span-5 flex items-center gap-3 pr-2">
                      <div className="w-12 h-12 rounded-xl bg-[#202128] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#ff5500]/40 transition-colors">
                        <Code2 className="w-5 h-5 text-[#ff6b2b]" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#ff7733] transition-colors truncate">
                          {m.role}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{m.company}</span>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Views / Commits */}
                    <div className="col-span-3 flex items-center gap-2 text-xs text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>{idx === 0 ? '16.3k views' : idx === 1 ? '12.8k views' : '9.4k views'}</span>
                    </div>

                    {/* Col 3: Duration / Match */}
                    <div className="col-span-3 flex items-center gap-2 text-xs text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{idx === 0 ? '13:21 (17.54%)' : idx === 1 ? '17:34 (38.54%)' : '08:12 (24.11%)'}</span>
                    </div>

                    {/* Col 4: Sparkline wave */}
                    <div className="col-span-1 flex justify-end">
                      <svg viewBox="0 0 40 16" className="w-10 h-4">
                        <path
                          d={idx === 0 ? "M 0 10 Q 10 2, 20 12 T 40 4" : "M 0 6 Q 10 14, 20 4 T 40 10"}
                          fill="none"
                          stroke={idx === 0 ? "#eab308" : "#86efac"}
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            FEATURE 1: CAREER TIME MACHINE WORKSPACE
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'time-machine' && (
          <div className="space-y-6">
            <div className="p-8 rounded-[32px] bg-[#16171d]/90 border border-white/10 backdrop-blur-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5500]/10 border border-[#ff5500]/30 text-xs font-semibold text-[#ff7733] mb-2">
                    <History className="w-3.5 h-3.5" />
                    <span>Deterministic Career Playback Engine</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Career Time Machine</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Replay verified alumni journeys, compare historical trajectory milestones, and bridge skill gaps.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Simulating career jump to: Staff Systems Architect')}
                  className="px-5 py-2.5 rounded-2xl bg-[#ff5500] hover:bg-[#ff6611] text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 self-start"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Simulate Next Career Leap</span>
                </button>
              </div>

              {/* Deterministic Skill Gap Analysis Bento */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1 rounded-2xl p-6 bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-semibold text-zinc-400 mb-1">Target Trajectory</div>
                  <div className="text-xl font-bold text-white mb-4">{MOCK_SKILL_GAP.targetRole}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl font-black text-[#ff7733]">{MOCK_SKILL_GAP.readinessScore}%</div>
                    <div className="text-xs text-zinc-400">
                      Empirical Readiness <br />
                      <span className="text-emerald-400 font-medium">Based on 14 IIITD Alumni</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-2xl p-6 bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-semibold text-zinc-400 mb-3">Priority Missing Skills to Bridge</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MOCK_SKILL_GAP.missingSkills.map((sk) => (
                      <div key={sk.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-xs font-semibold text-white">{sk.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            sk.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {sk.priority}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">{sk.frequency}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Journey Milestones Timeline */}
              <h3 className="text-lg font-bold text-white mb-4">Historical Trajectory Checkpoints</h3>
              <div className="space-y-4">
                {MOCK_CAREER_MILESTONES.map((m, idx) => (
                  <div key={m.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#ff5500]/10 border border-[#ff5500]/30 flex items-center justify-center text-sm font-bold text-[#ff7733] shrink-0">
                        0{idx + 1}
                      </div>
                      <div>
                        <div className="text-base font-bold text-white">{m.role}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {m.company} • <span className="text-zinc-300">{m.period}</span> ({m.duration})
                        </div>
                        <p className="text-xs text-zinc-300 mt-2 italic">“{m.keyAchievement}”</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {m.acquiredSkills.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-medium text-zinc-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-1">
                      <div className="text-xs font-mono text-emerald-400 font-semibold">{m.verifiedBy}</div>
                      <div className="text-xs text-zinc-500">Velocity: {m.velocityScore}/100</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            FEATURE 2: SKILL BOUNTY NETWORK WORKSPACE
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'bounties' && (
          <div className="space-y-6">
            <div className="p-8 rounded-[32px] bg-[#16171d]/90 border border-white/10 backdrop-blur-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 mb-2">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>AST Verified Escrow Challenges</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Skill Bounty Network</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Solve real technical challenges posted by founders and alumni. Zero-form verification via AST runner.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Opening Bounty Proposal Builder')}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post a Skill Bounty</span>
                </button>
              </div>

              {/* Bounties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bountiesList.map((bounty) => (
                  <div
                    key={bounty.id}
                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between group cursor-pointer"
                    onClick={() => setSelectedBounty(bounty)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-400">{bounty.organization}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          bounty.difficulty === 'EXPERT' ? 'bg-purple-500/20 text-purple-400' :
                          bounty.difficulty === 'HARD' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {bounty.difficulty}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-3">
                        {bounty.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {bounty.requiredSkills.map((sk) => (
                          <span key={sk} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-300">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <div className="text-xs text-zinc-400">Escrow Reward</div>
                        <div className="text-xl font-extrabold text-white">${bounty.rewardUsdc} USDC</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-zinc-400">{bounty.deadline}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBounty(bounty);
                            setSubmittedModalOpen(true);
                          }}
                          className="mt-1 px-3 py-1.5 rounded-xl bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-bold transition-all"
                        >
                          Submit PR
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            FEATURE 3: QUALIFICATION BASED AUTO CONNECTION WORKSPACE
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'auto-connect' && (
          <div className="space-y-6">
            <div className="p-8 rounded-[32px] bg-[#16171d]/90 border border-white/10 backdrop-blur-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a3ff]/10 border border-[#00a3ff]/30 text-xs font-semibold text-[#00a3ff] mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Deterministic Handshake Protocols</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Qualification-Based Auto Connection</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Set rules for automatic acceptance: AST commit thresholds, verified repositories, and mutual nodes.
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start">
                  <span className="text-xs text-zinc-400">Global Auto-Accept:</span>
                  <button
                    onClick={() => {
                      setAutoAcceptEnabled(!autoAcceptEnabled);
                      showToast(`Auto-Accept policy ${!autoAcceptEnabled ? 'Activated' : 'Paused'}`);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      autoAcceptEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        autoAcceptEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Policies List */}
              <div className="space-y-4 mb-8">
                {MOCK_POLICIES.map((pol) => (
                  <div key={pol.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-white">{pol.name}</span>
                        {pol.autoAccept ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            Auto-Accept ON
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300 text-[10px] font-bold">
                            Manual Review
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 flex flex-wrap gap-4 mt-2">
                        <span>Min Commits: <strong className="text-white">{pol.minCommits}</strong></span>
                        <span>Score Cutoff: <strong className="text-[#00a3ff]">{pol.qualificationScoreThreshold}%</strong></span>
                        <span>Pending Handshakes: <strong className="text-amber-400">{pol.activeRequestsCount}</strong></span>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(`Evaluated criteria for ${pol.name}`)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all self-start"
                    >
                      Configure Criteria
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            FEATURE 4: UNCLAIMED TALENT RADAR WORKSPACE
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'radar' && (
          <div className="space-y-6">
            <div className="p-8 rounded-[32px] bg-[#16171d]/90 border border-white/10 backdrop-blur-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-400 mb-2">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Cross-Industry Transferable Bridges</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Unclaimed Talent Radar</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Find non-obvious high-impact opportunities outside your primary domain where your core skills bridge.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Deep Sweep complete: 18 non-obvious matches found')}
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 self-start"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Deep Radar Sweep</span>
                </button>
              </div>

              {/* Radar Discovery Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_RADAR_OPPORTUNITIES.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-purple-500/40 transition-all flex flex-col justify-between group cursor-pointer"
                    onClick={() => setSelectedRadarItem(opp)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-purple-400">{opp.industry}</span>
                        <span className="text-xs font-mono font-bold text-white">{opp.matchScore}% Match</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                        {opp.title}
                      </h3>
                      <div className="text-xs text-zinc-400 mb-3">{opp.organization}</div>
                      <p className="text-xs text-zinc-300 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04] mb-4">
                        {opp.reasoning}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {opp.bridgeSkills.map((sk) => (
                          <span key={sk} className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Expressed interest in ${opp.organization}`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold border border-purple-500/30 transition-all"
                    >
                      Express Interest via 1-Tap Bridge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            FEATURE 5: COMMUNITY & SOCIAL MEDIA WORKSPACE
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <div className="p-8 rounded-[32px] bg-[#16171d]/90 border border-white/10 backdrop-blur-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400 mb-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>Verified Builder Feed & Network</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Community & Social</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Connect directly with peers, alumni mentors, and founders through verified code vouches.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Dispatching community update')}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Share an AST Proof</span>
                </button>
              </div>

              {/* Feed Items */}
              <div className="space-y-4 max-w-3xl mx-auto">
                {MOCK_SOCIAL_FEED.map((post) => (
                  <div key={post.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 relative">
                          <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{post.author.name}</span>
                            {post.author.verified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                            )}
                          </div>
                          <div className="text-xs text-zinc-400">{post.author.role}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConnectToggle(post.id, post.author.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          connectedUserIds.includes(post.id)
                            ? 'bg-white/10 text-zinc-300 hover:bg-red-500/20 hover:text-red-400'
                            : 'bg-white text-zinc-900 hover:bg-zinc-200'
                        }`}
                      >
                        {connectedUserIds.includes(post.id) ? 'Connected' : '1-Tap Connect'}
                      </button>
                    </div>

                    <p className="text-sm text-zinc-200 leading-relaxed mb-4">{post.content}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((t) => (
                        <span key={t} className="text-xs font-mono text-blue-400">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-white/[0.05]">
                      <span>{post.timestamp}</span>
                      <span>{post.mutualConnections} mutual alumni vouches</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          FLOATING BOTTOM CAPSULE PILL BAR (1:1 with Image 2)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full bg-[#16171d]/90 border border-white/10 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          {[
            { id: 'overview' as ActiveTab, label: 'Overview' },
            { id: 'time-machine' as ActiveTab, label: 'Time Machine' },
            { id: 'bounties' as ActiveTab, label: 'Skill Bounties' },
            { id: 'auto-connect' as ActiveTab, label: 'Auto Connect' },
            { id: 'radar' as ActiveTab, label: 'Talent Radar' },
            { id: 'community' as ActiveTab, label: 'Community' },
          ].map((pill) => {
            const isActive = activeTab === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setActiveTab(pill.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#101114] shadow-md scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
          <div className="w-[1px] h-5 bg-white/20 mx-1" />
          <button
            onClick={() => showToast('Quick Action: Instant AST Verification Triggered')}
            className="w-8 h-8 rounded-full bg-[#00a3ff] hover:bg-[#0090e0] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
            title="Add New Intent"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Submit Bounty Modal ─── */}
      <AnimatePresence>
        {submittedModalOpen && selectedBounty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-lg w-full rounded-3xl bg-[#16171d] border border-white/10 p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-emerald-400">AST PR Verification</span>
                <button onClick={() => setSubmittedModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{selectedBounty.title}</h3>
              <p className="text-xs text-zinc-400 mb-6">
                Paste your GitHub Pull Request URL or repository commit hash. The AST engine will run automated test suites and verify AST compliance deterministically.
              </p>
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="https://github.com/org/repo/pull/42"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSubmittedModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSubmittedModalOpen(false);
                    showToast(`PR submitted for ${selectedBounty.title}! AST evaluation queued.`);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold"
                >
                  Confirm Submission
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
