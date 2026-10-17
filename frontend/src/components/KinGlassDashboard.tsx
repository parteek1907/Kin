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
  Settings,
  Search,
  Mail,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
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
  Sun,
  Wind,
  Snowflake,
  Leaf,
  Volume2,
  Activity,
  SlidersHorizontal,
  FolderKanban,
  Check,
  X
} from 'lucide-react';
import {
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
  const [activeDialMode, setActiveDialMode] = useState<'Hot' | 'Eco' | 'Fan' | 'Cold'>('Hot');
  const [thermostatOn, setThermostatOn] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [sliderValue, setSliderValue] = useState(72);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 4 Feature Toggles (Image 1 bottom cards)
  const [toggles, setToggles] = useState({
    careerTimeMachine: true,
    skillBountyNetwork: false,
    qualificationAutoConnect: true,
    unclaimedTalentRadar: false,
  });

  const [bountiesList, setBountiesList] = useState(MOCK_BOUNTIES);
  const [selectedBounty, setSelectedBounty] = useState<SkillBounty | null>(null);
  const [submitPrModalOpen, setSubmitPrModalOpen] = useState(false);
  const [selectedRadarItem, setSelectedRadarItem] = useState<RadarOpportunity | null>(null);
  const [connectedUserIds, setConnectedUserIds] = useState<number[]>([401, 403]);

  // Live digital clock
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

  const toggleFeature = (key: keyof typeof toggles) => {
    setToggles(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(`${key} is now ${updated[key] ? 'Enabled' : 'Paused'}`);
      return updated;
    });
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

  // Nav icons (matching VisionOS detached left capsule)
  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutGrid },
    { id: 'time-machine' as ActiveTab, label: 'Career Time Machine', icon: History },
    { id: 'bounties' as ActiveTab, label: 'Skill Bounty Network', icon: Trophy },
    { id: 'auto-connect' as ActiveTab, label: 'Qualification Auto Connect', icon: ShieldCheck },
    { id: 'radar' as ActiveTab, label: 'Unclaimed Talent Radar', icon: Radio },
    { id: 'community' as ActiveTab, label: 'Community Feed', icon: Users },
  ];

  return (
    <div className="relative w-full min-h-screen text-white font-sans overflow-x-hidden select-none bg-[#111215]">
      {/* ═══════════════════════════════════════════════════════════════
          PHOTOREALISTIC VISIONOS INTERIOR BACKGROUND
          Matches Image 1: floating glass console inside a penthouse studio
          ═══════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/visionos_interior_bg.jpg"
          alt="Architectural Penthouse Interior"
          fill
          priority
          className="object-cover object-center filter brightness-[0.75] contrast-[1.05]"
        />
        {/* Soft frosted vignette overlay to ensure glass pops clearly */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/35 backdrop-blur-[2px]" />
      </div>

      {/* ─── Toast Notification ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-8 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/60 border border-white/25 text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-[#E25C38] animate-ping" />
            <span className="text-xs font-medium tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          OUTER WRAPPER: FLOATING VISIONOS CONSOLE & DETACHED LEFT DOCK
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center p-3 sm:p-6 lg:p-10">
        
        {/* ─── DETACHED LEFT FLOATING PILL DOCK (1:1 with Image 1) ─── */}
        <aside className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-4 py-5 px-3 rounded-full bg-black/45 border border-white/20 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          {/* Top Brand Home Link */}
          <Link
            href="/"
            title="Return to Landing Page"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
          >
            <div className="w-4 h-4 text-[#E25C38] font-black flex items-center justify-center">
              ●
            </div>
          </Link>

          <div className="w-6 h-[1px] bg-white/15 my-1" />

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
                    ? 'bg-white/25 text-white border border-white/35 shadow-lg scale-110'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E25C38]' : ''}`} />
                {/* Floating Tooltip */}
                <span className="absolute left-14 px-3 py-1.5 rounded-xl bg-black/75 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/15 shadow-2xl backdrop-blur-xl">
                  {item.label}
                </span>
              </button>
            );
          })}

          <div className="w-6 h-[1px] bg-white/15 my-1" />

          {/* User Profile Avatar with Ring */}
          <div className="w-10 h-10 rounded-full p-0.5 border border-white/30 bg-black/40 overflow-hidden shadow-inner flex items-center justify-center">
            <span className="text-[11px] font-bold text-zinc-200">IIITD</span>
          </div>
        </aside>

        {/* ─── MAIN VISIONOS FROSTED GLASS CONSOLE (1:1 with Image 1) ─── */}
        <div className="w-full max-w-[1360px] md:pl-16">
          <div className="relative rounded-[36px] bg-black/35 border border-white/25 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] p-5 sm:p-8 lg:p-10 overflow-hidden">
            
            {/* Top Navigation Strip */}
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 group">
                  <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#E25C38] transition-colors">
                    KIN OS
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-300">
                    Spatial Relay
                  </span>
                </Link>
              </div>

              {/* View Title */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-[#E25C38] animate-pulse" />
                <span>
                  {activeTab === 'overview' && 'Intelligence Overview'}
                  {activeTab === 'time-machine' && 'Career Time Machine'}
                  {activeTab === 'bounties' && 'Skill Bounty Network'}
                  {activeTab === 'auto-connect' && 'Qualification Auto-Connect'}
                  {activeTab === 'radar' && 'Unclaimed Talent Radar'}
                  {activeTab === 'community' && 'Community Feed'}
                </span>
              </div>

              {/* Exit/Return Link */}
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-zinc-200 border border-white/15 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit</span>
              </Link>
            </div>

            {/* ═════════════════════════════════════════════════════════
                TAB 1: MAIN VISIONOS DASHBOARD (EXACT REPLICA OF IMAGE 1)
                ═════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* ─── LEFT + CENTER BENTO CARDS (8 cols) ─── */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* TOP ROW: Hardware/Pipeline Card + Power Consumption Bar Chart */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                    
                    {/* 1. Device / Pipeline Telemetry Card (7 cols) (Image 1 top-left) */}
                    <div className="sm:col-span-7 rounded-3xl p-6 bg-white/[0.08] hover:bg-white/[0.11] border border-white/20 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.25)] flex flex-col justify-between transition-all">
                      <div>
                        {/* Header: Device tag + 4-dot menu */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Device / Pipeline</span>
                            <h3 className="text-sm sm:text-base font-bold text-white truncate">
                              Campus AST Verified Compiler Lamp
                            </h3>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-zinc-300">
                            ::
                          </div>
                        </div>

                        {/* Middle: 3D hardware asset + Stats block */}
                        <div className="flex items-center gap-5 my-3">
                          {/* 3D Item Render (replaces lamp with clean hardware artifact) */}
                          <div className="w-20 h-20 rounded-2xl bg-black/40 border border-white/15 p-1 relative flex items-center justify-center shrink-0 shadow-lg">
                            <Image
                              src="/images/bounty_3d_token.jpg"
                              alt="AST Telemetry Node"
                              fill
                              className="object-contain p-1.5"
                            />
                          </div>

                          {/* Stat Split Block: 4H 20M Time Usage | 72 W Energy */}
                          <div className="flex-1 rounded-2xl bg-black/30 border border-white/10 p-3.5 flex items-center justify-around text-center">
                            <div>
                              <div className="text-base sm:text-lg font-black text-white tracking-tight">4 H 20 M</div>
                              <div className="text-[10px] text-zinc-400">Time Usage</div>
                            </div>
                            <div className="w-[1px] h-7 bg-white/15" />
                            <div>
                              <div className="text-base sm:text-lg font-black text-white tracking-tight">72 W</div>
                              <div className="text-[10px] text-zinc-400">AST Energy</div>
                            </div>
                          </div>
                        </div>

                        {/* On from / Off at selector pills */}
                        <div className="grid grid-cols-2 gap-3 my-3">
                          <div className="rounded-xl bg-black/25 border border-white/10 p-2.5">
                            <span className="text-[9px] text-zinc-400 block">On from</span>
                            <span className="text-xs font-bold text-white">06:00 PM ▾</span>
                          </div>
                          <div className="rounded-xl bg-black/25 border border-white/10 p-2.5">
                            <span className="text-[9px] text-zinc-400 block">Off at</span>
                            <span className="text-xs font-bold text-white">05:00 AM ▾</span>
                          </div>
                        </div>
                      </div>

                      {/* Smooth Slider Bar with Sun Icon */}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-zinc-200 shrink-0">
                          <Sun className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sliderValue}
                          onChange={(e) => setSliderValue(Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none bg-white/20 cursor-pointer accent-[#E25C38]"
                        />
                      </div>
                    </div>

                    {/* 2. Power Consumption (kWh) Bar Chart (5 cols) (Image 1 top-middle) */}
                    <div className="sm:col-span-5 rounded-3xl p-6 bg-white/[0.08] hover:bg-white/[0.11] border border-white/20 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.25)] flex flex-col justify-between transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white">Power Consumption</h4>
                          <span className="text-[10px] text-zinc-400 font-mono">(kWh)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
                          169 kWh
                        </span>
                      </div>

                      {/* Vertical rounded bar chart */}
                      <div className="flex items-end justify-between h-40 pt-4 pb-1 px-1">
                        {[
                          { m: 'Jan', h: 45, hl: false },
                          { m: 'Feb', h: 65, hl: false },
                          { m: 'Mar', h: 95, hl: true },
                          { m: 'Apr', h: 50, hl: false },
                          { m: 'May', h: 75, hl: false },
                          { m: 'Jun', h: 60, hl: false },
                        ].map((b) => (
                          <div key={b.m} className="flex flex-col items-center gap-1.5 flex-1">
                            <div className="w-full flex justify-center h-28 items-end">
                              <div
                                style={{ height: `${b.h}%` }}
                                className={`w-4 sm:w-5 rounded-full transition-all duration-300 ${
                                  b.hl
                                    ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.7)]'
                                    : 'bg-white/20 hover:bg-white/35'
                                }`}
                              />
                            </div>
                            <span className={`text-[9px] font-mono ${b.hl ? 'text-cyan-400 font-bold' : 'text-zinc-400'}`}>
                              {b.m}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[10px] text-zinc-400 text-center pt-1 border-t border-white/10">
                        Peak campus verification load: March
                      </div>
                    </div>
                  </div>

                  {/* MIDDLE ROW: 3 Metric Sensor Cards (Image 1 middle) */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-2xl p-4 bg-white/[0.08] border border-white/15 backdrop-blur-xl">
                      <span className="text-[10px] text-zinc-400 block mb-1">Current Consumption</span>
                      <div className="text-xl sm:text-2xl font-black text-white">1,5 kWh</div>
                    </div>
                    <div className="rounded-2xl p-4 bg-white/[0.08] border border-white/15 backdrop-blur-xl">
                      <span className="text-[10px] text-zinc-400 block mb-1">Humidity</span>
                      <div className="text-xl sm:text-2xl font-black text-white">48,2 %</div>
                    </div>
                    <div className="rounded-2xl p-4 bg-white/[0.08] border border-white/15 backdrop-blur-xl">
                      <span className="text-[10px] text-zinc-400 block mb-1">Temperature</span>
                      <div className="text-xl sm:text-2xl font-black text-white">68° F</div>
                    </div>
                  </div>

                  {/* BOTTOM ROW: 4 Feature Switch Bento Cards (Image 1 bottom) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Card 1: Career Time Machine */}
                    <div 
                      onClick={() => toggleFeature('careerTimeMachine')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        toggles.careerTimeMachine 
                          ? 'bg-white/[0.14] border-white/30 shadow-lg' 
                          : 'bg-white/[0.05] border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <History className="w-4 h-4 text-[#E25C38]" />
                        <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${toggles.careerTimeMachine ? 'bg-cyan-500' : 'bg-zinc-700'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${toggles.careerTimeMachine ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400">Deterministic Engine</div>
                      <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">Career Time Machine</div>
                    </div>

                    {/* Card 2: Skill Bounty Network */}
                    <div 
                      onClick={() => toggleFeature('skillBountyNetwork')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        toggles.skillBountyNetwork 
                          ? 'bg-white/[0.14] border-white/30 shadow-lg' 
                          : 'bg-white/[0.05] border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${toggles.skillBountyNetwork ? 'bg-cyan-500' : 'bg-zinc-700'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${toggles.skillBountyNetwork ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400">AST Escrow</div>
                      <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">Skill Bounty Network</div>
                    </div>

                    {/* Card 3: Qualification Auto-Connection */}
                    <div 
                      onClick={() => toggleFeature('qualificationAutoConnect')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        toggles.qualificationAutoConnect 
                          ? 'bg-white/[0.14] border-white/30 shadow-lg' 
                          : 'bg-white/[0.05] border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${toggles.qualificationAutoConnect ? 'bg-cyan-500' : 'bg-zinc-700'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${toggles.qualificationAutoConnect ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400">Deterministic Match</div>
                      <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">Auto Connection</div>
                    </div>

                    {/* Card 4: Unclaimed Talent Radar */}
                    <div 
                      onClick={() => toggleFeature('unclaimedTalentRadar')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        toggles.unclaimedTalentRadar 
                          ? 'bg-white/[0.14] border-white/30 shadow-lg' 
                          : 'bg-white/[0.05] border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Radio className="w-4 h-4 text-purple-400" />
                        <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${toggles.unclaimedTalentRadar ? 'bg-cyan-500' : 'bg-zinc-700'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${toggles.unclaimedTalentRadar ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400">Transferable Bridge</div>
                      <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">Talent Radar</div>
                    </div>
                  </div>
                </div>

                {/* ─── RIGHT COLUMN CARD: DIAL GAUGE & MEDIA PLAYER (4 cols) (Image 1 right) ─── */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Thermostat / Qualification Score Radial Dial Card */}
                  <div className="rounded-3xl p-6 bg-white/[0.08] hover:bg-white/[0.11] border border-white/20 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.25)] flex flex-col justify-between transition-all">
                    {/* Header with Digital Clock & Toggle */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-black text-white font-mono tracking-tight">{currentTime}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-300">Thermostat</span>
                        <button
                          onClick={() => setThermostatOn(!thermostatOn)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors ${thermostatOn ? 'bg-cyan-500' : 'bg-zinc-700'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${thermostatOn ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Circular Arc Dial with 64° in Center */}
                    <div className="relative w-48 h-48 mx-auto my-3 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="7"
                        />
                        {/* Active blue arc */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#22d3ee"
                          strokeWidth="7"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * dialScore) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Center Reading: 64° (° Fahrenheit) */}
                      <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-black text-white tracking-tight">{dialScore}°</span>
                        <span className="text-[11px] text-zinc-300 font-medium">(° Fahrenheit)</span>
                      </div>
                    </div>

                    {/* Minus / Plus Buttons */}
                    <div className="flex items-center justify-center gap-3 my-2">
                      <button
                        onClick={() => setDialScore(Math.max(40, dialScore - 2))}
                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-sm font-bold shadow"
                      >
                        -
                      </button>
                      <button
                        onClick={() => setDialScore(Math.min(99, dialScore + 2))}
                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-sm font-bold shadow"
                      >
                        +
                      </button>
                    </div>

                    {/* Mode selector pills (Hot, Eco, Fan, Cold) */}
                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10">
                      {[
                        { label: 'Hot', icon: Flame },
                        { label: 'Eco', icon: Leaf },
                        { label: 'Fan', icon: Wind },
                        { label: 'Cold', icon: Snowflake },
                      ].map((m) => {
                        const IconComponent = m.icon;
                        const isSelected = activeDialMode === m.label;
                        return (
                          <button
                            key={m.label}
                            onClick={() => {
                              setActiveDialMode(m.label as any);
                              showToast(`Mode switched to: ${m.label}`);
                            }}
                            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] font-semibold transition-all ${
                              isSelected
                                ? 'bg-white/25 text-white border border-white/35 shadow-md'
                                : 'bg-black/20 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Media / Activity Player (Ericdoa x Valorant - Greater Than One) */}
                  <div className="rounded-3xl p-5 bg-white/[0.08] hover:bg-white/[0.11] border border-white/20 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.25)] flex flex-col justify-between transition-all">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Spatial Audio Feed</div>
                      <h4 className="text-sm font-bold text-white truncate mt-0.5">Greater Than One</h4>
                      <div className="text-xs text-zinc-300">Ericdoa x Valorant</div>
                    </div>

                    {/* Scrub bar */}
                    <div className="my-3">
                      <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                        <div className="w-2/5 h-full bg-[#E25C38] rounded-full" />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400 mt-1">
                        <span>0:34</span>
                        <span>2:27</span>
                      </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-between text-zinc-300">
                      <button className="hover:text-white transition-colors">
                        <Repeat className="w-3.5 h-3.5" />
                      </button>
                      <button className="hover:text-white transition-colors">
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                        className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <button className="hover:text-white transition-colors">
                        <SkipForward className="w-4 h-4" />
                      </button>
                      <button className="hover:text-white transition-colors">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════
                TAB 2: CAREER TIME MACHINE DETAILED WORKSPACE
                ═════════════════════════════════════════════════════════ */}
            {activeTab === 'time-machine' && (
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.08] border border-white/20 backdrop-blur-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E25C38]/20 border border-[#E25C38]/40 text-xs font-semibold text-[#E25C38] mb-2">
                        <History className="w-3.5 h-3.5" />
                        <span>Feature 1</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">Career Time Machine</h2>
                      <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                        Replay verified alumni journeys, compare historical milestones, and deterministically identify skill gaps.
                      </p>
                    </div>
                    <button
                      onClick={() => showToast('Simulating career jump: Staff Systems Lead')}
                      className="px-5 py-2.5 rounded-full bg-[#E25C38] hover:bg-[#d04e2e] text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 self-start"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Simulate Next Leap</span>
                    </button>
                  </div>

                  {/* Skill Gap Analysis Bento */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-2xl p-5 bg-black/30 border border-white/10">
                      <div className="text-xs text-zinc-400">Target Role</div>
                      <div className="text-lg font-bold text-white mt-1">{MOCK_SKILL_GAP.targetRole}</div>
                      <div className="text-3xl font-black text-[#E25C38] mt-3">{MOCK_SKILL_GAP.readinessScore}%</div>
                      <div className="text-[11px] text-emerald-400 mt-0.5">Empirical Match from 14 Alumni</div>
                    </div>
                    <div className="sm:col-span-2 rounded-2xl p-5 bg-black/30 border border-white/10">
                      <div className="text-xs text-zinc-400 mb-3">Priority Missing Skills to Bridge</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {MOCK_SKILL_GAP.missingSkills.map((sk) => (
                          <div key={sk.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                            <span className="text-xs font-semibold text-white">{sk.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E25C38]/20 text-[#E25C38]">
                              {sk.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Milestones List */}
                  <div className="space-y-3">
                    {MOCK_CAREER_MILESTONES.map((m, i) => (
                      <div key={m.id} className="p-4 rounded-2xl bg-black/25 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-xl bg-[#E25C38]/20 border border-[#E25C38]/40 flex items-center justify-center text-xs font-bold text-[#E25C38] shrink-0">
                            0{i + 1}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-white">{m.role}</div>
                            <div className="text-xs text-zinc-400">{m.company} • {m.period}</div>
                            <div className="text-xs text-zinc-300 italic mt-1.5">“{m.keyAchievement}”</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono text-emerald-400 font-semibold">{m.verifiedBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════
                TAB 3: SKILL BOUNTY NETWORK WORKSPACE
                ═════════════════════════════════════════════════════════ */}
            {activeTab === 'bounties' && (
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.08] border border-white/20 backdrop-blur-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-semibold text-amber-300 mb-2">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Feature 2</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">Skill Bounty Network</h2>
                      <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                        Solve real-world challenges posted by alumni & founders. Evaluated deterministically with AST code suites.
                      </p>
                    </div>
                    <button
                      onClick={() => showToast('Opening Bounty Post Creator')}
                      className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-lg transition-all flex items-center gap-2 self-start"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post Bounty</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bountiesList.map((b) => (
                      <div key={b.id} className="p-5 rounded-2xl bg-black/30 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-400">{b.organization}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                              {b.difficulty}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-2">{b.title}</h4>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {b.requiredSkills.map((sk) => (
                              <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-zinc-400 block">Reward</span>
                            <span className="text-base font-black text-white">${b.rewardUsdc} USDC</span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedBounty(b);
                              setSubmitPrModalOpen(true);
                            }}
                            className="px-4 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all"
                          >
                            Submit PR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════
                TAB 4: QUALIFICATION AUTO-CONNECT WORKSPACE
                ═════════════════════════════════════════════════════════ */}
            {activeTab === 'auto-connect' && (
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.08] border border-white/20 backdrop-blur-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold text-emerald-300 mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Feature 3</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">Qualification-Based Auto Connection</h2>
                      <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                        Define automated connection criteria: AST commit thresholds, verified repositories, and institution whitelists.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {MOCK_POLICIES.map((pol) => (
                      <div key={pol.id} className="p-5 rounded-2xl bg-black/30 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-white">{pol.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              pol.autoAccept ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-300'
                            }`}>
                              {pol.autoAccept ? 'Auto-Accept ON' : 'Manual Review'}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 flex flex-wrap gap-4 mt-2">
                            <span>Min Commits: <strong className="text-white">{pol.minCommits}</strong></span>
                            <span>Score Cutoff: <strong className="text-cyan-400">{pol.qualificationScoreThreshold}%</strong></span>
                            <span>Pending Handshakes: <strong className="text-amber-300">{pol.activeRequestsCount}</strong></span>
                          </div>
                        </div>
                        <button
                          onClick={() => showToast(`Policy criteria re-evaluated for ${pol.name}`)}
                          className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold text-white transition-all self-start"
                        >
                          Evaluate Policy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════
                TAB 5: UNCLAIMED TALENT RADAR WORKSPACE
                ═════════════════════════════════════════════════════════ */}
            {activeTab === 'radar' && (
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.08] border border-white/20 backdrop-blur-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-xs font-semibold text-purple-300 mb-2">
                        <Radio className="w-3.5 h-3.5" />
                        <span>Feature 4</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">Unclaimed Talent Radar</h2>
                      <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                        Discover cross-industry high-impact opportunities outside your primary sector where skills bridge.
                      </p>
                    </div>
                    <button
                      onClick={() => showToast('Deep Radar sweep complete: 3 cross-industry bridges identified')}
                      className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 self-start"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Sweep Radar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {MOCK_RADAR_OPPORTUNITIES.map((opp) => (
                      <div key={opp.id} className="p-5 rounded-2xl bg-black/30 border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-purple-400">{opp.industry}</span>
                            <span className="text-xs font-mono font-bold text-white">{opp.matchScore}% Match</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1">{opp.title}</h4>
                          <div className="text-xs text-zinc-400 mb-2">{opp.organization}</div>
                          <p className="text-xs text-zinc-300 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.05] mb-3">
                            {opp.reasoning}
                          </p>
                        </div>
                        <button
                          onClick={() => showToast(`1-Tap Bridge sent to ${opp.organization}`)}
                          className="w-full py-2 rounded-xl bg-purple-500/25 hover:bg-purple-500 text-purple-200 hover:text-white text-xs font-bold border border-purple-500/30 transition-all"
                        >
                          Express Interest
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════
                TAB 6: COMMUNITY PAGE / SOCIAL MEDIA WORKSPACE
                ═════════════════════════════════════════════════════════ */}
            {activeTab === 'community' && (
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.08] border border-white/20 backdrop-blur-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-xs font-semibold text-blue-300 mb-2">
                        <Users className="w-3.5 h-3.5" />
                        <span>Feature 5</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">Community & Social Network</h2>
                      <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                        Connect with verified peers, alumni mentors, and founders without resume friction.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 max-w-2xl mx-auto">
                    {MOCK_SOCIAL_FEED.map((post) => (
                      <div key={post.id} className="p-5 rounded-2xl bg-black/30 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-sm font-bold text-white">{post.author.name}</span>
                            <div className="text-xs text-zinc-400">{post.author.role}</div>
                          </div>
                          <button
                            onClick={() => handleConnectToggle(post.id, post.author.name)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              connectedUserIds.includes(post.id)
                                ? 'bg-white/10 text-zinc-300'
                                : 'bg-white text-black hover:bg-zinc-200'
                            }`}
                          >
                            {connectedUserIds.includes(post.id) ? 'Connected' : '1-Tap Connect'}
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed mb-3">{post.content}</p>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/10">
                          <span>{post.timestamp}</span>
                          <span>{post.mutualConnections} mutual alumni vouches</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════
                FLOATING BOTTOM CAPSULE SELECTOR PILL (1:1 with Image 1)
                Pills: Living Room, Bedroom, Kitchen, Backyard, Garage | +
                Here: Overview, Time Machine, Skill Bounties, Auto Connect, Talent Radar, Community | +
                ═════════════════════════════════════════════════════════ */}
            <div className="mt-8 pt-4 flex justify-center">
              <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/55 border border-white/25 backdrop-blur-3xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-x-auto max-w-full">
                {[
                  { id: 'overview' as ActiveTab, label: 'Overview' },
                  { id: 'time-machine' as ActiveTab, label: 'Time Machine' },
                  { id: 'bounties' as ActiveTab, label: 'Skill Bounties' },
                  { id: 'auto-connect' as ActiveTab, label: 'Auto Connect' },
                  { id: 'radar' as ActiveTab, label: 'Talent Radar' },
                  { id: 'community' as ActiveTab, label: 'Community' },
                ].map((pill) => {
                  const isSelected = activeTab === pill.id;
                  return (
                    <button
                      key={pill.id}
                      onClick={() => setActiveTab(pill.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-white text-black shadow-md font-bold scale-105'
                          : 'text-zinc-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
                <div className="w-[1px] h-4 bg-white/20 mx-1" />
                <button
                  onClick={() => showToast('Triggered Quick AST Verification')}
                  className="w-7 h-7 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center font-bold shadow transition-transform hover:scale-110"
                  title="Quick Action"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Submit PR Modal ─── */}
      <AnimatePresence>
        {submitPrModalOpen && selectedBounty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full rounded-3xl bg-black/80 border border-white/25 p-6 shadow-2xl backdrop-blur-3xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-cyan-400">AST PR Verification</span>
                <button onClick={() => setSubmitPrModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{selectedBounty.title}</h3>
              <p className="text-xs text-zinc-300 mb-4">
                Enter your Pull Request link. The automated AST runner will evaluate test coverage deterministically.
              </p>
              <input
                type="text"
                placeholder="https://github.com/org/repo/pull/42"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-cyan-400 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSubmitPrModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSubmitPrModalOpen(false);
                    showToast(`PR queued for AST verification on ${selectedBounty.title}`);
                  }}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
