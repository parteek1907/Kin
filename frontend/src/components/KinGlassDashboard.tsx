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
  ArrowLeft,
  ChevronRight,
  User,
  LogOut,
  UserPlus,
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Heart,
  Share2,
  SlidersHorizontal,
  Plus,
  GitPullRequest,
  Check,
  Activity,
  Layers
} from 'lucide-react';
import {
  MOCK_CAREER_MILESTONES,
  MOCK_SKILL_GAP,
  MOCK_BOUNTIES,
  MOCK_POLICIES,
  MOCK_RADAR_OPPORTUNITIES,
  MOCK_SOCIAL_FEED,
  SkillBounty,
  SocialFeedItem,
  AutoConnectionPolicy
} from '@/services/dashboardService';
import { useAuth } from '@/context/AuthContext';

type ActiveTab = 'overview' | 'time-machine' | 'bounties' | 'auto-connect' | 'radar' | 'community';

export default function KinGlassDashboard() {
  const { user, isLoggedIn, userInitial, openAuthModal, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentTime, setCurrentTime] = useState('10:02 PM');
  const [autoAcceptThreshold, setAutoAcceptThreshold] = useState(64);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Modal and Interactive States
  const [selectedBounty, setSelectedBounty] = useState<SkillBounty | null>(null);
  const [submitPrModalOpen, setSubmitPrModalOpen] = useState(false);
  const [prUrlInput, setPrUrlInput] = useState('');

  // Career Time Machine State
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(1);
  const [targetReadinessScore, setTargetReadinessScore] = useState(MOCK_SKILL_GAP.readinessScore);

  // Auto-Connect Policies State
  const [policies, setPolicies] = useState<AutoConnectionPolicy[]>(MOCK_POLICIES);

  // Community Feed State
  const [socialFeed, setSocialFeed] = useState<SocialFeedItem[]>(MOCK_SOCIAL_FEED);
  const [newPostContent, setNewPostContent] = useState('');

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

  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutGrid },
    { id: 'time-machine' as ActiveTab, label: 'Career Time Machine', icon: History },
    { id: 'bounties' as ActiveTab, label: 'Skill Bounty Network', icon: Trophy },
    { id: 'auto-connect' as ActiveTab, label: 'Qualification Auto-Connect', icon: ShieldCheck },
    { id: 'radar' as ActiveTab, label: 'Unclaimed Talent Radar', icon: Radio },
    { id: 'community' as ActiveTab, label: 'Community Feed', icon: Users },
  ];

  const handleTogglePolicy = (policyId: number) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id === policyId) {
          const nextVal = !p.autoAccept;
          showToast(`Policy "${p.name}" Auto-Accept: ${nextVal ? 'ENABLED' : 'PAUSED'}`);
          return { ...p, autoAccept: nextVal };
        }
        return p;
      })
    );
  };

  const handleLikePost = (postId: number) => {
    setSocialFeed((prev) =>
      prev.map((item) => {
        if (item.id === postId) {
          return { ...item, likes: item.likes + 1 };
        }
        return item;
      })
    );
    showToast('Endorsement recorded');
  };

  const handleConnectUser = (postId: number, authorName: string) => {
    setSocialFeed((prev) =>
      prev.map((item) => {
        if (item.id === postId) {
          const nextConnected = !item.connected;
          showToast(nextConnected ? `1-Tap Handshake connected with ${authorName}` : `Disconnected from ${authorName}`);
          return { ...item, connected: nextConnected };
        }
        return item;
      })
    );
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: SocialFeedItem = {
      id: Date.now(),
      author: {
        name: user?.name || 'Verified Builder',
        role: 'Systems Engineer',
        institution: 'KIN Network',
        avatar: '/images/hero_builder_avatar.jpg',
        verified: true,
      },
      content: newPostContent.trim(),
      timestamp: 'Just now',
      mutualConnections: 1,
      tags: ['#ASTVerified', '#ProofOfWork', '#KIN'],
      likes: 1,
      connected: true,
    };

    setSocialFeed([newPost, ...socialFeed]);
    setNewPostContent('');
    showToast('Update published to KIN Network');
  };

  return (
    <div className="relative w-full min-h-screen font-sans text-slate-900 selection:bg-[#E25C38]/20 selection:text-[#E25C38] overflow-x-hidden pb-28">
      {/* ═══════════════════════════════════════════════════════════════
          NATURAL DAYLIGHT MODERN LIVING ROOM BACKGROUND (VisionOS Style)
          Soft daylight, crisp minimalist architecture, panoramic windows
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
          MAIN CANVAS: LIGHT GRAY TRANSPARENT GLASS
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full min-h-screen p-3 sm:p-5 lg:p-8 flex flex-col items-center">
        
        {/* ─── TOP MINIMAL HEADER BAR (Removed "Campus Intelligence" tagline) ─── */}
        <header className="w-full max-w-[1320px] mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tight text-slate-900">KIN</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Login / User Indicator in Header */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 hover:bg-white border border-white/80 shadow-sm text-xs font-bold text-slate-800 transition-all cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-black">
                    {userInitial}
                  </span>
                  <span className="hidden sm:inline">{user?.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-11 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xl w-48 text-xs z-50">
                    <span className="font-bold text-slate-900 truncate block">{user?.name}</span>
                    <span className="text-[10px] text-slate-500 truncate block mb-2">{user?.email}</span>
                    <div className="w-full h-[1px] bg-slate-100 my-1.5" />
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        showToast('Signed out successfully');
                      }}
                      className="w-full py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 font-semibold transition-colors text-left px-2 text-slate-600 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#E25C38]" />
                <span>Get started</span>
              </button>
            )}

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
            THE UNIFIED FLOATING VISIONOS GLASS WINDOW
            Clean, light-gray/transparent frosted glass panel
            ═══════════════════════════════════════════════════════════════ */}
        <main className="w-full max-w-[1320px]">
          <div className="rounded-[36px] bg-white/45 hover:bg-white/50 border border-white/70 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.07),_inset_0_1.5px_2px_rgba(255,255,255,0.85)] p-6 sm:p-8 transition-all min-h-[580px]">
            
            <AnimatePresence mode="wait">
              {/* ─────────────────────────────────────────────────────────────
                  TAB 1: OVERVIEW (Master Cockpit - No gaps, no fake player)
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  {/* Left Column (8 cols): Hero + Chart + 3 Metric Tiles (Tightly packed with gap-5) */}
                  <div className="lg:col-span-8 flex flex-col gap-5">
                    
                    {/* Top Row: Career Time Machine Hero (7 cols) + Skill Velocity Chart (5 cols) */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                      
                      {/* Hero Card: Career Time Machine */}
                      <div className="sm:col-span-7 rounded-3xl p-6 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-[0_10px_25px_rgba(0,0,0,0.04),_inset_0_1px_1.5px_rgba(255,255,255,0.8)] flex flex-col justify-between transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Career Time Machine
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-800">
                              {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].period}
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].role}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].company}
                          </p>

                          {/* Stat Metrics Box */}
                          <div className="rounded-2xl p-4 bg-white/40 border border-white/60 my-4 flex items-center justify-between shadow-sm">
                            <div>
                              <div className="text-lg font-black text-slate-900">
                                {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].duration}
                              </div>
                              <div className="text-[11px] text-slate-600 font-medium">Trajectory Span</div>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-300/60" />
                            <div>
                              <div className="text-lg font-black text-[#E25C38]">
                                {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].velocityScore}% Match
                              </div>
                              <div className="text-[11px] text-slate-600 font-medium">Empirical Fit</div>
                            </div>
                          </div>

                          {/* Timeline Scrubber */}
                          <div className="my-2">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-2">
                              <span>Timeline Stage</span>
                              <span>Stage {selectedMilestoneIndex + 1} of {MOCK_CAREER_MILESTONES.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {MOCK_CAREER_MILESTONES.map((m, idx) => (
                                <button
                                  key={m.id}
                                  onClick={() => setSelectedMilestoneIndex(idx)}
                                  className={`flex-1 h-2.5 rounded-full transition-all cursor-pointer ${
                                    selectedMilestoneIndex === idx
                                      ? 'bg-[#E25C38] shadow-sm'
                                      : selectedMilestoneIndex > idx
                                      ? 'bg-slate-400/80'
                                      : 'bg-slate-200/80 hover:bg-slate-300'
                                  }`}
                                  title={m.role}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-300/40 flex items-center justify-between text-xs text-slate-600 mt-3">
                          <span>Alumni: <strong className="text-slate-900">Dr. Aarav Sharma</strong> (Anthropic)</span>
                          <button
                            onClick={() => {
                              setActiveTab('time-machine');
                              showToast('Switched to Career Time Machine');
                            }}
                            className="font-bold text-slate-900 hover:text-[#E25C38] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Full Path</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Skill Velocity Activity Chart (5 cols) */}
                      <div className="sm:col-span-5 rounded-3xl p-6 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-[0_10px_25px_rgba(0,0,0,0.04),_inset_0_1px_1.5px_rgba(255,255,255,0.8)] flex flex-col justify-between transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Skill Velocity
                              </span>
                              <span className="text-xs font-bold text-slate-800">AST Commits</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#0284c7] px-2.5 py-0.5 rounded-full bg-sky-100/70 border border-sky-300 shadow-sm">
                              169 Peak
                            </span>
                          </div>

                          {/* Bar Chart */}
                          <div className="flex items-end justify-between h-32 pt-2 px-2">
                            {[
                              { month: 'Jan', value: 55, active: false },
                              { month: 'Feb', value: 75, active: false },
                              { month: 'Mar', value: 100, active: true },
                              { month: 'Apr', value: 65, active: false },
                              { month: 'May', value: 85, active: false },
                              { month: 'Jun', value: 70, active: false },
                            ].map((bar) => (
                              <div key={bar.month} className="flex flex-col items-center gap-2 flex-1">
                                <div className="w-full h-24 flex items-end justify-center">
                                  <div
                                    style={{ height: `${bar.value}%` }}
                                    className={`w-3.5 sm:w-4 rounded-full transition-all ${
                                      bar.active
                                        ? 'bg-[#0284c7] shadow-sm'
                                        : 'bg-slate-300/80 hover:bg-slate-400'
                                    }`}
                                  />
                                </div>
                                <span className="text-[11px] text-slate-600 font-semibold">{bar.month}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-300/40 flex items-center justify-between text-xs text-slate-600 mt-3">
                          <span>Evaluated monthly</span>
                          <span className="text-emerald-700 font-bold">+28% Velocity</span>
                        </div>
                      </div>

                    </div>

                    {/* Middle Row: 3 Key Metric Tiles (Naturally fitted with gap-5) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div
                        onClick={() => {
                          setActiveTab('community');
                          showToast('Switched to Community Feed');
                        }}
                        className="rounded-3xl p-5 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm transition-all cursor-pointer group"
                      >
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Verified Builders
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">76,420</div>
                        <span className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1">
                          <span>14 Active Clusters</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>

                      <div
                        onClick={() => {
                          setActiveTab('bounties');
                          showToast('Switched to Skill Bounty Network');
                        }}
                        className="rounded-3xl p-5 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm transition-all cursor-pointer group"
                      >
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Skill Bounty Escrow
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">$3,600 USDC</div>
                        <span className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                          <span>4 Open Challenges</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>

                      <div
                        onClick={() => {
                          setActiveTab('radar');
                          showToast('Switched to Unclaimed Talent Radar');
                        }}
                        className="rounded-3xl p-5 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm transition-all cursor-pointer group"
                      >
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Talent Radar Matches
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">18 Discovered</div>
                        <span className="text-xs text-purple-700 font-bold mt-1 flex items-center gap-1">
                          <span>Cross-Industry Transfer</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Right Column (4 cols): Auto-Connect Cutoff Dial & Presets (Clean, no fake music player!) */}
                  <div className="lg:col-span-4 rounded-3xl p-6 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-[0_10px_25px_rgba(0,0,0,0.04),_inset_0_1px_1.5px_rgba(255,255,255,0.8)] flex flex-col justify-between transition-all">
                    <div>
                      {/* Top Header: Clock + Dial Toggle */}
                      <div className="flex items-center justify-between mb-2">
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

                      {/* Circular Arc Dial (64% Cutoff Dial) */}
                      <div className="relative w-44 h-44 mx-auto my-3 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="39"
                            fill="none"
                            stroke="rgba(203, 213, 225, 0.45)"
                            strokeWidth="7"
                          />
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

                        <div className="absolute flex flex-col items-center">
                          <span className="text-4xl font-black text-slate-900 tracking-tight">
                            {autoAcceptThreshold}%
                          </span>
                          <span className="text-xs text-slate-600 font-semibold mt-0.5">
                            Cutoff Score
                          </span>
                        </div>
                      </div>

                      {/* Minus & Plus Buttons */}
                      <div className="flex items-center justify-center gap-3 my-2">
                        <button
                          onClick={() => setAutoAcceptThreshold(Math.max(40, autoAcceptThreshold - 2))}
                          className="w-9 h-9 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center text-base font-bold shadow-sm transition-all cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          onClick={() => setAutoAcceptThreshold(Math.min(98, autoAcceptThreshold + 2))}
                          className="w-9 h-9 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center text-base font-bold shadow-sm transition-all cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* 4 Mode Presets (Strict / Alumni / OSS / Open) */}
                      <div className="grid grid-cols-4 gap-2 my-3 pt-3 border-t border-slate-300/40">
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
                            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

                    {/* Clean Status Footer (No fake music player!) */}
                    <div className="pt-3 border-t border-slate-300/40 mt-2">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                        <span>AST Policy Filter</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('auto-connect');
                          showToast('Switched to Auto-Connect Policies');
                        }}
                        className="w-full py-2.5 px-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#E25C38]" />
                        <span>Manage Auto-Connect Policies</span>
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 2: CAREER TIME MACHINE
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'time-machine' && (
                <motion.div
                  key="time-machine"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/40 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Career Time Machine</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Backtested empirical trajectories and AST-verified skill progression benchmarks
                      </p>
                    </div>
                    {/* Stage Selector Pills */}
                    <div className="flex items-center gap-2">
                      {MOCK_CAREER_MILESTONES.map((m, idx) => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMilestoneIndex(idx)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            selectedMilestoneIndex === idx
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-white/60 text-slate-700 hover:bg-white'
                          }`}
                        >
                          Stage {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Trajectory Details (7 cols) */}
                    <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono font-bold text-slate-600">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].period}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[#E25C38]/15 text-[#E25C38] text-xs font-bold border border-[#E25C38]/20">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].velocityScore}% Match Fit
                          </span>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900">
                          {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].role}
                        </h3>
                        <p className="text-sm font-semibold text-slate-700 mt-1">
                          {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].company} • {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].duration}
                        </p>

                        <div className="my-5 p-4 rounded-2xl bg-white/50 border border-white/70">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Key Verified Achievement
                          </span>
                          <p className="text-xs text-slate-800 leading-relaxed font-medium">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].keyAchievement}
                          </p>
                          <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified By: {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].verifiedBy}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                            Acquired Technical Skills
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].acquiredSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 rounded-full bg-white/70 border border-white/90 text-xs font-semibold text-slate-800 shadow-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-300/40 mt-6 flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">Stage {selectedMilestoneIndex + 1} of 3</span>
                        <div className="flex gap-2">
                          <button
                            disabled={selectedMilestoneIndex === 0}
                            onClick={() => setSelectedMilestoneIndex((i) => Math.max(0, i - 1))}
                            className="px-3 py-1.5 rounded-xl bg-white/60 hover:bg-white text-xs font-bold text-slate-800 disabled:opacity-40 cursor-pointer shadow-sm"
                          >
                            Previous Stage
                          </button>
                          <button
                            disabled={selectedMilestoneIndex === MOCK_CAREER_MILESTONES.length - 1}
                            onClick={() => setSelectedMilestoneIndex((i) => Math.min(MOCK_CAREER_MILESTONES.length - 1, i + 1))}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-xs font-bold text-white disabled:opacity-40 cursor-pointer shadow-sm"
                          >
                            Next Stage
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Skill Gap Analysis (5 cols) */}
                    <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            AST Skill Gap Analysis
                          </span>
                          <span className="text-xs font-bold text-[#E25C38]">{targetReadinessScore}% Ready</span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 mb-1">Target: {MOCK_SKILL_GAP.targetRole}</h4>
                        <p className="text-xs text-slate-600 mb-4">
                          Deterministic gap evaluation against 800+ AST-verified staff profiles
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden mb-5">
                          <div
                            style={{ width: `${targetReadinessScore}%` }}
                            className="h-full bg-gradient-to-r from-[#0284c7] to-[#E25C38] rounded-full transition-all"
                          />
                        </div>

                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Missing Skills Priority
                        </span>
                        <div className="flex flex-col gap-2">
                          {MOCK_SKILL_GAP.missingSkills.map((skill) => (
                            <div
                              key={skill.name}
                              className="p-2.5 rounded-xl bg-white/50 border border-white/70 flex items-center justify-between text-xs"
                            >
                              <span className="font-semibold text-slate-900">{skill.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  skill.priority === 'HIGH'
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : skill.priority === 'MEDIUM'
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {skill.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setTargetReadinessScore((s) => (s >= 90 ? 74 : s + 8));
                          showToast('Simulated AST commit verification +8% readiness');
                        }}
                        className="w-full mt-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Simulate Trajectory Shift
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 3: SKILL BOUNTY NETWORK
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'bounties' && (
                <motion.div
                  key="bounties"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/40 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Skill Bounty Network</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Open challenges verified by deterministic AST test suites with automated USDC escrow
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-sm">
                        Total Escrow: $3,600 USDC
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {MOCK_BOUNTIES.map((bounty) => (
                      <div
                        key={bounty.id}
                        className="rounded-3xl p-6 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500">{bounty.organization}</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                bounty.difficulty === 'EXPERT'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : bounty.difficulty === 'HARD'
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : bounty.difficulty === 'MEDIUM'
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {bounty.difficulty}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                            {bounty.title}
                          </h3>

                          <div className="text-2xl font-black text-[#E25C38] my-2">
                            ${bounty.rewardUsdc} USDC
                          </div>

                          <div className="flex flex-wrap gap-1.5 my-3">
                            {bounty.requiredSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2.5 py-0.5 rounded-lg bg-white/60 border border-white/80 text-[11px] font-medium text-slate-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-300/40 mt-3 flex items-center justify-between text-xs text-slate-600">
                          <span>{bounty.submissionsCount} submissions • {bounty.deadline}</span>
                          <button
                            onClick={() => {
                              setSelectedBounty(bounty);
                              setSubmitPrModalOpen(true);
                            }}
                            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Submit PR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 4: QUALIFICATION AUTO-CONNECT
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'auto-connect' && (
                <motion.div
                  key="auto-connect"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/40 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Qualification Auto-Connect</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Zero-resume, code-verified intent routing. Connect automatically when AST verification passes threshold
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Cutoff Dial Controller (5 cols) */}
                    <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-slate-800">{currentTime}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600">Auto-Accept</span>
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

                        {/* Dial */}
                        <div className="relative w-44 h-44 mx-auto my-3 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(203, 213, 225, 0.45)" strokeWidth="7" />
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

                          <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-black text-slate-900 tracking-tight">
                              {autoAcceptThreshold}%
                            </span>
                            <span className="text-xs text-slate-600 font-semibold mt-0.5">
                              Cutoff Score
                            </span>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-center gap-3 my-2">
                          <button
                            onClick={() => setAutoAcceptThreshold(Math.max(40, autoAcceptThreshold - 2))}
                            className="w-9 h-9 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center text-base font-bold shadow-sm transition-all cursor-pointer"
                          >
                            -
                          </button>
                          <button
                            onClick={() => setAutoAcceptThreshold(Math.min(98, autoAcceptThreshold + 2))}
                            className="w-9 h-9 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center text-base font-bold shadow-sm transition-all cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Presets */}
                        <div className="grid grid-cols-4 gap-2 my-3 pt-3 border-t border-slate-300/40">
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
                                showToast(`Cutoff set to ${p.l} (${p.s}%)`);
                              }}
                              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

                      <p className="text-[11px] text-slate-600 leading-relaxed pt-3 border-t border-slate-300/40">
                        Inbound handshake requests with qualification score ≥ {autoAcceptThreshold}% bypass manual vetting.
                      </p>
                    </div>

                    {/* Right: Active Policies List (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      {policies.map((policy) => (
                        <div
                          key={policy.id}
                          className="rounded-3xl p-6 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-bold text-slate-900">{policy.name}</h3>
                            <button
                              onClick={() => handleTogglePolicy(policy.id)}
                              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                                policy.autoAccept
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {policy.autoAccept ? 'Auto-Accept ON' : 'Paused'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 my-3 text-xs">
                            <div className="p-3 rounded-xl bg-white/50 border border-white/70">
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">Min Commits</span>
                              <span className="text-base font-bold text-slate-900">{policy.minCommits}+ Commits</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/50 border border-white/70">
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">Min Threshold</span>
                              <span className="text-base font-bold text-[#E25C38]">{policy.qualificationScoreThreshold}%</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-300/40 text-xs text-slate-600">
                            <span>{policy.activeRequestsCount} Inbound Handshakes Filtered</span>
                            <button
                              onClick={() => showToast(`Simulated AST check for policy "${policy.name}"`)}
                              className="font-bold text-slate-900 hover:text-[#E25C38] transition-colors cursor-pointer"
                            >
                              Test Rule →
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => showToast('Policy engine: ready to add custom rules')}
                        className="py-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 text-xs font-bold text-slate-900 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-[#E25C38]" />
                        <span>Create Custom Qualification Policy</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 5: UNCLAIMED TALENT RADAR
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'radar' && (
                <motion.div
                  key="radar"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/40 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Unclaimed Talent Radar</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Cross-industry transfer bridges. High-leverage roles where your verified skills transfer across domains
                      </p>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-300 text-purple-900 text-xs font-bold shadow-sm">
                      18 Discovered Bridges
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {MOCK_RADAR_OPPORTUNITIES.map((opp) => (
                      <div
                        key={opp.id}
                        className="rounded-3xl p-6 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500">{opp.industry}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                {opp.matchScore}% Match
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-[#E25C38]/15 text-[#E25C38] text-[11px] font-bold">
                                {opp.transferableBridgeScore}% Transfer
                              </span>
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {opp.title}
                          </h3>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5 mb-3">
                            {opp.organization}
                          </p>

                          <div className="p-3.5 rounded-2xl bg-white/50 border border-white/70 my-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Transferability Reasoning
                            </span>
                            <p className="text-xs text-slate-800 leading-relaxed">
                              {opp.reasoning}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1.5 my-2">
                            {opp.bridgeSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2.5 py-0.5 rounded-lg bg-white/60 border border-white/80 text-[11px] font-medium text-slate-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-300/40 mt-3 flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">Status: Discovered</span>
                          <button
                            onClick={() => showToast(`1-Tap Interest expressed for ${opp.title}`)}
                            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Bridge Gap & Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 6: COMMUNITY FEED & SOCIAL VOUCHES
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'community' && (
                <motion.div
                  key="community"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/40 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Community Feed</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Verified alumni updates, research breakthroughs, and peer endorsements
                      </p>
                    </div>
                  </div>

                  {/* New Post Publisher Box */}
                  <form
                    onSubmit={handlePublishPost}
                    className="rounded-3xl p-5 bg-white/40 border border-white/70 backdrop-blur-2xl shadow-sm flex flex-col gap-3"
                  >
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share a project breakthrough, benchmark, or vouch for a peer..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-white/90 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newPostContent.trim()}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold disabled:opacity-40 transition-all shadow-sm cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-[#E25C38]" />
                        <span>Publish Update</span>
                      </button>
                    </div>
                  </form>

                  {/* Feed Items */}
                  <div className="flex flex-col gap-4">
                    {socialFeed.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-3xl p-6 bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-2xl shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {post.author.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{post.author.name}</span>
                                {post.author.verified && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    Verified Alumni
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-600 block">{post.author.role} • {post.timestamp}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleConnectUser(post.id, post.author.name)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              post.connected
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-900 hover:bg-black text-white shadow-sm'
                            }`}
                          >
                            {post.connected ? 'Connected' : '1-Tap Handshake'}
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed my-3 font-normal">
                          {post.content}
                        </p>

                        <div className="flex flex-wrap gap-1.5 my-3">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 rounded-lg bg-white/60 border border-white/80 text-[11px] font-medium text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-slate-300/40 flex items-center justify-between text-xs text-slate-600">
                          <span>{post.mutualConnections} mutual vouches</span>
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />
                            <span>{post.likes}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>

        {/* ═══════════════════════════════════════════════════════════════
            HORIZONTAL LIQUID FROSTED GLASS ICON DOCK (At Bottom)
            Removed "KIN HOME" red dot button per user instruction!
            Only the 6 clean feature icons + divider + user initial circle.
            ═══════════════════════════════════════════════════════════════ */}
        <nav
          aria-label="Dashboard Navigation"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 sm:gap-3 py-2 px-4 rounded-full bg-white/45 hover:bg-white/55 border border-white/75 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1),_inset_0_1.5px_2px_rgba(255,255,255,0.9)] transition-all"
        >
          {/* The 6 Feature Icons */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  showToast(`Switched to ${item.label}`);
                }}
                className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md scale-105'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E25C38]' : ''}`} />
                {/* Floating Tooltip Above */}
                <span className="absolute -top-10 px-3 py-1.5 rounded-xl bg-white/95 text-xs font-semibold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white shadow-xl backdrop-blur-2xl">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Divider */}
          <div className="w-[1px] h-6 bg-slate-300/60" />

          {/* User Profile Avatar */}
          {isLoggedIn ? (
            <button
              onClick={() => showToast(`Logged in as ${user?.name}`)}
              title={`${user?.name} (${user?.email})`}
              className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer border border-white/80"
            >
              {userInitial}
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              title="Get started / Sign In"
              className="w-10 h-10 rounded-full bg-white/60 hover:bg-white text-slate-800 flex items-center justify-center shadow-sm hover:scale-105 transition-all cursor-pointer border border-white/80"
            >
              <User className="w-4 h-4 text-slate-700" />
            </button>
          )}
        </nav>

      </div>

      {/* ─── Submit PR Modal ─── */}
      <AnimatePresence>
        {submitPrModalOpen && selectedBounty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full rounded-3xl bg-white/95 border border-white p-6 shadow-2xl backdrop-blur-3xl text-slate-900"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-[#E25C38] font-bold">AST PR Verification</span>
                <button
                  onClick={() => {
                    setSubmitPrModalOpen(false);
                    setPrUrlInput('');
                  }}
                  className="text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{selectedBounty.title}</h3>
              <p className="text-xs text-slate-600 mb-4">
                Enter your GitHub Pull Request link. The automated AST runner will evaluate test coverage deterministically.
              </p>
              <input
                type="text"
                value={prUrlInput}
                onChange={(e) => setPrUrlInput(e.target.value)}
                placeholder="https://github.com/org/repo/pull/42"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSubmitPrModalOpen(false);
                    setPrUrlInput('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSubmitPrModalOpen(false);
                    setPrUrlInput('');
                    showToast(`PR queued for AST verification on ${selectedBounty.title}`);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#E25C38] hover:bg-[#d04e2e] text-white text-xs font-bold shadow cursor-pointer"
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
