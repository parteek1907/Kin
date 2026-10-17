'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  TrendingUp,
  Award,
  DollarSign,
  Briefcase,
  Layers,
  UploadCloud,
  Github,
  Linkedin,
  ExternalLink,
  Code2,
  GitBranch,
  Star
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
import ResumeUploadModal from './ResumeUploadModal';
import { DARSH_OHRI_PROFILE } from '@/app/api/parse-resume/route';

type ActiveTab = 'overview' | 'time-machine' | 'bounties' | 'auto-connect' | 'radar' | 'community';

interface WalkthroughStep {
  id: string;
  title: string;
  lines: string[];
  tabId: ActiveTab;
}

const KIN_WALKTHROUGH: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: "Hi, I'm Kin 👋",
    lines: ["Welcome to your dashboard!"],
    tabId: 'overview'
  },
  {
    id: 'overview',
    title: "Overview Cockpit",
    lines: ["See your match score, active commits, and career milestones at a glance."],
    tabId: 'overview'
  },
  {
    id: 'time-machine',
    title: "Career Journey",
    lines: ["Maps out your path to senior roles and highlights the exact skills to learn next."],
    tabId: 'time-machine'
  },
  {
    id: 'bounties',
    title: "Paid Challenges",
    lines: ["Solve real technical tasks, submit a PR, and earn USDC rewards directly."],
    tabId: 'bounties'
  },
  {
    id: 'auto-connect',
    title: "Smart Auto-Connect",
    lines: ["Set your cutoff score to connect with alumni & founders automatically."],
    tabId: 'auto-connect'
  },
  {
    id: 'radar',
    title: "Talent Radar",
    lines: ["Discovers high-paying roles in robotics, genomics, and fintech that match your skills."],
    tabId: 'radar'
  },
  {
    id: 'community',
    title: "Alumni Network",
    lines: ["Stay connected with peers, see what they're shipping, and get endorsed in 1 tap."],
    tabId: 'community'
  }
];

export default function KinGlassDashboard() {
  const {
    user,
    isLoggedIn,
    userInitial,
    openAuthModal,
    logout,
    parsedProfile,
    isUploadResumeModalOpen,
    openUploadResumeModal,
    closeUploadResumeModal
  } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentTime, setCurrentTime] = useState('10:02 PM');
  const [autoAcceptThreshold, setAutoAcceptThreshold] = useState(64);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Popover in Bottom Menu
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Mascot Walkthrough State
  const [showMascotTour, setShowMascotTour] = useState(true);
  const [mascotStepIndex, setMascotStepIndex] = useState(0);

  // Interactive Modals & States
  const [selectedBounty, setSelectedBounty] = useState<SkillBounty | null>(null);
  const [submitPrModalOpen, setSubmitPrModalOpen] = useState(false);
  const [prUrlInput, setPrUrlInput] = useState('');

  // Career Time Machine State
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(0);
  const [targetReadinessScore, setTargetReadinessScore] = useState(82);

  // Auto-Connect Policies State
  const [policies, setPolicies] = useState<AutoConnectionPolicy[]>(MOCK_POLICIES);

  // Community Feed State
  const [socialFeed, setSocialFeed] = useState<SocialFeedItem[]>(MOCK_SOCIAL_FEED);
  const [newPostContent, setNewPostContent] = useState('');

  // GitHub Real-Time Data State
  const [githubData, setGithubData] = useState<any>(null);

  // Derived real data from parsed profile or default (Darsh Ohri from uploaded CV)
  const profile = parsedProfile || DARSH_OHRI_PROFILE;
  const activeCareerMilestones = (profile?.careerMilestones && profile.careerMilestones.length > 0)
    ? profile.careerMilestones
    : DARSH_OHRI_PROFILE.careerMilestones;
  const activeSkillGap = profile?.skillGap || DARSH_OHRI_PROFILE.skillGap;
  const activeBounties = (profile?.bounties && profile.bounties.length > 0)
    ? profile.bounties
    : DARSH_OHRI_PROFILE.bounties;
  const activeRadarOpportunities = (profile?.radarOpportunities && profile.radarOpportunities.length > 0)
    ? profile.radarOpportunities
    : DARSH_OHRI_PROFILE.radarOpportunities;
  const rawName = profile?.name || user?.name;
  const activeUserName = (!rawName || rawName === 'Not Specified') ? 'Darsh Ohri' : rawName;
  const rawRole = profile?.role || user?.role;
  const activeUserRole = (!rawRole || rawRole === 'Not Specified' || rawRole === 'Software Engineer') ? 'Full-Stack & AI Software Developer' : rawRole;
  const rawInst = profile?.institution || user?.institution;
  const activeUserInstitution = (!rawInst || rawInst === 'Not Specified') ? 'B.Tech CSE (Data Science Specialization)' : rawInst;
  const activeUserEmail = profile?.email || user?.email || 'darshohri@gmail.com';
  const activeGithubUsername = profile?.githubUsername || 'darshohri';
  const activeLinkedinUrl = profile?.linkedinUrl || 'https://linkedin.com/in/darshohri';
  const activeGithubUrl = profile?.githubUrl || 'https://github.com/darshohri';

  // Fetch real GitHub events if username available
  useEffect(() => {
    if (activeGithubUsername) {
      fetch(`/api/github-activity?username=${activeGithubUsername}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setGithubData(d);
        })
        .catch(() => {});
    }
  }, [activeGithubUsername]);

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
          showToast(
            nextConnected
              ? `Smart handshake requested with ${authorName}`
              : `Connection with ${authorName} disconnected`
          );
          return { ...item, connected: nextConnected };
        }
        return item;
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: SocialFeedItem = {
      id: Date.now(),
      author: {
        name: activeUserName,
        role: activeUserRole,
        institution: activeUserInstitution,
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

  const currentStep = KIN_WALKTHROUGH[mascotStepIndex] || KIN_WALKTHROUGH[0];

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
      {toastMessage && (
        <div className="fixed top-5 right-6 z-50 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="w-2 h-2 rounded-full bg-[#E25C38]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          RESUME UPLOAD MODAL
          ═══════════════════════════════════════════════════════════════ */}
      <ResumeUploadModal
        isOpen={isUploadResumeModalOpen}
        onClose={closeUploadResumeModal}
        onSuccess={(parsed) => {
          showToast(`Welcome ${parsed.name}! Dashboard updated with your CV.`);
          setSelectedMilestoneIndex(0);
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CANVAS: ONE ELEGANT FROSTED GLASS BACKGROUND CONTAINER
          Inner cards are solid white (not glass on glass!)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center px-3 sm:px-6 lg:px-8 pt-4 pb-24">
        
        {/* ─── TOP MINIMAL HEADER BAR ─── */}
        <header className="w-full max-w-[1360px] mb-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight text-slate-900 hover:text-black transition-colors">
              KIN
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            {/* Upload CV / Resume Button */}
            <button
              onClick={openUploadResumeModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 transition-all shadow-sm cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#E25C38]" />
              <span>Upload Resume / CV</span>
            </button>

            {/* Quick Guide Trigger Pill */}
            <button
              onClick={() => {
                setShowMascotTour(true);
                setMascotStepIndex(0);
                setActiveTab('overview');
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-white text-xs font-bold text-slate-800 transition-all shadow-sm backdrop-blur-xl cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive Guide</span>
            </button>
          </div>
        </header>

        {/* ─── SINGLE FROSTED GLASS BACKDROP CONTAINER ─── */}
        <main className="w-full max-w-[1360px] flex-1 flex flex-col min-h-[calc(100vh-140px)]">
          <div className="flex-1 w-full rounded-[36px] bg-white/18 border border-white/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.06),_inset_0_1.5px_2px_rgba(255,255,255,0.7)] p-5 sm:p-7 flex flex-col justify-between transition-all">
            
            {/* Real Resume Notice Banner */}
            <div className="mb-4 p-3 px-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#E25C38] shrink-0" />
                <span className="text-xs text-slate-700">
                  Profile loaded: <strong className="text-slate-900">{activeUserName}</strong> ({activeUserRole}) • Verified from CV
                </span>
              </div>
              <div className="flex items-center gap-3">
                {activeGithubUrl && (
                  <a
                    href={activeGithubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-black"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub: {activeGithubUsername}</span>
                  </a>
                )}
                {activeLinkedinUrl && (
                  <a
                    href={activeLinkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                <button
                  onClick={openUploadResumeModal}
                  className="text-[11px] font-bold text-[#E25C38] hover:underline cursor-pointer"
                >
                  Change CV / Re-upload
                </button>
              </div>
            </div>

            {/* TAB PANELS: Rendered cleanly inside solid white cards */}
            <div className="flex-1 flex flex-col justify-between w-full">
              {/* ─────────────────────────────────────────────────────────────
                  TAB 1: OVERVIEW (Master Cockpit)
                  Solid white cards for maximum clarity and contrast!
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'overview' && (
                <div key="overview" className="flex-1 flex flex-col justify-between gap-5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* Left Column (8 cols): Career Journey + Coding Velocity */}
                    <div className="lg:col-span-8 flex flex-col gap-5">
                      
                      {/* Top Row: Career Card + Coding Activity */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                        
                        {/* Career Journey Card (7 cols) - Solid White */}
                        <div className="sm:col-span-7 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Career Journey
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-700">
                                {activeCareerMilestones[selectedMilestoneIndex]?.period || '2026'}
                              </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 leading-snug">
                              {activeCareerMilestones[selectedMilestoneIndex]?.role || activeUserRole}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                              {activeCareerMilestones[selectedMilestoneIndex]?.company || activeUserInstitution}
                            </p>

                            {/* Stat Metrics Box */}
                            <div className="rounded-2xl p-4 bg-slate-50 border border-slate-100 my-3.5 flex items-center justify-between">
                              <div>
                                <div className="text-lg font-black text-slate-900">
                                  {activeCareerMilestones[selectedMilestoneIndex]?.duration || 'Current'}
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium">Timeline Duration</div>
                              </div>
                              <div className="w-[1px] h-8 bg-slate-200" />
                              <div>
                                <div className="text-lg font-black text-[#E25C38]">
                                  {activeCareerMilestones[selectedMilestoneIndex]?.velocityScore || 94}% Match
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium">Role Fit</div>
                              </div>
                            </div>

                            {/* Key Verified Skills */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Skills from CV
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {(activeCareerMilestones[selectedMilestoneIndex]?.acquiredSkills || profile.skills.slice(0, 5)).map(
                                  (skill: string) => (
                                    <span
                                      key={skill}
                                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Timeline Slider / Selector */}
                            <div className="mt-4 pt-3 border-t border-slate-100">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] text-slate-600 font-medium">Verified Milestones:</span>
                                <span className="text-[11px] font-bold text-slate-900">
                                  {selectedMilestoneIndex + 1} of {activeCareerMilestones.length}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {activeCareerMilestones.map((m: any, idx: number) => (
                                  <button
                                    key={m.id || idx}
                                    onClick={() => setSelectedMilestoneIndex(idx)}
                                    className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
                                      selectedMilestoneIndex === idx
                                        ? 'bg-[#E25C38]'
                                        : selectedMilestoneIndex > idx
                                        ? 'bg-slate-400'
                                        : 'bg-slate-200 hover:bg-slate-300'
                                    }`}
                                    title={m.role}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 mt-2">
                            <span className="truncate pr-2">
                              Verified: <strong className="text-slate-900">{activeCareerMilestones[selectedMilestoneIndex]?.verifiedBy || 'LaunchED Global'}</strong>
                            </span>
                            <button
                              onClick={() => {
                                setActiveTab('time-machine');
                                showToast('Opening Career Journey');
                              }}
                              className="font-bold text-slate-900 hover:text-[#E25C38] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            >
                              <span>Explore Full Path</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Coding Velocity (5 cols) - Solid White with GitHub Integration */}
                        <div className="sm:col-span-5 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                  GitHub Commits & Activity
                                </span>
                                <span className="text-xs font-bold text-slate-800">@{activeGithubUsername}</span>
                              </div>
                              <span className="text-xs font-mono font-bold text-[#0284c7] px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 shadow-xs">
                                {githubData?.recentPushesCount ? `${githubData.recentPushesCount * 8} Commits` : '169 Peak'}
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
                                          : 'bg-slate-200 hover:bg-slate-300'
                                      }`}
                                    />
                                  </div>
                                  <span className={`text-[10px] font-bold ${bar.active ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {bar.month}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Real GitHub Repos */}
                            {githubData?.topRepositories && (
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Active Repos:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {githubData.topRepositories.slice(0, 2).map((repo: any) => (
                                    <a
                                      key={repo.name}
                                      href={repo.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1"
                                    >
                                      <GitBranch className="w-2.5 h-2.5" />
                                      <span>{repo.name}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
                            <span className="text-slate-600 font-medium">Push Velocity</span>
                            <span className="text-[#0284c7] font-bold flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>{githubData?.velocityScore || 96}% Consistent</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Paid Challenges Preview - Solid White */}
                      <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-[#E25C38]" />
                              <h4 className="text-sm font-bold text-slate-900">Paid Coding Challenges</h4>
                            </div>
                            <button
                              onClick={() => setActiveTab('bounties')}
                              className="text-xs font-bold text-[#E25C38] hover:underline cursor-pointer"
                            >
                              View all ({activeBounties.length})
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeBounties.slice(0, 2).map((b: SkillBounty) => (
                              <div
                                key={b.id}
                                onClick={() => {
                                  setSelectedBounty(b);
                                  setSubmitPrModalOpen(true);
                                }}
                                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all cursor-pointer flex flex-col justify-between group"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-[#E25C38] font-mono">{b.reward}</span>
                                    <span className="text-[10px] text-slate-500 font-semibold">{b.sponsor}</span>
                                  </div>
                                  <h5 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#E25C38] transition-colors">
                                    {b.title}
                                  </h5>
                                </div>
                                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                                  <span>{b.difficulty}</span>
                                  <span className="font-semibold text-slate-800 flex items-center gap-0.5">
                                    Solve & Earn <ChevronRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column (4 cols): Auto-Connect & Talent Radar */}
                    <div className="lg:col-span-4 flex flex-col gap-5">
                      
                      {/* Smart Auto-Connect Card - Solid White */}
                      <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Smart Auto-Connect
                            </span>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              <span>Live</span>
                            </div>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            Auto-Accept Handshakes
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Connect automatically when a builder matches your skill criteria.
                          </p>

                          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-700">Minimum Score Cutoff</span>
                              <span className="text-xs font-mono font-bold text-slate-900">{autoAcceptThreshold}%</span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="95"
                              value={autoAcceptThreshold}
                              onChange={(e) => setAutoAcceptThreshold(Number(e.target.value))}
                              className="w-full accent-[#E25C38] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                              <span>Broad (50%)</span>
                              <span>Strict (95%)</span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                            <span>Status:</span>
                            <button
                              onClick={() => {
                                setAutoAcceptEnabled(!autoAcceptEnabled);
                                showToast(autoAcceptEnabled ? 'Auto-connect paused' : 'Auto-connect enabled');
                              }}
                              className={`font-bold ${autoAcceptEnabled ? 'text-emerald-700' : 'text-slate-500'} cursor-pointer`}
                            >
                              {autoAcceptEnabled ? 'Active (Ready)' : 'Paused'}
                            </button>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setActiveTab('auto-connect');
                              showToast('Configuring Auto-Connect Rules');
                            }}
                            className="text-xs font-bold text-[#E25C38] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Configure Match Rules</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Talent Radar Card - Solid White */}
                      <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Hidden Opportunities Radar
                            </span>
                            <Radio className="w-4 h-4 text-[#E25C38] animate-pulse" />
                          </div>

                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            Matched for your Stack
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Discovered from verified achievements and GitHub repository analysis.
                          </p>

                          <div className="mt-3.5 space-y-2">
                            {activeRadarOpportunities.slice(0, 2).map((opp: any) => (
                              <div
                                key={opp.id}
                                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                              >
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{opp.role}</div>
                                  <div className="text-[11px] text-slate-500">{opp.company} • {opp.location}</div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-mono font-bold text-[#E25C38] block">{opp.matchScore}%</span>
                                  <span className="text-[10px] text-slate-500">{opp.stipend}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setActiveTab('radar');
                              showToast('Opening Talent Radar');
                            }}
                            className="text-xs font-bold text-[#E25C38] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Radar Stream</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 2: CAREER TIME MACHINE (Solid White Cards)
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'time-machine' && (
                <div key="time-machine" className="flex-1 flex flex-col justify-between gap-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Career Journey</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Track verified milestones from your CV and simulate future roles.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Current Readiness:</span>
                      <span className="text-xs font-mono font-bold text-[#E25C38] px-3 py-1 rounded-full bg-[#E25C38]/10 border border-[#E25C38]/20">
                        {targetReadinessScore}% Senior Ready
                      </span>
                    </div>
                  </div>

                  {/* Career Timeline Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {activeCareerMilestones.map((m: any, idx: number) => (
                      <div
                        key={m.id || idx}
                        onClick={() => setSelectedMilestoneIndex(idx)}
                        className={`rounded-3xl p-6 bg-white border transition-all cursor-pointer flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.03)] ${
                          selectedMilestoneIndex === idx
                            ? 'border-[#E25C38] ring-2 ring-[#E25C38]/20'
                            : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-mono font-bold text-[#E25C38]">{m.period}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {m.duration}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">{m.role}</h3>
                          <p className="text-xs text-slate-600 mt-1">{m.company}</p>
                          <p className="text-xs text-slate-700 mt-3 line-clamp-3 leading-relaxed">
                            {m.keyAchievement}
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {m.acquiredSkills.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills to Learn Next Box */}
                  <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Recommended Skills to Unlock Next Role</h4>
                        <p className="text-xs text-slate-600">Based on industry demand for {activeUserRole}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeSkillGap.missingSkills.map((skill: any) => (
                        <div key={skill.skill} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900">{skill.skill}</div>
                            <div className="text-[10px] text-slate-500">Weight: {skill.weight}</div>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab('bounties');
                              showToast(`Finding bounties for ${skill.skill}`);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-black text-white text-[10px] font-bold cursor-pointer"
                          >
                            Solve Bounty
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 3: PAID CODING CHALLENGES (Solid White Cards)
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'bounties' && (
                <div key="bounties" className="flex-1 flex flex-col justify-between gap-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Paid Coding Challenges</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Solve real-world open issues, submit a PR, and receive verified USDC rewards upon automated merge.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                        Escrow: {profile.stats?.escrowVolume || '$4,200'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {activeBounties.map((b: SkillBounty) => (
                      <div
                        key={b.id}
                        className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all hover:border-slate-300 group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-black font-mono text-[#E25C38]">{b.reward}</span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {b.sponsor}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#E25C38] transition-colors">
                            {b.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            {b.description}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {b.requiredSkills.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">{b.difficulty}</span>
                          <button
                            onClick={() => {
                              setSelectedBounty(b);
                              setSubmitPrModalOpen(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <span>Submit Pull Request</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 4: SMART AUTO-CONNECT (Solid White Cards)
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'auto-connect' && (
                <div key="auto-connect" className="flex-1 flex flex-col justify-between gap-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Smart Auto-Connect</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        No resumes or cold emails. Connect automatically when your match score beats your cutoff.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Cutoff:</span>
                      <span className="text-xs font-mono font-bold text-[#E25C38] bg-white px-3 py-1 rounded-full border border-slate-200">
                        {autoAcceptThreshold}% Match
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {policies.map((policy) => (
                      <div
                        key={policy.id}
                        className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Rule #{policy.id}
                            </span>
                            <button
                              onClick={() => handleTogglePolicy(policy.id)}
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                                policy.autoAccept
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {policy.autoAccept ? 'Active' : 'Paused'}
                            </button>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 leading-snug">{policy.name}</h3>
                          <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-600">
                              <span>Target Role:</span>
                              <strong className="text-slate-900">{policy.targetRole}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Min Match Score:</span>
                              <strong className="text-[#E25C38]">{policy.minMatchScore}%</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Verified Only:</span>
                              <strong className="text-slate-900">{policy.verifiedOnly ? 'Yes' : 'No'}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span>{policy.autoAccept ? 'Listening for candidate builders...' : 'Policy is suspended'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 5: HIDDEN OPPORTUNITIES (Solid White Cards)
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'radar' && (
                <div key="radar" className="flex-1 flex flex-col justify-between gap-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Hidden Career Opportunities</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        High-growth technical teams seeking verified talent with proven code repositories.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {activeRadarOpportunities.map((opp: any) => (
                      <div
                        key={opp.id}
                        className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-mono font-bold text-[#E25C38] px-2.5 py-0.5 rounded-full bg-[#E25C38]/10">
                              {opp.matchScore}% Match
                            </span>
                            <span className="text-xs font-bold text-slate-700">{opp.stipend}</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">{opp.role}</h3>
                          <p className="text-xs text-slate-600 mt-1">{opp.company} • {opp.location}</p>
                          <p className="text-xs text-slate-700 mt-3 leading-relaxed">{opp.skillsNeeded}</p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">Autonomous Radar</span>
                          <button
                            onClick={() => showToast(`Handshake signal transmitted to ${opp.company}`)}
                            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all"
                          >
                            Express Interest
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 6: ALUMNI & BUILDER NETWORK (Solid White Cards)
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'community' && (
                <div key="community" className="flex-1 flex flex-col justify-between gap-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Alumni & Builder Network</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Verified peer accomplishments, open-source shipping feeds, and 1-tap peer endorsements.
                      </p>
                    </div>
                  </div>

                  {/* Share an update input */}
                  <form onSubmit={handleCreatePost} className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex gap-3">
                    <input
                      type="text"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share a project launch or code milestone with the network..."
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Share</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Network Feed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {socialFeed.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="text-xs font-bold text-slate-900">{post.author.name}</div>
                              <div className="text-[11px] text-slate-500">{post.author.role}</div>
                            </div>
                            <button
                              onClick={() => handleConnectUser(post.id, post.author.name)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                post.connected
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-900 text-white'
                              }`}
                            >
                              {post.connected ? 'Connected' : 'Connect'}
                            </button>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{post.content}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
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
                </div>
              )}
            </div>

          </div>
        </main>

        {/* ═══════════════════════════════════════════════════════════════
            HORIZONTAL FROSTED GLASS DOCK (At Bottom)
            ═══════════════════════════════════════════════════════════════ */}
        <nav
          aria-label="Dashboard Navigation"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 sm:gap-3 py-2 px-4 rounded-full bg-white/45 hover:bg-white/60 border border-white/70 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1),_inset_0_1.5px_2px_rgba(255,255,255,0.8)] transition-all"
        >
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setProfileMenuOpen(false);
                }}
                className={`relative p-2.5 sm:p-3 rounded-full transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-[#121826] text-white shadow-[0_8px_20px_rgba(18,24,38,0.35)] scale-105'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/50'
                }`}
                title={item.label}
              >
                <IconComponent className="w-5 h-5 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />

                {/* Subtle indicator dot for active tab */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#E25C38]" />
                )}
              </button>
            );
          })}

          <div className="w-[1px] h-6 bg-slate-400/30 mx-1" />

          {/* Profile Popover Menu in Bottom Dock */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 border-2 border-white/80 shadow-md flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-all cursor-pointer overflow-hidden"
              title="Profile & Options"
            >
              <span>{activeUserName.charAt(0).toUpperCase()}</span>
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute bottom-14 right-0 z-50 w-64 rounded-3xl p-4 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                      {activeUserName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs text-slate-900 truncate">{activeUserName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{activeUserEmail}</div>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        openUploadResumeModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-[#E25C38]" />
                      <span>Upload / Update CV</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setActiveTab('auto-connect');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Match Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setShowMascotTour(true);
                        setMascotStepIndex(0);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-[#E25C38]" />
                      <span>Replay Mascot Guide</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={async () => {
                        await logout();
                        setProfileMenuOpen(false);
                        showToast('Signed out successfully.');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          INTERACTIVE KIN MASCOT WALKTHROUGH
          1) On first load: Dims background, Kin appears in DEAD CENTER without any BG
             Says: "Hi, I'm Kin", "Welcome to your dashboard"
          2) On Next: Smoothly glides to each feature with minimal punchy chats!
          ═══════════════════════════════════════════════════════════════ */}
      {showMascotTour && (
        <>
          {/* STEP 0: Initial Welcome in Dead Center with Dimmed Backdrop */}
          {mascotStepIndex === 0 && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-[3px] flex flex-col items-center justify-center p-4 transition-opacity duration-300">
              <div className="flex flex-col items-center text-center relative max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
                {/* Chat speech bubble right above Kin */}
                <div className="mb-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.35)] text-slate-900 relative w-full">
                  <button
                    onClick={() => setShowMascotTour(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Skip Guide"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Hi, I'm Kin 👋
                  </h3>
                  <p className="text-sm font-semibold text-slate-600 mt-1">
                    Welcome to your dashboard
                  </p>

                  <div className="mt-5 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setMascotStepIndex(1);
                        setActiveTab('overview');
                      }}
                      className="w-full py-2.5 px-5 rounded-2xl bg-[#E25C38] hover:bg-[#d04e2e] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Show me around</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Downward pointer */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-100" />
                </div>

                {/* Pure robot character model with transparent background! */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.4)] animate-bounce-subtle">
                  <Image
                    src="/images/kin_mascot_transparent.png"
                    alt="Kin AI Mascot"
                    fill
                    sizes="224px"
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1+: Kin Floats Above Bottom Dock and Explains Each Feature */}
          {mascotStepIndex > 0 && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none w-full max-w-sm sm:max-w-md px-4 transition-all duration-300">
              {/* Speech dialog bubble */}
              <div className="pointer-events-auto w-full rounded-3xl p-5 bg-white border border-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.18)] text-slate-900 mb-2 relative animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button
                  onClick={() => setShowMascotTour(false)}
                  className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Close Guide"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E25C38]" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Kin Walkthrough • Step {mascotStepIndex} of {KIN_WALKTHROUGH.length - 1}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-1">{currentStep.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-normal mb-3">
                  {currentStep.lines.join(' ')}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {KIN_WALKTHROUGH.slice(1).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          mascotStepIndex - 1 === idx ? 'w-4 bg-slate-900' : 'w-1.5 bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const prev = mascotStepIndex - 1;
                        setMascotStepIndex(prev);
                        if (prev > 0) setActiveTab(KIN_WALKTHROUGH[prev].tabId);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (mascotStepIndex < KIN_WALKTHROUGH.length - 1) {
                          const next = mascotStepIndex + 1;
                          setMascotStepIndex(next);
                          setActiveTab(KIN_WALKTHROUGH[next].tabId);
                        } else {
                          setShowMascotTour(false);
                          showToast('Walkthrough complete! ✨');
                        }
                      }}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>{mascotStepIndex === KIN_WALKTHROUGH.length - 1 ? 'Finish Tour' : 'Next'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Downward pointer */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-100 shadow-xs" />
              </div>

              {/* Pure robot character hovering above bottom dock */}
              <div
                className="pointer-events-auto cursor-pointer"
                onClick={() => showToast("Hi! Click 'Next' in the bubble to continue the tour!")}
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)] animate-bounce-subtle">
                  <Image
                    src="/images/kin_mascot_transparent.png"
                    alt="Kin AI Mascot"
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Minimized Mascot Trigger */}
      {!showMascotTour && (
        <button
          onClick={() => {
            setShowMascotTour(true);
            setMascotStepIndex(0);
          }}
          className="fixed bottom-5 right-5 sm:right-8 z-40 flex items-center gap-2 py-2 px-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-lg text-xs font-bold text-slate-800 transition-all hover:scale-105 cursor-pointer"
          title="Open Kin Mascot Guide"
        >
          <div className="relative w-6 h-6">
            <Image
              src="/images/kin_mascot_transparent.png"
              alt="Kin Mascot"
              fill
              sizes="24px"
              className="object-contain"
            />
          </div>
          <span>Kin Guide</span>
        </button>
      )}

      {/* ─── Submit PR Modal ─── */}
      {submitPrModalOpen && selectedBounty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="max-w-md w-full rounded-3xl bg-white border border-slate-100 p-6 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 duration-150">
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] mb-4"
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
          </div>
        </div>
      )}
    </div>
  );
}
