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
  ArrowLeft,
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
  Star,
  Search,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import KinMascot from './KinMascot';
import ProfileCompletionWizard from './profile/ProfileCompletionWizard';

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
    closeUploadResumeModal,
    isProfileModalOpen,
    openProfileModal,
    closeProfileModal
  } = useAuth();

  const router = useRouter();
  const [networkRole, setNetworkRole] = useState<'student' | 'alumni'>('student');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentTime, setCurrentTime] = useState('10:02 PM');
  const [autoAcceptThreshold, setAutoAcceptThreshold] = useState(64);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Signed out of KIN.');
      router.push('/');
    } catch {
      router.push('/');
    }
  };

  // Profile Popover in Bottom Menu
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Mascot Walkthrough State
  const [showMascotTour, setShowMascotTour] = useState(false);
  const [mascotStepIndex, setMascotStepIndex] = useState(0);

  const dismissMascotTour = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kin_mascot_tour_seen', 'true');
    }
    setShowMascotTour(false);
  };

  // Sync network role from URL or localStorage & check mascot tour
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      const tourDismissed = sessionStorage.getItem('kin_mascot_tour_seen');

      if (urlRole === 'alumni') {
        setNetworkRole('alumni');
        setShowMascotTour(false);
      } else {
        const storedRole = localStorage.getItem('kin_network_role');
        if (storedRole === 'alumni') {
          setNetworkRole('alumni');
          setShowMascotTour(false);
        } else {
          setNetworkRole('student');
        }
      }
    }
  }, []);

  // Interactive Modals & States
  const [selectedBounty, setSelectedBounty] = useState<SkillBounty | null>(null);
  const [submitPrModalOpen, setSubmitPrModalOpen] = useState(false);
  const [prUrlInput, setPrUrlInput] = useState('');

  // Alumni & Builder Network Search and DM States
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [communityFilter, setCommunityFilter] = useState<'all' | 'alumni' | 'builders' | 'founders'>('all');
  const [dmRecipient, setDmRecipient] = useState<{ id: string; name: string; role: string } | null>(null);
  const [dmMessages, setDmMessages] = useState<{ id: string; sender: 'me' | 'them'; text: string; time: string }[]>([]);
  const [newDmText, setNewDmText] = useState('');

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

  // Dynamic User Profile Data (Hydrated from verified user session & completed profile)
  const activeUserName = user?.name || parsedProfile?.name || 'Verified Member';
  const activeUserRole = user?.role || user?.headline || parsedProfile?.role || (networkRole === 'alumni' ? 'Senior Technical Leader & Mentor' : 'Full-Stack Software Developer');
  const activeUserInstitution = user?.institution || parsedProfile?.institution || (networkRole === 'alumni' ? 'Global Technology Syndicate' : 'IIIT Delhi');
  const activeUserEmail = user?.email || parsedProfile?.email || 'builder@kin.network';
  const activeLinkedinUrl = user?.linkedinUrl || parsedProfile?.linkedinUrl;
  const activeGithubUrl = user?.githubUrl || parsedProfile?.githubUrl;
  const activeGithubUsername = user?.githubUsername || (activeGithubUrl ? activeGithubUrl.replace(/^https?:\/\/(?:www\.)?github\.com\//i, '').replace(/\/$/, '') : '');
  const activePortfolioUrl = user?.portfolioUrl || parsedProfile?.portfolioUrl;
  const activeSkills = (user?.skills && user.skills.length > 0)
    ? user.skills
    : (parsedProfile?.skills && parsedProfile.skills.length > 0)
    ? parsedProfile.skills
    : ['React', 'Next.js', 'Python', 'FastAPI', 'TypeScript'];

  const activeCareerMilestones = (parsedProfile?.careerMilestones && parsedProfile.careerMilestones.length > 0)
    ? parsedProfile.careerMilestones
    : MOCK_CAREER_MILESTONES;
  const activeSkillGap = parsedProfile?.skillGap || MOCK_SKILL_GAP;
  const activeBounties = (parsedProfile?.bounties && parsedProfile.bounties.length > 0)
    ? parsedProfile.bounties
    : MOCK_BOUNTIES;
  const activeRadarOpportunities = (parsedProfile?.radarOpportunities && parsedProfile.radarOpportunities.length > 0)
    ? parsedProfile.radarOpportunities
    : MOCK_RADAR_OPPORTUNITIES;

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

  const handleOpenDm = (author: { name: string; role: string }) => {
    setDmRecipient({ id: author.name, name: author.name, role: author.role });
    const userFirstName = activeUserName.split(' ')[0] || 'there';
    setDmMessages([
      {
        id: 'dm-welcome',
        sender: 'them',
        text: `Hey ${userFirstName}! Great connecting on Kin. Checked your verified background and would love to collaborate.`,
        time: '10:45 AM'
      }
    ]);
  };

  const handleSendDm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newDmText.trim() || !dmRecipient) return;
    const userText = newDmText.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDmMessages((prev) => [
      ...prev,
      { id: `dm-user-${Date.now()}`, sender: 'me', text: userText, time: nowTime }
    ]);
    setNewDmText('');
    showToast(`Direct message sent to ${dmRecipient.name}`);

    setTimeout(() => {
      setDmMessages((prev) => [
        ...prev,
        {
          id: `dm-reply-${Date.now()}`,
          sender: 'them',
          text: `Thanks for the ping! Let's review the code on GitHub or hop on a call.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  const filteredSocialFeed = socialFeed.filter((post) => {
    const q = searchUserQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      post.author.name.toLowerCase().includes(q) ||
      post.author.role.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (communityFilter === 'alumni') {
      return (
        post.author.role.toLowerCase().includes('engineer') ||
        post.author.role.toLowerCase().includes('alumni') ||
        post.author.role.toLowerCase().includes('intern')
      );
    }
    if (communityFilter === 'builders') {
      return (
        post.author.role.toLowerCase().includes('developer') ||
        post.author.role.toLowerCase().includes('builder') ||
        post.author.role.toLowerCase().includes('lead')
      );
    }
    if (communityFilter === 'founders') {
      return (
        post.author.role.toLowerCase().includes('founder') ||
        post.author.role.toLowerCase().includes('ceo') ||
        post.author.role.toLowerCase().includes('partner')
      );
    }
    return true;
  });

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
        
        {/* ─── TOP MINIMAL HEADER BAR (LOGO CENTERED) ─── */}
        <header className="w-full max-w-[1360px] mb-4 grid grid-cols-3 items-center">
          {/* Left: Home link and Node Badge */}
          <div className="flex items-center gap-2 justify-self-start">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/85 hover:bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all shadow-xs"
              title="Return to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Home</span>
            </Link>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10px] font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>IIITD Node</span>
            </div>
          </div>

          {/* Center: Exact Middle Brand with 3D metallic logo */}
          <div className="flex items-center justify-center justify-self-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-md transition-all cursor-pointer"
            >
              <Image
                src="/images/kin_logo.png"
                alt="KIN Logo"
                width={32}
                height={32}
                priority
                className="w-7 h-7 object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
              />
              <span className="text-xl font-black tracking-[0.2em] text-slate-900 uppercase leading-none select-none">
                KIN
              </span>
            </Link>
          </div>

          {/* Right: Role indicator, Upload Resume & Profile/Logout */}
          <div className="flex items-center justify-end gap-2 sm:gap-2.5 justify-self-end">
            <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full bg-white/80 border border-slate-200 text-[11px] font-bold text-slate-700 capitalize">
              {networkRole === 'alumni' ? 'Alumni Hub' : 'Student Builder'}
            </span>

            {/* Profile Setup / Edit Wizard */}
            <button
              onClick={openProfileModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Complete or Edit your 4-Step Profile"
            >
              <User className="w-3.5 h-3.5 text-[#E25C38]" />
              <span className="hidden sm:inline">Profile Setup</span>
              <span className="sm:hidden">Profile</span>
            </button>

            <button
              onClick={openUploadResumeModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 transition-all shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#E25C38]" />
              <span className="hidden sm:inline">Upload Resume / CV</span>
              <span className="sm:hidden">Upload</span>
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                title="Sign Out / Switch Account"
                className="p-1.5 rounded-full bg-white/80 hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 transition-all shadow-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </header>

        {/* ─── SINGLE FROSTED GLASS BACKDROP CONTAINER ─── */}
        <main className="w-full max-w-[1360px] flex-1 flex flex-col min-h-[calc(100vh-140px)]">
          {networkRole === 'alumni' ? (
            <div className="flex-1 w-full rounded-[36px] bg-white/25 border border-white/50 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.06),_inset_0_1.5px_2px_rgba(255,255,255,0.7)] p-6 sm:p-8 flex flex-col justify-between transition-all">
              <div>
                {/* Alumni Header Banner */}
                <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                      A
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Alumni Command Center</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                          Alumni Access
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        IIIT Delhi Alumni Network • Verified Portal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        setNetworkRole('student');
                        localStorage.setItem('kin_network_role', 'student');
                        showToast('Switched to Student Workspace');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      Switch to Student View
                    </button>
                    <button
                      onClick={async () => {
                        await logout();
                        showToast('Signed out successfully.');
                        router.push('/');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* Plain Minimal Alumni Feature Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Student Talent Scouting */}
                  <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#E25C38] flex items-center justify-center mb-4">
                        <Users className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Student Talent Scouting</h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        Discover top student builders with AST-verified code repositories, high commit velocities, and specialized skill alignments.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Pipeline: Ready</span>
                      <span className="text-[#E25C38] font-bold">Awaiting Next Prompt</span>
                    </div>
                  </div>

                  {/* Card 2: Endowments & Bounties */}
                  <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Endowments & Bounties</h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        Post engineering challenges, sponsor student hackathons, and disburse USDC/crypto micro-grants directly into student builder wallets.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Vault: Configured</span>
                      <span className="text-sky-600 font-bold">Awaiting Next Prompt</span>
                    </div>
                  </div>

                  {/* Card 3: Alumni Founder Conduits */}
                  <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Alumni Founder Conduits</h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        Connect with fellow graduates leading AI labs, seed-stage startups, and venture syndicates across the global network.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Network: Global</span>
                      <span className="text-emerald-600 font-bold">Awaiting Next Prompt</span>
                    </div>
                  </div>
                </div>

                {/* Plain Status Placeholder */}
                <div className="mt-6 rounded-3xl p-8 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-slate-700" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Alumni Dashboard Initialized</h4>
                  <p className="text-xs text-slate-600 max-w-md mt-1">
                    Your alumni dashboard workspace is ready. Tell us the exact features, filters, or actions you would like to have here in your next prompt.
                  </p>
                </div>
              </div>

              <div className="pt-6 text-center text-xs text-slate-500">
                KIN Career Engine & Alumni Network • IIIT Delhi
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full rounded-[36px] bg-white/18 border border-white/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.06),_inset_0_1.5px_2px_rgba(255,255,255,0.7)] p-5 sm:p-7 flex flex-col justify-between transition-all">
            
            {/* Real Resume Notice Banner */}
            <div className="mb-4 p-3 px-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#E25C38] shrink-0" />
                <span className="text-xs text-slate-700">
                  Profile: <strong className="text-slate-900">{activeUserName}</strong> ({activeUserRole}) • {user?.studentId || user?.businessId ? `ID: ${user?.studentId || user?.businessId}` : 'Verified Profile'}
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
                                {(activeCareerMilestones[selectedMilestoneIndex]?.acquiredSkills || activeSkills.slice(0, 5)).map(
                                  (skill: string, sIdx: number) => (
                                    <span
                                      key={`overview-skill-${skill}-${sIdx}`}
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
                                    key={`overview-milestone-btn-${m.id || idx}`}
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
                              Verified: <strong className="text-slate-900">{activeCareerMilestones[selectedMilestoneIndex]?.verifiedBy || activeUserInstitution || 'Kin Node'}</strong>
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
                                {activeGithubUrl ? (
                                  <a
                                    href={activeGithubUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-bold text-slate-800 hover:text-black flex items-center gap-1 group/gh mt-0.5"
                                  >
                                    <span>@{activeGithubUsername || 'profile'}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover/gh:text-slate-700" />
                                  </a>
                                ) : (
                                  <button
                                    onClick={openProfileModal}
                                    className="text-xs font-bold text-[#E25C38] hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                                  >
                                    <span>+ Connect GitHub</span>
                                  </button>
                                )}
                              </div>
                              <span className="text-xs font-mono font-bold text-[#0284c7] px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 shadow-xs">
                                {githubData?.recentPushesCount ? `${githubData.recentPushesCount * 8} Commits` : 'Verified Activity'}
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
                            {activeBounties.slice(0, 2).map((b: SkillBounty, bIdx: number) => (
                              <div
                                key={`overview-bounty-${b.id || bIdx}`}
                                onClick={() => {
                                  setSelectedBounty(b);
                                  setSubmitPrModalOpen(true);
                                }}
                                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all cursor-pointer flex flex-col justify-between group"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-[#E25C38] font-mono">
                                      {b.reward || (b.rewardUsdc ? `$${b.rewardUsdc}` : '$500')}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-semibold">
                                      {b.sponsor || b.organization || 'Verified Partner'}
                                    </span>
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
                      
                      {/* Smart Connection Card - Solid White (No auto accept for students) */}
                      <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Inbound Matching
                            </span>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              <span>Live</span>
                            </div>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            Verified Inbound Inquiries
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Receive direct inquiries from alumni & founders matching your verified code projects.
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
                            <span>Inbound Review:</span>
                            <span className="font-bold text-emerald-700">
                              Manual Review Active
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setActiveTab('auto-connect');
                              showToast('Viewing Inbound Criteria');
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
                            {activeRadarOpportunities.slice(0, 2).map((opp: any, oIdx: number) => (
                              <div
                                key={opp.id || `radar-opp-${oIdx}`}
                                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                              >
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{opp.role || opp.title}</div>
                                  <div className="text-[11px] text-slate-500">{opp.company || opp.organization} • {opp.location || 'Remote'}</div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-mono font-bold text-[#E25C38] block">{opp.matchScore}%</span>
                                  <span className="text-[10px] text-slate-500">{opp.stipend || '$1,200/mo'}</span>
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
                      {activeSkillGap.missingSkills.map((skill: any, sIdx: number) => {
                        const skillName = skill.name || skill.skill || 'Advanced Systems';
                        const priority = skill.priority || (skill.weight ? `Weight: ${skill.weight}` : 'HIGH');
                        return (
                          <div key={`missing-skill-${sIdx}-${skillName}`} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">{skillName}</div>
                              <div className="text-[10px] text-slate-500">Priority: {priority}</div>
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab('bounties');
                                showToast(`Finding bounties for ${skillName}`);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-black text-white text-[10px] font-bold cursor-pointer"
                            >
                              Solve Bounty
                            </button>
                          </div>
                        );
                      })}
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
                        Escrow: {parsedProfile?.stats?.escrowVolume || '$4,200'}
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
                            <span className="text-sm font-black font-mono text-[#E25C38]">
                              {b.reward || (b.rewardUsdc ? `$${b.rewardUsdc}` : '$500')}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {b.sponsor || b.organization || 'Verified Partner'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#E25C38] transition-colors">
                            {b.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            {b.description || `Verified task in ${b.category || 'Engineering'} with automated test verification.`}
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
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Smart Match Criteria</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Define qualification cutoffs for inbound messages and mentorship requests from alumni.
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
                              <span>Target Focus:</span>
                              <strong className="text-slate-900 truncate max-w-[150px]">
                                {policy.targetRole || policy.requiredSkills?.join(', ') || 'Full-Stack & AI'}
                              </strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Min Match Score:</span>
                              <strong className="text-[#E25C38]">
                                {policy.minMatchScore || policy.qualificationScoreThreshold || 75}%
                              </strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Verified Only:</span>
                              <strong className="text-slate-900">
                                {policy.verifiedOnly !== undefined ? (policy.verifiedOnly ? 'Yes' : 'No') : 'Yes'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span>{policy.autoAccept ? 'Listening for candidate matches (Manual Review)' : 'Rule is paused'}</span>
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
                          <h3 className="text-base font-bold text-slate-900 leading-snug">{opp.title || opp.role}</h3>
                          <p className="text-xs text-slate-600 mt-1">
                            <strong className="text-slate-900">{opp.organization || opp.company}</strong> • {opp.location} {opp.industry ? `• ${opp.industry}` : ''}
                          </p>
                          <p className="text-xs text-slate-700 mt-3 leading-relaxed">
                            {opp.reasoning || opp.skillsNeeded}
                          </p>
                          {opp.bridgeSkills && opp.bridgeSkills.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block w-full mb-0.5">
                                Latent Bridge Skills
                              </span>
                              {opp.bridgeSkills.map((skill: string) => (
                                <span
                                  key={skill}
                                  className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">Autonomous Radar</span>
                          <button
                            onClick={() => showToast(`Signal transmitted to ${opp.organization || opp.company}`)}
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

                    {/* Search & Filter Bar */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchUserQuery}
                          onChange={(e) => setSearchUserQuery(e.target.value)}
                          placeholder="Search builders, skills..."
                          className="pl-8 pr-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38] w-48 sm:w-56 shadow-2xs"
                        />
                      </div>
                      <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-slate-200 shadow-2xs">
                        {(['all', 'alumni', 'builders', 'founders'] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setCommunityFilter(filter)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize transition-all cursor-pointer ${
                              communityFilter === filter
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
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
                      className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Share</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Network Feed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredSocialFeed.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                                {post.author.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900">{post.author.name}</div>
                                <div className="text-[11px] text-slate-500">{post.author.role}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenDm(post.author)}
                                className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                                title={`Message ${post.author.name}`}
                              >
                                <MessageSquare className="w-4 h-4 stroke-[2]" />
                                <span className="sr-only">Message {post.author.name}</span>
                              </button>
                              <button
                                onClick={() => handleConnectUser(post.id, post.author.name)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  post.connected
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-900 hover:bg-black text-white'
                                }`}
                              >
                                {post.connected ? 'Connected' : 'Connect'}
                              </button>
                            </div>
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
          )}
        </main>

        {/* ═══════════════════════════════════════════════════════════════
            FLOATING BOTTOM DOCK WITH PEEKING KIN MASCOT
            Kin is situated BEHIND the navigation bar, with its upper half
            peeking out from the top center edge. Clicking it interacts with us!
            ═══════════════════════════════════════════════════════════════ */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none">
          {/* Peeking Kin Mascot Behind Dock */}
          <button
            onClick={() => {
              setShowMascotTour(true);
              setMascotStepIndex(0);
            }}
            className="relative -mb-4 z-10 pointer-events-auto group cursor-pointer transition-transform duration-300 hover:-translate-y-2 focus:outline-none"
            title="Kin AI Guide • Click me to interact! 👋"
          >
            {/* Interactive tooltip */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-md text-[10px] font-bold text-slate-800 whitespace-nowrap pointer-events-none">
              Kin Guide • Click me 👋
            </div>

            <div className="w-14 h-14 relative filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.1)]">
              <KinMascot pose={activeTab as any} size={56} />
            </div>
          </button>

          {/* Frosted Glass Nav Bar in Front */}
          <nav
            aria-label="Dashboard Navigation"
            className="relative z-20 pointer-events-auto flex items-center gap-1.5 sm:gap-2 py-1.5 px-3.5 rounded-full bg-white/75 hover:bg-white/85 border border-white/80 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1),_inset_0_1.5px_2px_rgba(255,255,255,0.8)] transition-all"
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
                        openProfileModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#E25C38]" />
                      <span>Edit 4-Step Profile</span>
                    </button>
                    {activeLinkedinUrl && (
                      <a
                        href={activeLinkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Linkedin className="w-4 h-4 text-sky-600" />
                          <span>View LinkedIn Profile</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {activeGithubUrl && (
                      <a
                        href={activeGithubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Github className="w-4 h-4 text-slate-800" />
                          <span>View GitHub Profile</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
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
                        router.push('/');
                        window.location.href = '/';
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
                    onClick={dismissMascotTour}
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
                <div className="relative filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.35)] animate-bounce-subtle">
                  <KinMascot pose="welcome" size={210} />
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
                  onClick={dismissMascotTour}
                  className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Close Guide"
                >
                  <X className="w-4 h-4" />
                </button>

                <h4 className="text-base font-bold text-slate-900 mb-1">{currentStep.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-normal mb-3">
                  {currentStep.lines.join(' ')}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {KIN_WALKTHROUGH.slice(1).map((step, idx) => (
                      <div
                        key={step.id || `dot-${idx}`}
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
                          dismissMascotTour();
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
                <div className="relative filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)] animate-bounce-subtle">
                  <KinMascot pose={currentStep.tabId || 'overview'} size={88} />
                </div>
              </div>
            </div>
          )}
        </>
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

      {/* ─── Direct Message (DM) Modal ─── */}
      {dmRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="max-w-md w-full rounded-3xl bg-white border border-slate-100 p-6 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  {dmRecipient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{dmRecipient.name}</h3>
                  <div className="text-[11px] text-slate-500">{dmRecipient.role}</div>
                </div>
              </div>
              <button
                onClick={() => setDmRecipient(null)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[160px] max-h-[280px]">
              {dmMessages.map((msg, mIdx) => (
                <div
                  key={`dm-msg-${mIdx}`}
                  className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'me'
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-900 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Compose & Send */}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={newDmText}
                onChange={(e) => setNewDmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendDm();
                  }
                }}
                placeholder={`Message ${dmRecipient.name}...`}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38]"
              />
              <button
                onClick={() => handleSendDm()}
                className="px-4 py-2 rounded-xl bg-[#E25C38] hover:bg-[#d04e2e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span>Send</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Profile Completion Wizard Modal ─── */}
      <ProfileCompletionWizard
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        initialRole={networkRole}
      />

      {/* ─── Resume / CV Upload Modal ─── */}
      {isUploadResumeModalOpen && (
        <ResumeUploadModal
          isOpen={isUploadResumeModalOpen}
          onClose={closeUploadResumeModal}
        />
      )}
    </div>
  );
}
