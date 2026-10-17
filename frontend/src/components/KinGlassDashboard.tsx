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
  ChevronRight,
  User,
  LogOut,
  X,
  CheckCircle2,
  Send,
  Heart,
  Plus,
  HelpCircle,
  Settings,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft
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

interface MascotStep {
  title: string;
  description: string;
  tabId: ActiveTab;
  tip: string;
}

const MASCOT_GUIDE_STEPS: MascotStep[] = [
  {
    title: "Hi, I'm Kin! Welcome to your Dashboard 👋",
    description: "I'm here to show you around. KIN helps you plan your career milestones, earn rewards from real coding bounties, and connect with top alumni automatically.",
    tabId: 'overview',
    tip: "You can click on any icon in the bottom menu to switch features anytime."
  },
  {
    title: "1. Career Time Machine",
    description: "Explore the verified career steps taken by senior engineers at Anthropic and Figma. It compares your experience and highlights the exact skills to learn next.",
    tabId: 'time-machine',
    tip: "Click 'Test My Next Career Move' to simulate how gaining new skills boosts your match score!"
  },
  {
    title: "2. Paid Coding Challenges",
    description: "Solve real technical challenges and earn USDC rewards directly. Submit your GitHub pull request and our automated test suite verifies it in seconds.",
    tabId: 'bounties',
    tip: "No long interview rounds — your verified code speaks for itself."
  },
  {
    title: "3. Smart Auto-Connect",
    description: "Skip cold outreach and recruiter spam. Set your match score threshold (e.g. 64%). When founders and alumni search for your skills, you connect automatically.",
    tabId: 'auto-connect',
    tip: "You can adjust your score cutoff or switch between Strict, Alumni, and Open modes."
  },
  {
    title: "4. Hidden Job Opportunities",
    description: "Our radar spots high-paying roles in industries like Robotics, Genomics, and Finance where your existing programming skills transfer naturally.",
    tabId: 'radar',
    tip: "Discover high-leverage roles you might not have known you were qualified for!"
  },
  {
    title: "5. Alumni & Builder Network",
    description: "Stay connected with peers and mentors across top tech companies. Share updates, see what teammates are building, and connect in 1 tap.",
    tabId: 'community',
    tip: "Click on your profile avatar in the bottom dock to access settings or restart this guide anytime."
  }
];

export default function KinGlassDashboard() {
  const { user, isLoggedIn, userInitial, openAuthModal, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentTime, setCurrentTime] = useState('10:02 PM');
  const [autoAcceptThreshold, setAutoAcceptThreshold] = useState(64);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Popover in Bottom Menu
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Mascot Guide State
  const [showMascotTour, setShowMascotTour] = useState(true);
  const [mascotStepIndex, setMascotStepIndex] = useState(0);

  // Interactive Modals & States
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
    { id: 'time-machine' as ActiveTab, label: 'Career Journey', icon: History },
    { id: 'bounties' as ActiveTab, label: 'Paid Challenges', icon: Trophy },
    { id: 'auto-connect' as ActiveTab, label: 'Auto-Connect', icon: ShieldCheck },
    { id: 'radar' as ActiveTab, label: 'Hidden Opportunities', icon: Radio },
    { id: 'community' as ActiveTab, label: 'Alumni Network', icon: Users },
  ];

  const handleTogglePolicy = (policyId: number) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id === policyId) {
          const nextVal = !p.autoAccept;
          showToast(`Rule "${p.name}": ${nextVal ? 'Active' : 'Paused'}`);
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
          showToast(nextConnected ? `Connected with ${authorName} in 1 tap!` : `Disconnected from ${authorName}`);
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
        role: 'Software Engineer',
        institution: 'KIN Network',
        avatar: '/images/hero_builder_avatar.jpg',
        verified: true,
      },
      content: newPostContent.trim(),
      timestamp: 'Just now',
      mutualConnections: 1,
      tags: ['#VerifiedBuilder', '#KIN'],
      likes: 1,
      connected: true,
    };

    setSocialFeed([newPost, ...socialFeed]);
    setNewPostContent('');
    showToast('Update shared with the network');
  };

  const currentMascotStep = MASCOT_GUIDE_STEPS[mascotStepIndex];

  const nextMascotStep = () => {
    if (mascotStepIndex < MASCOT_GUIDE_STEPS.length - 1) {
      const nextIdx = mascotStepIndex + 1;
      setMascotStepIndex(nextIdx);
      setActiveTab(MASCOT_GUIDE_STEPS[nextIdx].tabId);
    } else {
      setShowMascotTour(false);
      showToast('Guide completed! Click your profile anytime to reopen.');
    }
  };

  const prevMascotStep = () => {
    if (mascotStepIndex > 0) {
      const prevIdx = mascotStepIndex - 1;
      setMascotStepIndex(prevIdx);
      setActiveTab(MASCOT_GUIDE_STEPS[prevIdx].tabId);
    }
  };

  return (
    <div className="relative w-full min-h-screen font-sans text-slate-900 selection:bg-[#E25C38]/20 selection:text-[#E25C38] overflow-x-hidden flex flex-col justify-between">
      {/* ═══════════════════════════════════════════════════════════════
          NATURAL DAYLIGHT MODERN LIVING ROOM BACKGROUND (VisionOS Style)
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
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px]" />
      </div>

      {/* ─── Toast Notification ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-6 z-50 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/85 border border-white/90 text-slate-900 shadow-xl backdrop-blur-2xl text-xs font-semibold"
          >
            <div className="w-2 h-2 rounded-full bg-[#E25C38]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CANVAS: HIGHLY TRANSPARENT FROSTED GLASS
          Stretches from top header down to right above bottom menu dock!
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center px-3 sm:px-6 lg:px-8 pt-4 pb-24">
        
        {/* ─── TOP HEADER BAR (Logo Centered at Top) ─── */}
        <header className="relative w-full max-w-[1360px] mb-3 flex items-center justify-between">
          {/* Left: Back to Home */}
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/30 hover:bg-white/50 border border-white/50 text-xs font-semibold text-slate-800 transition-all shadow-sm backdrop-blur-xl cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2] text-slate-700" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>

          {/* ─── Centre Top Brand Logo (Exact Image Spec) ─── */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none" aria-label="Kin Home">
              <img 
                src="/images/kin_logo.png" 
                alt="KIN Logo" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-300 group-hover:scale-105" 
              />
              <span 
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-[20px] sm:text-[24px] font-bold tracking-[0.24em] text-[#11131A] uppercase transition-opacity group-hover:opacity-80 select-none leading-none"
              >
                KIN
              </span>
            </Link>
          </div>

          {/* Right: Quick Guide Trigger Pill */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setShowMascotTour(true);
                setMascotStepIndex(0);
                setActiveTab('overview');
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/30 hover:bg-white/50 border border-white/50 text-xs font-bold text-slate-800 transition-all shadow-sm backdrop-blur-xl cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive Guide</span>
            </button>
          </div>
        </header>

        {/* ─── UNIFIED FULL-HEIGHT LIQUID GLASS PANEL (Ultra-transparent luminous glass) ─── */}
        <main className="w-full max-w-[1360px] flex-1 flex flex-col min-h-[calc(100vh-140px)]">
          <div className="flex-1 w-full rounded-[36px] bg-white/12 hover:bg-white/16 border border-white/30 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.06),_inset_0_1px_1.5px_rgba(255,255,255,0.5)] p-5 sm:p-7 flex flex-col justify-between transition-all">
            
            <AnimatePresence mode="wait">
              {/* ─────────────────────────────────────────────────────────────
                  TAB 1: OVERVIEW (Master Cockpit)
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col justify-between gap-5"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* Left Column (8 cols): Career Journey + Coding Velocity */}
                    <div className="lg:col-span-8 flex flex-col gap-5">
                      
                      {/* Top Row: Career Card + Coding Activity */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                        
                        {/* Career Journey Card (7 cols) */}
                        <div className="sm:col-span-7 rounded-3xl p-6 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm flex flex-col justify-between transition-all">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Career Journey
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-700">
                                {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].period}
                              </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 leading-snug">
                              {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].role}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                              {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].company}
                            </p>

                            {/* Stat Metrics Box */}
                            <div className="rounded-2xl p-4 bg-white/30 border border-white/50 my-3.5 flex items-center justify-between shadow-xs">
                              <div>
                                <div className="text-lg font-black text-slate-900">
                                  {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].duration}
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium">Experience Level</div>
                              </div>
                              <div className="w-[1px] h-8 bg-slate-300/40" />
                              <div>
                                <div className="text-lg font-black text-[#E25C38]">
                                  {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].velocityScore}% Match
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium">Fit for Role</div>
                              </div>
                            </div>

                            {/* Timeline Stage Scrubber */}
                            <div className="my-2">
                              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
                                <span>Career Milestone</span>
                                <span>Step {selectedMilestoneIndex + 1} of {MOCK_CAREER_MILESTONES.length}</span>
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
                                        ? 'bg-slate-400/80'
                                        : 'bg-slate-300/60 hover:bg-slate-400/70'
                                    }`}
                                    title={m.role}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-300/30 flex items-center justify-between text-xs text-slate-600 mt-2">
                            <span>Alumni: <strong className="text-slate-900">Dr. Aarav Sharma</strong> (Anthropic)</span>
                            <button
                              onClick={() => {
                                setActiveTab('time-machine');
                                showToast('Opening Career Journey');
                              }}
                              className="font-bold text-slate-900 hover:text-[#E25C38] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Explore Full Path</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Coding Velocity (5 cols) */}
                        <div className="sm:col-span-5 rounded-3xl p-6 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm flex flex-col justify-between transition-all">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                  Coding Activity
                                </span>
                                <span className="text-xs font-bold text-slate-800">Verified Commits</span>
                              </div>
                              <span className="text-xs font-mono font-bold text-[#0284c7] px-2.5 py-0.5 rounded-full bg-sky-100/70 border border-sky-300 shadow-xs">
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
                                <div key={bar.month} className="flex flex-col items-center gap-1.5 flex-1">
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

                          <div className="pt-3 border-t border-slate-300/30 flex items-center justify-between text-xs text-slate-600 mt-2">
                            <span>Evaluated monthly</span>
                            <span className="text-emerald-700 font-bold">+28% Growth</span>
                          </div>
                        </div>

                      </div>

                      {/* Middle Row: 3 Key Metric Tiles */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div
                          onClick={() => {
                            setActiveTab('community');
                            showToast('Opening Alumni Network');
                          }}
                          className="rounded-3xl p-5 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm transition-all cursor-pointer group"
                        >
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Verified Engineers
                          </span>
                          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">76,420</div>
                          <span className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1">
                            <span>In Our Network</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>

                        <div
                          onClick={() => {
                            setActiveTab('bounties');
                            showToast('Opening Paid Challenges');
                          }}
                          className="rounded-3xl p-5 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm transition-all cursor-pointer group"
                        >
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Open Rewards Pool
                          </span>
                          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">$3,600 USDC</div>
                          <span className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                            <span>Ready to Earn</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>

                        <div
                          onClick={() => {
                            setActiveTab('radar');
                            showToast('Opening Hidden Opportunities');
                          }}
                          className="rounded-3xl p-5 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm transition-all cursor-pointer group"
                        >
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            New Opportunities
                          </span>
                          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">18 Discovered</div>
                          <span className="text-xs text-purple-700 font-bold mt-1 flex items-center gap-1">
                            <span>Based on Your Skills</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Right Column (4 cols): Auto-Connect Controller */}
                    <div className="lg:col-span-4 rounded-3xl p-6 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm flex flex-col justify-between transition-all">
                      <div>
                        {/* Header: Clock + Dial Toggle */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-mono font-bold text-slate-800 tracking-tight">
                            {currentTime}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600">Auto-Connect</span>
                            <button
                              onClick={() => {
                                setAutoAcceptEnabled(!autoAcceptEnabled);
                                showToast(`Auto-Connect: ${!autoAcceptEnabled ? 'Active' : 'Paused'}`);
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
                            <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(203, 213, 225, 0.4)" strokeWidth="7" />
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
                              Match Cutoff
                            </span>
                          </div>
                        </div>

                        {/* Minus & Plus Buttons */}
                        <div className="flex items-center justify-center gap-3 my-2">
                          <button
                            onClick={() => setAutoAcceptThreshold(Math.max(40, autoAcceptThreshold - 2))}
                            className="w-9 h-9 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center text-base font-bold shadow-xs transition-all cursor-pointer"
                          >
                            -
                          </button>
                          <button
                            onClick={() => setAutoAcceptThreshold(Math.min(98, autoAcceptThreshold + 2))}
                            className="w-9 h-9 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center text-base font-bold shadow-xs transition-all cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* 4 Mode Presets with clear names */}
                        <div className="grid grid-cols-4 gap-2 my-3 pt-3 border-t border-slate-300/30">
                          {[
                            { l: 'Strict', s: 85 },
                            { l: 'Alumni', s: 75 },
                            { l: 'Open Source', s: 64 },
                            { l: 'Open', s: 50 },
                          ].map((p) => (
                            <button
                              key={p.l}
                              onClick={() => {
                                setAutoAcceptThreshold(p.s);
                                showToast(`Filter mode: ${p.l} (${p.s}%)`);
                              }}
                              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                                autoAcceptThreshold === p.s
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'bg-white/50 text-slate-700 hover:bg-white'
                              }`}
                            >
                              {p.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Clean Status Footer */}
                      <div className="pt-3 border-t border-slate-300/30 mt-2">
                        <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                          Alumni and founders matching <strong>{autoAcceptThreshold}%+</strong> connect automatically without cold outreach.
                        </p>
                        <button
                          onClick={() => {
                            setActiveTab('auto-connect');
                            showToast('Opening Auto-Connect Rules');
                          }}
                          className="w-full py-2.5 px-3 rounded-2xl bg-white/60 hover:bg-white border border-white/80 text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#E25C38]" />
                          <span>Manage Auto-Connect Rules</span>
                        </button>
                      </div>

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
                  className="flex-1 flex flex-col justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/30 pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Career Journey</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        See how top alumni advanced to their roles, and discover the exact skills to learn next.
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
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-white/50 text-slate-700 hover:bg-white'
                          }`}
                        >
                          Milestone {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                    {/* Trajectory Details (7 cols) */}
                    <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono font-bold text-slate-600">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].period}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-slate-900/5 text-slate-800 text-xs font-bold border border-slate-900/10">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].velocityScore}% Match Fit
                          </span>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900">
                          {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].role}
                        </h3>
                        <p className="text-sm font-semibold text-slate-700 mt-1">
                          {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].company} • {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].duration}
                        </p>

                        <div className="my-5 p-4 rounded-2xl bg-white/40 border border-white/60">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Key Verified Project
                          </span>
                          <p className="text-xs text-slate-800 leading-relaxed font-medium">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].keyAchievement}
                          </p>
                          <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified in Network: {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].verifiedBy}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                            Skills Acquired in this Role
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {MOCK_CAREER_MILESTONES[selectedMilestoneIndex].acquiredSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 rounded-full bg-white/60 border border-white/80 text-xs font-semibold text-slate-800 shadow-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-300/30 mt-6 flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">Milestone {selectedMilestoneIndex + 1} of 3</span>
                        <div className="flex gap-2">
                          <button
                            disabled={selectedMilestoneIndex === 0}
                            onClick={() => setSelectedMilestoneIndex((i) => Math.max(0, i - 1))}
                            className="px-3 py-1.5 rounded-xl bg-white/60 hover:bg-white text-xs font-bold text-slate-800 disabled:opacity-40 cursor-pointer shadow-xs"
                          >
                            Previous Milestone
                          </button>
                          <button
                            disabled={selectedMilestoneIndex === MOCK_CAREER_MILESTONES.length - 1}
                            onClick={() => setSelectedMilestoneIndex((i) => Math.min(MOCK_CAREER_MILESTONES.length - 1, i + 1))}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-xs font-bold text-white disabled:opacity-40 cursor-pointer shadow-xs"
                          >
                            Next Milestone
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Skill Gap Analysis (5 cols) */}
                    <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Skills You Need Next
                          </span>
                          <span className="text-xs font-bold text-[#E25C38]">{targetReadinessScore}% Ready</span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 mb-1">Target Goal: {MOCK_SKILL_GAP.targetRole}</h4>
                        <p className="text-xs text-slate-600 mb-4">
                          Based on verified skill sets from 800+ senior engineering profiles
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden mb-5">
                          <div
                            style={{ width: `${targetReadinessScore}%` }}
                            className="h-full bg-gradient-to-r from-[#0284c7] to-[#E25C38] rounded-full transition-all"
                          />
                        </div>

                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Priority Skill Roadmap
                        </span>
                        <div className="flex flex-col gap-2">
                          {MOCK_SKILL_GAP.missingSkills.map((skill) => (
                            <div
                              key={skill.name}
                              className="p-2.5 rounded-xl bg-white/40 border border-white/60 flex items-center justify-between text-xs"
                            >
                              <span className="font-semibold text-slate-900">{skill.name}</span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/5 text-slate-800 border border-slate-900/10">
                                {skill.priority === 'HIGH' ? 'Learn First' : skill.priority === 'MEDIUM' ? 'Next Up' : 'Optional'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setTargetReadinessScore((s) => (s >= 90 ? 74 : s + 8));
                          showToast('Simulated completing a project: +8% readiness for target role!');
                        }}
                        className="w-full mt-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Test My Next Career Move (+8%)
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 3: PAID CODING CHALLENGES (SKILL BOUNTY NETWORK)
                  Clean minimalist tags, NO ugly pink badges!
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'bounties' && (
                <motion.div
                  key="bounties"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/30 pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Paid Coding Challenges</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Solve real technical challenges, submit your pull request, and earn instant rewards in USDC.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-white/50 border border-white/80 text-slate-900 text-xs font-bold shadow-xs">
                        $3,600 USDC Available
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                    {MOCK_BOUNTIES.map((bounty) => (
                      <div
                        key={bounty.id}
                        className="rounded-3xl p-6 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-slate-500">{bounty.organization}</span>
                            {/* Sleek, minimalist clean badge — NO ugly pink! */}
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-900/5 text-slate-800 border border-slate-900/10">
                              Level: {bounty.difficulty.toLowerCase()}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                            {bounty.title}
                          </h3>

                          <div className="text-2xl font-black text-[#E25C38] my-1.5">
                            ${bounty.rewardUsdc} USDC
                          </div>

                          <div className="flex flex-wrap gap-1.5 my-3">
                            {bounty.requiredSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2.5 py-0.5 rounded-lg bg-white/50 border border-white/70 text-[11px] font-medium text-slate-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-300/30 mt-3 flex items-center justify-between text-xs text-slate-600">
                          <span>{bounty.submissionsCount} submissions • {bounty.deadline}</span>
                          <button
                            onClick={() => {
                              setSelectedBounty(bounty);
                              setSubmitPrModalOpen(true);
                            }}
                            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Submit Pull Request
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 4: SMART AUTO-CONNECT
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'auto-connect' && (
                <motion.div
                  key="auto-connect"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/30 pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Smart Auto-Connect</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        No resumes or cold emails. Connect automatically when your match score beats your cutoff.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                    {/* Left: Cutoff Dial Controller (5 cols) */}
                    <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-slate-800">{currentTime}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600">Auto-Connect</span>
                            <button
                              onClick={() => {
                                setAutoAcceptEnabled(!autoAcceptEnabled);
                                showToast(`Auto-Connect: ${!autoAcceptEnabled ? 'Active' : 'Paused'}`);
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
                            <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(203, 213, 225, 0.4)" strokeWidth="7" />
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
                              Match Cutoff
                            </span>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-center gap-3 my-2">
                          <button
                            onClick={() => setAutoAcceptThreshold(Math.max(40, autoAcceptThreshold - 2))}
                            className="w-9 h-9 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center text-base font-bold shadow-xs transition-all cursor-pointer"
                          >
                            -
                          </button>
                          <button
                            onClick={() => setAutoAcceptThreshold(Math.min(98, autoAcceptThreshold + 2))}
                            className="w-9 h-9 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center text-base font-bold shadow-xs transition-all cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Presets */}
                        <div className="grid grid-cols-4 gap-2 my-3 pt-3 border-t border-slate-300/30">
                          {[
                            { l: 'Strict', s: 85 },
                            { l: 'Alumni', s: 75 },
                            { l: 'Open Source', s: 64 },
                            { l: 'Open', s: 50 },
                          ].map((p) => (
                            <button
                              key={p.l}
                              onClick={() => {
                                setAutoAcceptThreshold(p.s);
                                showToast(`Cutoff set to ${p.l} (${p.s}%)`);
                              }}
                              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                                autoAcceptThreshold === p.s
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'bg-white/50 text-slate-700 hover:bg-white'
                              }`}
                            >
                              {p.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed pt-3 border-t border-slate-300/30">
                        Inbound connection requests with a qualification score of <strong>{autoAcceptThreshold}% or higher</strong> connect with you automatically.
                      </p>
                    </div>

                    {/* Right: Active Rules List (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      {policies.map((policy) => (
                        <div
                          key={policy.id}
                          className="rounded-3xl p-6 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm transition-all"
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
                              {policy.autoAccept ? 'Active' : 'Paused'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 my-3 text-xs">
                            <div className="p-3 rounded-xl bg-white/40 border border-white/60">
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">Minimum Commits</span>
                              <span className="text-base font-bold text-slate-900">{policy.minCommits}+ Commits</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/40 border border-white/60">
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">Minimum Score</span>
                              <span className="text-base font-bold text-[#E25C38]">{policy.qualificationScoreThreshold}%</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-300/30 text-xs text-slate-600">
                            <span>{policy.activeRequestsCount} Connections Approved Automatically</span>
                            <button
                              onClick={() => showToast(`Simulated connection: Approved builder from ${policy.name}`)}
                              className="font-bold text-slate-900 hover:text-[#E25C38] transition-colors cursor-pointer"
                            >
                              Test Rule →
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => showToast('Opening rule builder: Customize your auto-connect filters')}
                        className="py-3 rounded-2xl bg-white/50 hover:bg-white border border-white/70 text-xs font-bold text-slate-900 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-[#E25C38]" />
                        <span>Create Custom Connection Rule</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 5: HIDDEN OPPORTUNITIES (UNCLAIMED TALENT RADAR)
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'radar' && (
                <motion.div
                  key="radar"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/30 pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Hidden Career Opportunities</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        High-paying roles in other industries (Genomics, Robotics, Finance) where your existing skills are in high demand.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/50 border border-white/80 text-slate-900 text-xs font-bold shadow-xs">
                      18 Discovered Matches
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                    {MOCK_RADAR_OPPORTUNITIES.map((opp) => (
                      <div
                        key={opp.id}
                        className="rounded-3xl p-6 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500">{opp.industry}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-900/5 text-slate-800 text-[11px] font-bold border border-slate-900/10">
                                {opp.matchScore}% Match
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                                {opp.transferableBridgeScore}% Transferable
                              </span>
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {opp.title}
                          </h3>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5 mb-3">
                            {opp.organization}
                          </p>

                          <div className="p-3.5 rounded-2xl bg-white/40 border border-white/60 my-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Why You're a Great Fit
                            </span>
                            <p className="text-xs text-slate-800 leading-relaxed font-normal">
                              {opp.reasoning}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1.5 my-2">
                            {opp.bridgeSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2.5 py-0.5 rounded-lg bg-white/50 border border-white/70 text-[11px] font-medium text-slate-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-300/30 mt-3 flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">Status: Discovered</span>
                          <button
                            onClick={() => showToast(`1-Tap Interest sent for ${opp.title}!`)}
                            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Explore & Connect in 1 Tap
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 6: ALUMNI & BUILDER NETWORK (COMMUNITY FEED)
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'community' && (
                <motion.div
                  key="community"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/30 pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Alumni & Builder Network</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Real updates from alumni working at Anthropic, Figma, and fast-growing startups.
                      </p>
                    </div>
                  </div>

                  {/* New Post Publisher Box */}
                  <form
                    onSubmit={handlePublishPost}
                    className="rounded-3xl p-5 bg-white/30 border border-white/50 backdrop-blur-xl shadow-sm flex flex-col gap-3"
                  >
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share what you're working on, ask for advice, or vouch for a peer..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/80 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newPostContent.trim()}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-[#E25C38]" />
                        <span>Post Update</span>
                      </button>
                    </div>
                  </form>

                  {/* Feed Items */}
                  <div className="flex flex-col gap-4 flex-1">
                    {socialFeed.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-3xl p-6 bg-white/14 hover:bg-white/22 border border-white/25 backdrop-blur-md shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              {post.author.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{post.author.name}</span>
                                {post.author.verified && (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-900/5 text-slate-800 text-[10px] font-bold border border-slate-900/10">
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
                                : 'bg-slate-900 hover:bg-black text-white shadow-xs'
                            }`}
                          >
                            {post.connected ? 'Connected' : 'Connect in 1 Tap'}
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed my-2.5 font-normal">
                          {post.content}
                        </p>

                        <div className="flex flex-wrap gap-1.5 my-2.5">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 rounded-lg bg-white/50 border border-white/70 text-[11px] font-medium text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-slate-300/30 flex items-center justify-between text-xs text-slate-600">
                          <span>{post.mutualConnections} mutual connections</span>
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
            HORIZONTAL LIQUID FROSTED GLASS DOCK (At Bottom)
            Profile avatar opens popup menu with settings, tour, and logout!
            ═══════════════════════════════════════════════════════════════ */}
        <nav
          aria-label="Dashboard Navigation"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 sm:gap-3 py-2 px-4 rounded-full bg-white/35 hover:bg-white/45 border border-white/60 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1),_inset_0_1.5px_2px_rgba(255,255,255,0.8)] transition-all"
        >
          {/* 6 Feature Icons */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  showToast(`Opened ${item.label}`);
                }}
                className={`relative group flex items-center justify-center w-10 h-10 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md scale-105'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
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
          <div className="w-[1px] h-6 bg-slate-300/40" />

          {/* User Profile Avatar with Floating Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              title={isLoggedIn ? `${user?.name} (${user?.email})` : 'Sign in / Profile'}
              className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer border border-white/80"
            >
              {isLoggedIn ? userInitial : <User className="w-4 h-4 text-white" />}
            </button>

            {/* Profile Popover Menu (Above the dock) */}
            <AnimatePresence>
              {profileMenuOpen && (
                <>
                  <div
                    onClick={() => setProfileMenuOpen(false)}
                    className="fixed inset-0 z-40 bg-black/5"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-14 right-0 w-56 rounded-3xl p-3.5 bg-white/95 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-3xl text-xs z-50 text-slate-900"
                  >
                  <div className="px-2 py-1">
                    <span className="font-bold text-slate-900 text-sm block truncate">
                      {user?.name || 'Verified Builder'}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {user?.email || 'builder@kin.ai'}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-1.5">
                      Verified Member
                    </span>
                  </div>

                  <div className="w-full h-[1px] bg-slate-200/60 my-2" />

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setShowMascotTour(true);
                      setMascotStepIndex(0);
                    }}
                    className="w-full py-2 px-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 font-semibold text-slate-700 transition-colors text-left cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-[#E25C38]" />
                    <span>Interactive Guide</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setActiveTab('auto-connect');
                      showToast('Opening Auto-Connect Settings');
                    }}
                    className="w-full py-2 px-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 font-semibold text-slate-700 transition-colors text-left cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-slate-600" />
                    <span>Auto-Connect Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      showToast('Profile & Notification preferences updated');
                    }}
                    className="w-full py-2 px-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 font-semibold text-slate-700 transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-600" />
                    <span>Account Settings</span>
                  </button>

                  <div className="w-full h-[1px] bg-slate-200/60 my-2" />

                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        logout();
                        setProfileMenuOpen(false);
                        showToast('Signed out successfully');
                      }}
                      className="w-full py-2 px-2 rounded-xl hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        openAuthModal();
                      }}
                      className="w-full py-2 px-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Sign In / Sign Up</span>
                    </button>
                  )}
                </motion.div>
              </>
            )}
            </AnimatePresence>
          </div>
        </nav>

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          INTERACTIVE MASCOT POPUP GUIDE (Robot from 3rd Image)
          Pops up with smooth entrance animation and speech dialog bubble!
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showMascotTour && (
          <div className="fixed bottom-24 right-5 sm:right-8 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Dialog Speech Bubble */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="pointer-events-auto max-w-sm sm:max-w-md w-full rounded-3xl p-5 bg-white/95 border border-white shadow-[0_25px_60px_rgba(0,0,0,0.18)] backdrop-blur-3xl text-slate-900 mb-3 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowMascotTour(false);
                  showToast('Guide closed. Click your profile anytime to reopen.');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                title="Close Guide"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#E25C38]" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  KIN Campus Guide • Step {mascotStepIndex + 1} of {MASCOT_GUIDE_STEPS.length}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1.5 pr-6">
                {currentMascotStep.title}
              </h3>

              <p className="text-xs text-slate-700 leading-relaxed font-normal mb-3">
                {currentMascotStep.description}
              </p>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 mb-4 font-medium flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#E25C38] shrink-0 mt-0.5" />
                <span><strong>Tip:</strong> {currentMascotStep.tip}</span>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  {MASCOT_GUIDE_STEPS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMascotStepIndex(idx);
                        setActiveTab(MASCOT_GUIDE_STEPS[idx].tabId);
                      }}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        mascotStepIndex === idx ? 'w-5 bg-slate-900' : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {mascotStepIndex > 0 && (
                    <button
                      onClick={prevMascotStep}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>
                  )}
                  <button
                    onClick={nextMascotStep}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>{mascotStepIndex === MASCOT_GUIDE_STEPS.length - 1 ? 'Finish Tour' : 'Next'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Speech bubble downward pointer */}
              <div className="absolute -bottom-2 right-12 w-4 h-4 bg-white/95 rotate-45 border-r border-b border-white shadow-sm" />
            </motion.div>

            {/* Mascot Robot Character with Hover/Bounce Animation */}
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.8 }}
              animate={{
                y: [0, -6, 0],
                opacity: 1,
                scale: 1,
              }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 }
              }}
              className="pointer-events-auto mr-6 cursor-pointer group"
              onClick={() => {
                showToast("Hi! Click the 'Next' button above to tour each feature!");
              }}
              title="Click Kin to chat!"
            >
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.15)] border-2 border-white/95 bg-[#F9F7EF] group-hover:scale-105 transition-all">
                <Image
                  src="/images/kin_mascot.png"
                  alt="Kin AI Mascot Guide"
                  fill
                  sizes="88px"
                  className="object-contain p-2"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Minimized Mascot Trigger */}
      <AnimatePresence>
        {!showMascotTour && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => {
              setShowMascotTour(true);
              setMascotStepIndex(0);
              setActiveTab('overview');
            }}
            className="fixed bottom-5 right-5 sm:right-8 z-40 flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/50 hover:bg-white/80 border border-white/80 shadow-lg backdrop-blur-2xl text-xs font-bold text-slate-800 transition-all hover:scale-105 cursor-pointer"
            title="Open Kin Mascot Guide"
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#F9F7EF] border border-white/80">
              <Image
                src="/images/kin_mascot.png"
                alt="Kin Mascot"
                fill
                sizes="28px"
                className="object-contain p-0.5"
              />
            </div>
            <span>Guide</span>
          </motion.button>
        )}
      </AnimatePresence>

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
                <span className="text-xs font-mono text-[#E25C38] font-bold">Automatic Code Verification</span>
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
                Paste your GitHub Pull Request link. Our automated test runner will test your code in seconds.
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
                    showToast(`PR queued for automatic test verification on ${selectedBounty.title}`);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#E25C38] hover:bg-[#d04e2e] text-white text-xs font-bold shadow-xs cursor-pointer"
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
