'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
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
  MessageSquare,
  Sliders,
  Check,
  Clock,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  FileText,
  Calendar,
  Share2,
  Eye,
  Filter,
  CheckSquare
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import ResumeUploadModal from './ResumeUploadModal';
import { DARSH_OHRI_PROFILE } from '@/data/darshProfile';
import KinMascot from './KinMascot';
import {
  ALUMNI_PROBLEMS,
  AlumniProblem,
  INITIAL_SUBMITTED_SOLUTIONS,
  CandidateSolutionSubmission
} from '@/data/alumniProblems';
import {
  MOCK_POLICIES,
  MOCK_SOCIAL_FEED,
  SocialFeedItem,
  AutoConnectionPolicy
} from '@/services/dashboardService';

type ActiveTab = 
  | 'overview' 
  | 'problems' 
  | 'outreach' 
  | 'firewall' 
  | 'time-machine' 
  | 'doorway' 
  | 'wisdom' 
  | 'radar' 
  | 'community';

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
    lines: ["Welcome to your career acceleration cockpit!"],
    tabId: 'overview'
  },
  {
    id: 'overview',
    title: "Overview Cockpit",
    lines: ["See your career readiness, active commits, and verified trajectory at a glance."],
    tabId: 'overview'
  },
  {
    id: 'problems',
    title: "Alumni Problem Statements",
    lines: ["Solve real architectural bottlenecks posted by senior alumni and submit your GitHub repos to get hired!"],
    tabId: 'problems'
  },
  {
    id: 'outreach',
    title: "Smart Auto-Connect",
    lines: ["Unlock instant connection with verified seniors by meeting their automated skill gatekeeper."],
    tabId: 'outreach'
  },
  {
    id: 'time-machine',
    title: "Career Time Machine",
    lines: ["Trace the authentic career footsteps of staff engineers who walked this path before you."],
    tabId: 'time-machine'
  },
  {
    id: 'doorway',
    title: "20-Minute Doorway",
    lines: ["Book 1-on-1 expert sessions protected by Kin's anti-AI-slop guarantee."],
    tabId: 'doorway'
  },
  {
    id: 'wisdom',
    title: "Wisdom Capsule",
    lines: ["Practice rapid 90-second mock interview prompts with scored alumni feedback."],
    tabId: 'wisdom'
  },
  {
    id: 'radar',
    title: "Talent Radar",
    lines: ["Discover transferable skills and high-paying roles in non-obvious adjacent industries."],
    tabId: 'radar'
  },
  {
    id: 'community',
    title: "Professional & Ghost Network",
    lines: ["Connect publicly or switch to pseudonymous Ghost Mode for candid, unfiltered industry discussions."],
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
    activeRole,
    setActiveRole,
    isUploadResumeModalOpen,
    openUploadResumeModal,
    closeUploadResumeModal,
    setParsedProfile
  } = useAuth();

  const router = useRouter();

  // Role State: Sync with AuthContext & URL parameter
  const [networkRole, setNetworkRole] = useState<'student' | 'alumni'>('student');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentTime, setCurrentTime] = useState('10:02 PM');
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

  // Profile Menu Popover in Topbar
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Mascot Walkthrough State
  const [showMascotTour, setShowMascotTour] = useState(true);
  const [mascotStepIndex, setMascotStepIndex] = useState(0);

  // Sync role state on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'alumni' || activeRole === 'Alumni') {
        setNetworkRole('alumni');
        setShowMascotTour(false);
      } else {
        setNetworkRole('student');
      }
    }
  }, [activeRole]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Switch Role Handler
  const handleRoleToggle = (targetRole: 'student' | 'alumni') => {
    setNetworkRole(targetRole);
    setActiveRole(targetRole === 'student' ? 'Student' : 'Alumni');
    setActiveTab('overview');
    showToast(`Switched to ${targetRole === 'student' ? 'Student Dashboard' : 'Working Professional Command Center'}`);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PROBLEM STATEMENTS (IMAGE 3 UI) & SOLUTION SUBMISSION MODAL STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [problems, setProblems] = useState<AlumniProblem[]>(ALUMNI_PROBLEMS);
  const [problemCategoryFilter, setProblemCategoryFilter] = useState<string>('All');
  const [selectedProblem, setSelectedProblem] = useState<AlumniProblem | null>(null);
  const [isSubmitSolutionModalOpen, setIsSubmitSolutionModalOpen] = useState(false);
  const [repoUrlInput, setRepoUrlInput] = useState('');
  const [liveUrlInput, setLiveUrlInput] = useState('');
  const [approachSummaryInput, setApproachSummaryInput] = useState('');
  const [submittingSolution, setSubmittingSolution] = useState(false);

  // Professional Problem Creator Modal State
  const [isPostProblemModalOpen, setIsPostProblemModalOpen] = useState(false);
  const [newProblemQuestion, setNewProblemQuestion] = useState('');
  const [newProblemCategory, setNewProblemCategory] = useState<'Automotive' | 'Housing' | 'Healthcare' | 'Blockchain' | 'FinTech' | 'Fake News' | 'Hardware' | 'Career' | 'Consumer Services'>('Healthcare');
  const [newProblemCompany, setNewProblemCompany] = useState('Google Health Core');
  const [newProblemReward, setNewProblemReward] = useState('₹25,000 / $300 USDC');
  const [newProblemRepo, setNewProblemRepo] = useState('https://github.com/company/starter-template');
  const [newProblemContext, setNewProblemContext] = useState('');

  // Professional Candidate PR / Solution Review Console State
  const [candidateSubmissions, setCandidateSubmissions] = useState<CandidateSolutionSubmission[]>(INITIAL_SUBMITTED_SOLUTIONS);

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTO-CONNECT & FIREWALL STATES
  // ─────────────────────────────────────────────────────────────────────────────
  // Student Outreach State
  const [manualNoteModalOpen, setManualNoteModalOpen] = useState(false);
  const [manualNoteSenior, setManualNoteSenior] = useState<string>('Rahul Mehta');
  const [manualNoteText, setManualNoteText] = useState('');

  // Professional Firewall Settings State
  const [firewallThreshold, setFirewallThreshold] = useState<number>(75);
  const [firewallMinCommits, setFirewallMinCommits] = useState<number>(15);
  const [firewallActive, setFirewallActive] = useState<boolean>(true);
  const [selectedFirewallSkills, setSelectedFirewallSkills] = useState<string[]>(['React', 'Docker', 'PostgreSQL']);
  const [pendingQueue, setPendingQueue] = useState([
    { id: 'pq-1', name: 'Tanmay Saxena', college: 'NSUT Delhi', match: 68, missing: 'Docker (0/1)', note: 'Hi Rahul! Built a high-concurrency pub-sub in Go and would love your guidance on Uber platform architecture.' },
    { id: 'pq-2', name: 'Rhea Sen', college: 'DTU', match: 71, missing: 'Min Commits (12/15)', note: 'Hey! Loved your post on distributed cache warming. Check my Raft KV implementation.' },
    { id: 'pq-3', name: 'Kabir Varma', college: 'IIIT Hyderabad', match: 64, missing: 'PostgreSQL', note: 'Hey Rahul, solving your CarDekho OBD-II problem right now!' },
  ]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 20-MINUTE DOORWAY STATES
  // ─────────────────────────────────────────────────────────────────────────────
  const [selectedExpert, setSelectedExpert] = useState<{ name: string; role: string; fee: string; specialty: string } | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('Saturday, 3:00 PM - 3:20 PM');
  const [consultFeeSetting, setConsultFeeSetting] = useState('₹1,000');
  const [totalSessionsConducted, setTotalSessionsConducted] = useState(12);

  // ─────────────────────────────────────────────────────────────────────────────
  // WISDOM CAPSULE STATES
  // ─────────────────────────────────────────────────────────────────────────────
  const [isRecordingWisdom, setIsRecordingWisdom] = useState(false);
  const [wisdomTimer, setWisdomTimer] = useState(90);
  const [wisdomActivePrompt, setWisdomActivePrompt] = useState("Explain how you handled a production outage or latency spike in your last distributed project.");
  const [wisdomDepthScore, setWisdomDepthScore] = useState(4);
  const [wisdomClarityScore, setWisdomClarityScore] = useState(5);
  const [wisdomBrevityScore, setWisdomBrevityScore] = useState(4);
  const [wisdomFeedbackAdvice, setWisdomFeedbackAdvice] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────
  // TIME MACHINE STATES
  // ─────────────────────────────────────────────────────────────────────────────
  const [targetRoleSelection, setTargetRoleSelection] = useState('Staff AI Engineer');
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(0);

  // ─────────────────────────────────────────────────────────────────────────────
  // COMMUNITY & GHOST MODE STATES
  // ─────────────────────────────────────────────────────────────────────────────
  const [communitySubTab, setCommunitySubTab] = useState<'feed' | 'ghost'>('feed');
  const [socialFeed, setSocialFeed] = useState<SocialFeedItem[]>(MOCK_SOCIAL_FEED);
  const [newPostContent, setNewPostContent] = useState('');
  const [ghostPosts, setGhostPosts] = useState([
    {
      id: 'g-1',
      persona: 'Ghost-Cadet-108',
      role: 'Student • Tier 3 College',
      content: 'Is it true that top product firms filter out non-target colleges even if your GitHub has 400+ commits on production-grade Rust systems? Need honest answers.',
      timestamp: '25m ago',
      likes: 34,
      replies: 12
    },
    {
      id: 'g-2',
      persona: 'Ghost-Architect-402',
      role: 'Staff Engineer • Tier 1 US Firm',
      content: 'Real compensation reality check: Base bands capped at ₹45L for SDE-2 in Bangalore. The ₹90L CTCs advertised in headlines include 4-year unvested RSUs priced at bubble valuations. Focus on liquid equity.',
      timestamp: '1h ago',
      likes: 89,
      replies: 24
    }
  ]);
  const [newGhostText, setNewGhostText] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────
  // PROFILE & GITHUB DATA
  // ─────────────────────────────────────────────────────────────────────────────
  const profile = parsedProfile || DARSH_OHRI_PROFILE;
  const activeUserName = profile?.name || 'Darsh Ohri';
  const activeUserRole = profile?.role || 'Full-Stack & AI Software Developer';
  const activeUserInstitution = profile?.institution || 'B.Tech CSE (Data Science Specialization)';
  const activeGithubUsername = profile?.githubUsername || 'darshohri';
  const activeGithubUrl = profile?.githubUrl || 'https://github.com/darshohri';
  const activeLinkedinUrl = profile?.linkedinUrl || 'https://linkedin.com/in/darshohri';
  const activeCareerMilestones = (profile?.careerMilestones && profile.careerMilestones.length > 0)
    ? profile.careerMilestones
    : DARSH_OHRI_PROFILE.careerMilestones;

  // GitHub telemetry
  const [githubData, setGithubData] = useState<any>(null);
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

  // Live Clock
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

  // Timer for 90s Wisdom Mock Arena
  useEffect(() => {
    let timerId: any = null;
    if (isRecordingWisdom && wisdomTimer > 0) {
      timerId = setInterval(() => {
        setWisdomTimer((t) => t - 1);
      }, 1000);
    } else if (wisdomTimer === 0) {
      setIsRecordingWisdom(false);
      showToast("Time's up! 90-second mock response recorded. Ready for AI & Alumni feedback.");
    }
    return () => clearInterval(timerId);
  }, [isRecordingWisdom, wisdomTimer]);

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS FOR STUDENT ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSubmitProjectSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrlInput.trim()) {
      showToast('Please enter your GitHub repository link.');
      return;
    }
    setSubmittingSolution(true);

    setTimeout(() => {
      setSubmittingSolution(false);
      setIsSubmitSolutionModalOpen(false);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      // Update problem status
      if (selectedProblem) {
        setProblems((prev) =>
          prev.map((p) => (p.id === selectedProblem.id ? { ...p, status: 'under_review' } : p))
        );

        // Prepend to professional candidate review console
        const newSubmission: CandidateSolutionSubmission = {
          id: `sub-${Date.now()}`,
          problemId: selectedProblem.id,
          problemQuestion: selectedProblem.question,
          studentName: activeUserName,
          studentCollege: activeUserInstitution,
          studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          repoUrl: repoUrlInput.trim(),
          liveDemoUrl: liveUrlInput.trim() || undefined,
          approachSummary: approachSummaryInput.trim() || 'Implemented core architecture with full test verification.',
          testsPassed: `${selectedProblem.testCasesCount}/${selectedProblem.testCasesCount} tests passed (100%)`,
          submittedAt: 'Just now',
          status: 'pending'
        };
        setCandidateSubmissions([newSubmission, ...candidateSubmissions]);
      }

      showToast('Solution submitted directly to Senior Alumni! They will review your repository diff.');
      setRepoUrlInput('');
      setLiveUrlInput('');
      setApproachSummaryInput('');
    }, 900);
  };

  const handleConfirmConsultBooking = () => {
    setBookingModalOpen(false);
    showToast(`Confirmed! 20-min consult booked with ${selectedExpert?.name || 'Expert'}. Calendar invite dispatched.`);
  };

  const handleSendManualQueueNote = (e: React.FormEvent) => {
    e.preventDefault();
    setManualNoteModalOpen(false);
    showToast(`Note submitted to ${manualNoteSenior}'s manual triage queue!`);
    setManualNoteText('');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS FOR ALUMNI / PROFESSIONAL ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePostNewProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblemQuestion.trim()) return;

    const newProblem: AlumniProblem = {
      id: `prob-${Date.now()}`,
      category: newProblemCategory,
      cardVariant: newProblemCategory === 'Housing' || newProblemCategory === 'Consumer Services' ? 'blue' : 'charcoal',
      question: newProblemQuestion.trim(),
      alumniName: activeUserName,
      alumniTitle: 'Senior Engineering Architect',
      alumniCompany: newProblemCompany.trim() || 'TechCorp',
      bountyReward: newProblemReward.trim() || '₹25,000 / $300 USDC',
      rewardType: 'USDC',
      requiredTech: ['Next.js', 'PostgreSQL', 'Docker', 'FastAPI'],
      context: newProblemContext.trim() || 'Real production problem statement requiring AST-verified architecture.',
      starterRepoUrl: newProblemRepo.trim() || 'https://github.com/kin-network/starter',
      deadline: '7 days left',
      testCasesCount: 20,
      status: 'open'
    };

    setProblems([newProblem, ...problems]);
    setIsPostProblemModalOpen(false);
    showToast('New Problem Statement posted to KIN Challenge Board!');
    setNewProblemQuestion('');
    setNewProblemContext('');
  };

  const handleReviewSubmission = (subId: string, action: 'accepted' | 'changes_requested' | 'rejected') => {
    setCandidateSubmissions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: action } : s))
    );
    if (action === 'accepted') {
      try {
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.5 } });
      } catch (e) {}
      showToast('Candidate PR Accepted! Fast-Track Interview Call invitation generated.');
    } else if (action === 'changes_requested') {
      showToast('Changes requested sent to student with test case notes.');
    } else {
      showToast('Submission declined.');
    }
  };

  const handlePendingQueueAction = (id: string, action: 'approve' | 'decline') => {
    const student = pendingQueue.find((p) => p.id === id);
    setPendingQueue((prev) => prev.filter((p) => p.id !== id));
    showToast(action === 'approve' ? `Connected with ${student?.name}!` : `Declined request from ${student?.name}.`);
  };

  const handleInstantSettlementPayout = () => {
    showToast('Instant Settlement Triggered: ₹6,000 transferred to linked corporate account via NEFT.');
  };

  const handleSocialPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    const post: SocialFeedItem = {
      id: Date.now(),
      author: {
        name: activeUserName,
        role: networkRole === 'student' ? 'Student • Batch 2026' : 'Senior SDE @ Uber • Verified Alumni',
        institution: activeUserInstitution,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        verified: true
      },
      content: newPostContent.trim(),
      timestamp: 'Just now',
      mutualConnections: 3,
      tags: ['#KIN', '#ProofOfWork'],
      likes: 1,
      connected: true
    };
    setSocialFeed([post, ...socialFeed]);
    setNewPostContent('');
    showToast('Posted to professional network stream.');
  };

  const handleGhostPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGhostText.trim()) return;
    const gPost = {
      id: `g-${Date.now()}`,
      persona: networkRole === 'student' ? 'Ghost-Cadet-108' : 'Ghost-Architect-402',
      role: networkRole === 'student' ? 'Student • Verified' : 'Staff Architect • Anonymous',
      content: newGhostText.trim(),
      timestamp: 'Just now',
      likes: 1,
      replies: 0
    };
    setGhostPosts([gPost, ...ghostPosts]);
    setNewGhostText('');
    showToast('Candid insight posted to Kin Ghost Mode (Zero identity leaked).');
  };

  // Nav Items definition based on role
  const studentNavItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutGrid },
    { id: 'problems' as const, label: 'Alumni Problems', icon: Trophy },
    { id: 'outreach' as const, label: 'Auto-Connect', icon: ShieldCheck },
    { id: 'time-machine' as const, label: 'Time Machine', icon: History },
    { id: 'doorway' as const, label: '20-Min Doorway', icon: Briefcase },
    { id: 'wisdom' as const, label: 'Wisdom Capsule', icon: Sparkles },
    { id: 'radar' as const, label: 'Talent Radar', icon: Radio },
    { id: 'community' as const, label: 'Network & Ghost', icon: Users },
  ];

  const alumniNavItems = [
    { id: 'overview' as const, label: 'Command Center', icon: LayoutGrid },
    { id: 'problems' as const, label: 'Problem Statements', icon: Trophy },
    { id: 'firewall' as const, label: 'Firewall Shield', icon: ShieldCheck },
    { id: 'time-machine' as const, label: 'Pathway Publisher', icon: History },
    { id: 'doorway' as const, label: 'Consults & Payouts', icon: DollarSign },
    { id: 'wisdom' as const, label: 'Wisdom Cockpit', icon: Sparkles },
    { id: 'radar' as const, label: 'Talent Scout', icon: Radio },
    { id: 'community' as const, label: 'Network & Ghost', icon: Users },
  ];

  const activeNavList = networkRole === 'student' ? studentNavItems : alumniNavItems;
  const currentTourStep = KIN_WALKTHROUGH[mascotStepIndex] || KIN_WALKTHROUGH[0];

  // Filtered problems list
  const filteredProblems = problems.filter((p) => {
    if (problemCategoryFilter === 'All') return true;
    return p.category.toLowerCase() === problemCategoryFilter.toLowerCase();
  });

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
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center px-3 sm:px-6 lg:px-8 pt-4 pb-24">
        {/* ─── UNIVERSAL TOPBAR WITH 3D LOGO & EVALUATOR ROLE SWITCHER ─── */}
        <header className="w-full max-w-[1360px] mb-3 flex flex-wrap items-center justify-between gap-3 bg-white/70 backdrop-blur-xl border border-white/60 p-2.5 px-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          {/* Left: Home link and 3D Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 hover:bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all shadow-xs"
              title="Return to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Home</span>
            </Link>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden filter drop-shadow-sm group-hover:scale-105 transition-transform">
                <Image
                  src="/images/kin_logo.png"
                  alt="KIN Logo"
                  width={32}
                  height={32}
                  priority
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-[#E25C38] transition-colors">
                KIN
              </span>
            </Link>
          </div>

          {/* Center: Glassmorphic Evaluator Role Switcher Pill */}
          <div className="flex items-center p-1 rounded-full bg-slate-100/80 border border-slate-200/80 shadow-inner">
            <button
              onClick={() => handleRoleToggle('student')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                networkRole === 'student'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎓 Student Dashboard</span>
            </button>
            <button
              onClick={() => handleRoleToggle('alumni')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                networkRole === 'alumni'
                  ? 'bg-[#E25C38] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>💼 Professional Dashboard</span>
            </button>
          </div>

          {/* Right: Resume Upload & Profile Dropdown */}
          <div className="flex items-center gap-2">
            <button
              onClick={openUploadResumeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 transition-all shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#E25C38]" />
              <span className="hidden sm:inline">Upload Resume / CV</span>
            </button>

            {/* User Profile Avatar with Sign Out Popover */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-xs cursor-pointer"
              >
                {userInitial || 'D'}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-100 p-2 shadow-2xl z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{activeUserName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{activeUserInstitution}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      openUploadResumeModal();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#E25C38]" />
                    <span>Upload New CV</span>
                  </button>
                  <button
                    onClick={async () => {
                      setProfileMenuOpen(false);
                      await logout();
                      showToast('Signed out of KIN.');
                      router.push('/');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── MAIN CONTENT VIEWPORT ─── */}
        <main className="w-full max-w-[1360px] flex-1 flex flex-col min-h-[calc(100vh-140px)]">
          <div className="flex-1 w-full rounded-[36px] bg-white/25 border border-white/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.04),_inset_0_1.5px_2px_rgba(255,255,255,0.7)] p-4 sm:p-7 flex flex-col justify-between transition-all">
            
            {/* ═══════════════════════════════════════════════════════════════════
                STUDENT DASHBOARD WORKSPACE (8 DEDICATED TABS)
                ═══════════════════════════════════════════════════════════════════ */}
            {networkRole === 'student' && (
              <div className="flex-1 flex flex-col justify-between w-full">
                
                {/* 1. STUDENT OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div key="student-overview" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Career Readiness</span>
                        <div className="my-2">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">68%</span>
                          <div className="w-full h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500">Target Role: Staff AI</span>
                      </div>

                      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Bounties Joined</span>
                        <div className="my-2">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">2</span>
                          <span className="text-xs text-amber-600 font-bold ml-1.5">Open Challenges</span>
                        </div>
                        <span className="text-[10px] text-slate-500">₹48,000 Potential Reward</span>
                      </div>

                      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Eligible Connections</span>
                        <div className="my-2">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">8</span>
                          <span className="text-xs text-emerald-600 font-bold ml-1.5">Alumni Matching</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Uber, Google, Apollo</span>
                      </div>

                      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Upcoming 20-Min Consult</span>
                        <div className="my-2">
                          <span className="text-sm font-black text-slate-900 block truncate">Sat 3:00 PM</span>
                          <span className="text-xs text-slate-600 truncate block">with Rahul Mehta (Uber)</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">Confirmed Slot</span>
                      </div>
                    </div>

                    {/* Robot Mascot Tip Card */}
                    <div className="p-4 px-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20 shadow-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-xs shrink-0">
                          <Sparkles className="w-5 h-5 text-[#E25C38]" />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 font-medium">
                          <strong>Tip from Kin:</strong> Complete your Docker milestone to unlock auto-connect for 4 Senior Engineers at Microsoft and Uber!
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('problems')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shrink-0 transition-all cursor-pointer shadow-xs"
                      >
                        Solve Docker Problem
                      </button>
                    </div>

                    {/* Main 2-Col Grid: Career Timeline + GitHub Velocity */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Career Journey Timeline (7 cols) */}
                      <div className="lg:col-span-7 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">Career Trajectory & Transition Milestones</h3>
                              <p className="text-xs text-slate-500">Verified progress extracted from CV & GitHub</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                              {activeCareerMilestones[selectedMilestoneIndex]?.period || '2026'}
                            </span>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 mb-4">
                            <h4 className="text-base font-bold text-slate-900">
                              {activeCareerMilestones[selectedMilestoneIndex]?.role || activeUserRole}
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {activeCareerMilestones[selectedMilestoneIndex]?.company || activeUserInstitution}
                            </p>
                            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                              {activeCareerMilestones[selectedMilestoneIndex]?.description || 'Building production-grade full-stack architectures and AI model pipelines with automated test suites.'}
                            </p>
                          </div>

                          {/* Milestone Step Selector */}
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {activeCareerMilestones.map((m: any, idx: number) => (
                              <button
                                key={`milestone-${m.period || 'p'}-${idx}`}
                                onClick={() => setSelectedMilestoneIndex(idx)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                  selectedMilestoneIndex === idx
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {m.period}: {m.role.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span>Verification Source: Local AST Parser & GitHub</span>
                          <span className="font-bold text-emerald-600">Active Pipeline</span>
                        </div>
                      </div>

                      {/* Right: GitHub Velocity & Telemetry (5 cols) */}
                      <div className="lg:col-span-5 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                              <Github className="w-4 h-4 text-slate-900" />
                              <span>GitHub Proof-of-Work</span>
                            </h3>
                            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                              AST Verified
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Commits Analyzed</span>
                              <p className="text-xl font-black text-slate-900 mt-1">
                                {githubData?.stats?.recentCommitsCount || '48'}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Code Velocity</span>
                              <p className="text-xl font-black text-emerald-600 mt-1">Top 4%</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-700 block">Verified Tech Stack</span>
                            <div className="flex flex-wrap gap-1.5">
                              {['TypeScript', 'Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'TailwindCSS'].map((tech) => (
                                <span key={tech} className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Synced user: {activeGithubUsername}</span>
                          <a href={activeGithubUrl} target="_blank" rel="noreferrer" className="font-bold text-slate-900 hover:text-[#E25C38] flex items-center gap-1">
                            <span>Open Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. STUDENT ALUMNI PROBLEMS TAB (IMAGE 3 UI) */}
                {activeTab === 'problems' && (
                  <div key="student-problems" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    {/* Header & Category Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          Alumni Problem Statements & Architecture Bounties
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                          Real bottlenecks posted by verified senior alumni. Click any card to submit your project or GitHub repository for review.
                        </p>
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                        {['All', 'Healthcare', 'Blockchain', 'FinTech', 'Fake News', 'Hardware', 'Automotive', 'Housing', 'Career'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setProblemCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                              problemCategoryFilter === cat
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image 3 High-Contrast Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredProblems.map((prob) => {
                        const isBlue = prob.cardVariant === 'blue';
                        const isCharcoal = prob.cardVariant === 'charcoal';
                        const isWhite = prob.cardVariant === 'white';

                        return (
                          <div
                            key={prob.id}
                            onClick={() => {
                              setSelectedProblem(prob);
                              setIsSubmitSolutionModalOpen(true);
                            }}
                            className={`rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 group relative ${
                              isBlue
                                ? 'bg-[#0047FF] text-white shadow-[0_8px_30px_rgba(0,71,255,0.22)]'
                                : isCharcoal
                                ? 'bg-[#181A20] text-white border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
                                : 'bg-white text-slate-900 border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)]'
                            }`}
                          >
                            {/* Card Top: Category Pill + Circular Arrow */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                    isBlue
                                      ? 'bg-white/20 text-white border border-white/20'
                                      : isCharcoal
                                      ? 'bg-white/10 text-white border border-white/10'
                                      : 'bg-slate-100 text-slate-800 border border-slate-200/60'
                                  }`}
                                >
                                  {prob.category}
                                </span>

                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-0.5 ${
                                    isBlue
                                      ? 'border border-white/30 text-white'
                                      : isCharcoal
                                      ? 'border border-white/20 text-white'
                                      : 'border border-slate-300 text-slate-700'
                                  }`}
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                              </div>

                              {/* Provocative Question in Punchy Typography */}
                              <h3
                                className={`text-base font-bold leading-snug tracking-tight mb-4 ${
                                  isBlue || isCharcoal ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {prob.question}
                              </h3>
                            </div>

                            {/* Card Footer: Alumni Poster & Reward */}
                            <div className="pt-3 border-t border-current/10 flex flex-col gap-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className={isBlue || isCharcoal ? 'text-white/80' : 'text-slate-600'}>
                                  {prob.alumniName}
                                </span>
                                <span className="font-bold text-[11px] truncate max-w-[130px]">
                                  {prob.alumniCompany}
                                </span>
                              </div>

                              <div className="flex items-center justify-between mt-1">
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                    isBlue
                                      ? 'bg-white text-[#0047FF]'
                                      : isCharcoal
                                      ? 'bg-[#E25C38] text-white'
                                      : 'bg-slate-900 text-white'
                                  }`}
                                >
                                  {prob.bountyReward}
                                </span>

                                <span
                                  className={`text-[11px] font-bold flex items-center gap-1 group-hover:underline ${
                                    isBlue || isCharcoal ? 'text-white' : 'text-[#E25C38]'
                                  }`}
                                >
                                  <span>Submit Solution</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. STUDENT AUTO-CONNECT & SENIOR OUTREACH TAB */}
                {activeTab === 'outreach' && (
                  <div key="student-outreach" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Alumni Outreach & Instant Connection Eligibility (The Unlocker)
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        Verified alumni deploy automated criteria firewalls. Match their score to connect instantly or send a personalized note to their manual queue.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      {/* Left: Senior Cards */}
                      <div className="lg:col-span-2 space-y-4">
                        {[
                          {
                            name: 'Rahul Mehta',
                            role: 'Staff Platform Engineer @ Uber',
                            req: 'Requires ≥ 75% match, React, Docker, and min 15 GitHub commits.',
                            currentMatch: 62,
                            targetMatch: 75,
                            met: ['React (AST Verified)', '18 Commits (Met)'],
                            missing: ['Docker (Missing on profile)']
                          },
                          {
                            name: 'Dr. Priya Sharma',
                            role: 'Lead Bioinformatician @ Apollo & Epic',
                            req: 'Requires ≥ 70% match, Python, FHIR Standards, and min 20 commits.',
                            currentMatch: 78,
                            targetMatch: 70,
                            met: ['Python (Verified)', 'FHIR Linkage (Met)', '22 Commits (Met)'],
                            missing: []
                          },
                          {
                            name: 'Siddharth Verma',
                            role: 'Web3 Protocol Lead @ Polygon',
                            req: 'Requires ≥ 80% match, Solidity, ERC-4337, and min 25 commits.',
                            currentMatch: 58,
                            targetMatch: 80,
                            met: ['JavaScript (Met)'],
                            missing: ['Solidity', 'Account Abstraction']
                          }
                        ].map((sr) => (
                          <div key={sr.name} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div>
                                <h3 className="text-base font-bold text-slate-900">{sr.name}</h3>
                                <p className="text-xs text-slate-600 font-medium">{sr.role}</p>
                              </div>
                              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                                sr.currentMatch >= sr.targetMatch
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                Match: {sr.currentMatch}% / {sr.targetMatch}%
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <strong>Policy:</strong> {sr.req}
                            </p>

                            {/* Checklist */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs">
                              <div>
                                <span className="font-bold text-emerald-600 block mb-1">✓ Met Criteria:</span>
                                {sr.met.map((m) => (
                                  <div key={m} className="text-slate-700 flex items-center gap-1.5">• {m}</div>
                                ))}
                              </div>
                              {sr.missing.length > 0 && (
                                <div>
                                  <span className="font-bold text-rose-600 block mb-1">✗ Missing to Unlock Auto-Accept:</span>
                                  {sr.missing.map((m) => (
                                    <div key={m} className="text-slate-700 flex items-center gap-1.5">• {m}</div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                              {sr.currentMatch >= sr.targetMatch ? (
                                <button
                                  onClick={() => showToast(`Smart Auto-Connect handshake triggered with ${sr.name}! Accepted.`)}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Instant Connect (Shield Passed)</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setManualNoteSenior(sr.name);
                                      setManualNoteModalOpen(true);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                  >
                                    Submit to {sr.name.split(' ')[0]}&apos;s Manual Queue
                                  </button>
                                  <button
                                    onClick={() => setActiveTab('problems')}
                                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#E25C38] text-xs font-bold transition-all border border-amber-200 cursor-pointer"
                                  >
                                    Solve Bounty to Unlock Auto-Connect
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right: Tip & Telemetry */}
                      <div className="space-y-4">
                        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#E25C38] flex items-center justify-center mb-3">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <h3 className="text-base font-bold text-slate-900">Why Auto-Connect Works</h3>
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            Senior alumni receive dozens of cold LinkedIn messages daily. Kin&apos;s AST validator proves your code quality upfront so seniors auto-accept you without hesitation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. STUDENT CAREER TIME MACHINE TAB */}
                {activeTab === 'time-machine' && (
                  <div key="student-time-machine" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          Career Time Machine (The Skill-Gap Explorer)
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                          Benchmark your trajectory against alumni who successfully stepped into senior leadership.
                        </p>
                      </div>

                      {/* Target Role Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">Target Role:</span>
                        <select
                          value={targetRoleSelection}
                          onChange={(e) => setTargetRoleSelection(e.target.value)}
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 shadow-xs focus:outline-none"
                        >
                          <option value="Staff AI Engineer">Staff AI Engineer</option>
                          <option value="FinTech Quant">FinTech Quant Lead</option>
                          <option value="Founding Frontend Engineer">Founding Frontend Engineer</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Timeline Progression */}
                      <div className="lg:col-span-7 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
                        <h3 className="text-base font-bold text-slate-900">Alumni Verified Milestone Path for {targetRoleSelection}</h3>
                        
                        <div className="space-y-3">
                          {[
                            { year: 'Year 1: University & Intern', desc: 'Shipped Next.js full-stack apps, mastered React & relational schemas. 300+ GitHub commits.' },
                            { year: 'Year 2: Associate SDE', desc: 'Implemented Docker containerization, Kafka event pipelines, and production CI/CD.' },
                            { year: 'Year 4: Senior SDE', desc: 'Designed high-availability microservices handling 25k req/sec with sub-50ms p99 latency.' },
                            { year: 'Year 6: Staff Architect', desc: 'Technical strategy, cross-org distributed consensus design, and mentorship of 18 engineers.' },
                          ].map((step, idx) => (
                            <div key={step.year} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3">
                              <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{step.year}</h4>
                                <p className="text-xs text-slate-600 mt-0.5">{step.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deterministic Skill Gap Analysis */}
                      <div className="lg:col-span-5 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900">Deterministic Skill Gap</h3>
                            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              64% Match
                            </span>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between font-bold">
                                <span>React & Frontend Engineering</span>
                                <span className="text-emerald-600">100% (Verified)</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between font-bold">
                                <span>FastAPI & Python AI Pipelines</span>
                                <span className="text-emerald-600">85% (Verified)</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between font-bold">
                                <span>Docker & Container Orchestration</span>
                                <span className="text-rose-600">Missing on Profile</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: '20%' }} />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between font-bold">
                                <span>High-Throughput Kafka Streams</span>
                                <span className="text-amber-600">In Progress (40%)</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab('problems')}
                          className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Solve Docker Bounty to Close Gap</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. STUDENT 20-MINUTE DOORWAY TAB */}
                {activeTab === 'doorway' && (
                  <div key="student-doorway" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        20-Minute Doorway (Book a Verified Mentorship Session)
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        High-leverage, 100% human-verified 20-min consults protected by Kin&apos;s anti-AI-slop guarantee.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {[
                        { name: 'Rahul Mehta', role: 'Staff SDE @ Uber', fee: '₹800 for 20 mins', rating: '4.9 ★', specialty: 'System Design Drill', exp: '8 yrs exp' },
                        { name: 'Dr. Priya Sharma', role: 'Lead Bioinformatician @ Apollo', fee: '₹950 for 20 mins', rating: '5.0 ★', specialty: 'AI / Healthcare Architecture', exp: '10 yrs exp' },
                        { name: 'Siddharth Verma', role: 'Protocol Lead @ Polygon', fee: '₹1,000 for 20 mins', rating: '4.9 ★', specialty: 'Web3 & Smart Contract Audit', exp: '6 yrs exp' }
                      ].map((exp) => (
                        <div key={exp.name} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                {exp.specialty}
                              </span>
                              <span className="text-xs font-bold text-slate-900">{exp.rating}</span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900 mt-2">{exp.name}</h3>
                            <p className="text-xs text-slate-600">{exp.role}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{exp.exp}</p>

                            <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                              <span className="font-bold text-slate-900 block">{exp.fee}</span>
                              <span className="text-[10px] text-slate-500">50% supports student endowments</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedExpert(exp);
                              setBookingModalOpen(true);
                            }}
                            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Book 20-Min Slot</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. STUDENT WISDOM CAPSULE TAB */}
                {activeTab === 'wisdom' && (
                  <div key="student-wisdom" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Wisdom Capsule (90-Second Mock Arena)
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        High-velocity practice prompts. Deliver concise technical explanations in 90 seconds and receive evaluated scorecards.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Prompter & Timer Screen */}
                      <div className="lg:col-span-7 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-mono font-bold text-[#E25C38] uppercase">Prompt #104 • Distributed Systems</span>
                            <span className="text-lg font-mono font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                              {Math.floor(wisdomTimer / 60)}:{String(wisdomTimer % 60).padStart(2, '0')}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 mb-4 leading-snug">
                            &ldquo;{wisdomActivePrompt}&rdquo;
                          </h3>

                          {isRecordingWisdom && (
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 mb-4 animate-pulse">
                              <span className="w-3 h-3 rounded-full bg-rose-600" />
                              <span className="font-bold">Recording simulated audio answer... Speak clearly into microphone.</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                          {!isRecordingWisdom ? (
                            <button
                              onClick={() => {
                                setWisdomTimer(90);
                                setIsRecordingWisdom(true);
                                showToast('Recording started! 90 seconds begins now.');
                              }}
                              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Start 90s Recording</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setIsRecordingWisdom(false);
                                showToast('Recording submitted for AI & Alumni scorecard evaluation!');
                              }}
                              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                            >
                              <Pause className="w-3.5 h-3.5" />
                              <span>Finish & Submit</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setIsRecordingWisdom(false);
                              setWisdomTimer(90);
                            }}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Past Scorecards Archive */}
                      <div className="lg:col-span-5 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
                        <h3 className="text-base font-bold text-slate-900">Evaluated Scorecard from Staff SDE</h3>
                        
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium text-slate-700">Technical Depth:</span>
                            <span className="font-bold text-slate-900">4 / 5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-slate-700">Clarity & Communication:</span>
                            <span className="font-bold text-slate-900">4.5 / 5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-slate-700">Structure & Brevity:</span>
                            <span className="font-bold text-slate-900">4 / 5</span>
                          </div>

                          <div className="pt-2 border-t border-slate-200 text-slate-700 leading-relaxed">
                            <strong>Alumni Feedback:</strong> &ldquo;Strong breakdown of circuit breakers and database connection pooling. Recommend mentioning exact latency metrics (e.g. p99 sub-30ms) earlier in the pitch.&rdquo;
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. STUDENT RADAR TAB */}
                {activeTab === 'radar' && (
                  <div key="student-radar" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Talent Radar (Transferable Opportunities)
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        Mapping your software engineering skills to high-yield adjacent fields that recruiters overlook.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {[
                        { domain: 'Autonomous Robotics', match: '84% Match', skills: 'C++, Real-Time Sockets, Computer Vision', comp: '₹35L - ₹55L CTC', comps: 'Skydio, GreyOrange, Tesla Autopilot' },
                        { domain: 'Quantitative Trading', match: '78% Match', skills: 'Low Latency Python, Time Series, Concurrency', comp: '₹45L - ₹90L CTC', comps: 'Tower Research, Jane Street, Graviton' },
                        { domain: 'Genomics & Neurotech', match: '72% Match', skills: 'FastAPI, Vector Similarity, FHIR Standards', comp: '₹30L - ₹50L CTC', comps: 'Apollo Health AI, 10x Genomics, Neuralink' }
                      ].map((rad) => (
                        <div key={rad.domain} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                {rad.match}
                              </span>
                              <span className="text-xs font-bold text-slate-900">{rad.comp}</span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900">{rad.domain}</h3>
                            <p className="text-xs text-slate-600 mt-2"><strong>Transferable Tech:</strong> {rad.skills}</p>
                            <p className="text-xs text-slate-500 mt-1"><strong>Hiring Labs:</strong> {rad.comps}</p>
                          </div>

                          <button
                            onClick={() => showToast(`Scout alert subscribed for ${rad.domain} roles!`)}
                            className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Set Radar Alert
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. STUDENT & PROFESSIONAL COMMUNITY & SOCIAL TAB */}
                {activeTab === 'community' && (
                  <div key="student-community" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          Professional & Ghost Social Network
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                          Share engineering milestones or switch to Kin Ghost Mode for candid, anonymous insights.
                        </p>
                      </div>

                      {/* Sub-Tab Switcher */}
                      <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200">
                        <button
                          onClick={() => setCommunitySubTab('feed')}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            communitySubTab === 'feed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          🌐 Public Feed
                        </button>
                        <button
                          onClick={() => setCommunitySubTab('ghost')}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            communitySubTab === 'ghost' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          👻 Kin Ghost Mode
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Feed Stream (8 cols) */}
                      <div className="lg:col-span-8 space-y-4">
                        {communitySubTab === 'feed' ? (
                          <>
                            {/* Public Composer */}
                            <form onSubmit={handleSocialPost} className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                              <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="Share a project breakthrough, question, or milestone with verified alumni..."
                                rows={2}
                                className="w-full text-xs text-slate-900 placeholder-slate-400 bg-transparent resize-none focus:outline-none"
                              />
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <span className="text-[10px] text-slate-500 font-bold">Posting as: {activeUserName} (Student)</span>
                                <button
                                  type="submit"
                                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Post</span>
                                </button>
                              </div>
                            </form>

                            {/* Public Posts */}
                            {socialFeed.map((post) => (
                              <div key={post.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                                      {post.author.name.charAt(0)}
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-900">{post.author.name}</h4>
                                      <span className="text-[10px] text-slate-500">{post.author.role}</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-slate-400">{post.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-800 leading-relaxed my-2">{post.content}</p>
                                <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500 font-medium">
                                  <button onClick={() => showToast('Endorsed post!')} className="hover:text-[#E25C38] flex items-center gap-1 cursor-pointer">
                                    <Heart className="w-3.5 h-3.5" />
                                    <span>{post.likes}</span>
                                  </button>
                                  <button onClick={() => showToast('Opening comments...')} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>Comment</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            {/* Ghost Mode Composer */}
                            <form onSubmit={handleGhostPost} className="p-4 rounded-3xl bg-[#181A20] text-white border border-white/10 shadow-lg">
                              <div className="flex items-center gap-2 mb-2 text-xs font-mono text-amber-400">
                                <span>👻 Posting as: Ghost-Cadet-108 (Cryptographically Pseudonymous)</span>
                              </div>
                              <textarea
                                value={newGhostText}
                                onChange={(e) => setNewGhostText(e.target.value)}
                                placeholder="Ask candid questions about placement realities, real compensation, or imposter syndrome safely..."
                                rows={2}
                                className="w-full text-xs text-white placeholder-slate-400 bg-transparent resize-none focus:outline-none"
                              />
                              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                <span className="text-[10px] text-slate-400">Zero corporate or college affiliation leaked</span>
                                <button
                                  type="submit"
                                  className="px-4 py-1.5 rounded-xl bg-[#E25C38] hover:bg-[#c94927] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Post Ghost Insight</span>
                                </button>
                              </div>
                            </form>

                            {/* Ghost Posts */}
                            {ghostPosts.map((g) => (
                              <div key={g.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono">
                                      👻
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-900">{g.persona}</span>
                                    <span className="text-[10px] text-slate-500">• {g.role}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">{g.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-800 leading-relaxed my-2">{g.content}</p>
                                <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                                  <button onClick={() => showToast('Upvoted anonymous insight!')} className="hover:text-[#E25C38] flex items-center gap-1 cursor-pointer">
                                    <Heart className="w-3.5 h-3.5" />
                                    <span>{g.likes}</span>
                                  </button>
                                  <span>{g.replies} replies</span>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Right: People You May Know (4 cols) */}
                      <div className="lg:col-span-4 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
                        <h3 className="text-base font-bold text-slate-900">People You May Know</h3>
                        <p className="text-xs text-slate-500">Alumni from your department & batchmates</p>

                        <div className="space-y-3">
                          {[
                            { name: 'Kavya Verma', role: 'SDE-1 @ Zomato', dept: 'IIITD CSE 2024' },
                            { name: 'Aditya Nair', role: 'Quant Analyst @ Tower', dept: 'IIITD CSAM 2023' },
                            { name: 'Pooja Iyer', role: 'Bioinformatician @ Fortis', dept: 'IIITD CB 2024' }
                          ].map((p) => (
                            <div key={p.name} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                                <span className="text-[10px] text-slate-500 block">{p.role}</span>
                              </div>
                              <button
                                onClick={() => showToast(`Smart connect requested with ${p.name}!`)}
                                className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer shadow-2xs"
                              >
                                Connect
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                WORKING PROFESSIONAL COMMAND CENTER WORKSPACE (8 DEDICATED TABS)
                ═══════════════════════════════════════════════════════════════════ */}
            {networkRole === 'alumni' && (
              <div className="flex-1 flex flex-col justify-between w-full">
                
                {/* 1. ALUMNI OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div key="alumni-overview" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Connection Shield</span>
                        <div className="my-2">
                          <span className="text-2xl sm:text-3xl font-black text-emerald-600">Active</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Firewall filtering cold spam</span>
                      </div>

                      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Student Requests</span>
                        <div className="my-2">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">{pendingQueue.length}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Awaiting manual triage</span>
                      </div>

                      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bounties Sponsored</span>
                        <div className="my-2">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">1</span>
                          <span className="text-xs text-amber-600 font-bold ml-1">$150 open</span>
                        </div>
                        <span className="text-[10px] text-slate-500">2 candidate solutions</span>
                      </div>

                      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Consultation Earnings (50%)</span>
                        <div className="my-2">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">₹4,800</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">Ready for instant payout</span>
                      </div>
                    </div>

                    {/* Tip from Kin */}
                    <div className="p-4 px-5 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 shadow-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-xs shrink-0">
                          <Sparkles className="w-5 h-5 text-[#E25C38]" />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 font-medium">
                          <strong>Tip from Kin:</strong> You have 2 candidate PRs waiting for review on your &apos;Patient Duplicate Records&apos; problem!
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('problems')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shrink-0 transition-all cursor-pointer shadow-xs"
                      >
                        Review PRs
                      </button>
                    </div>

                    {/* Quick Command Panels */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Post Engineering Bounty</h3>
                          <p className="text-xs text-slate-600 mt-1">Sponsor challenge statement with USDC or referrals.</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('problems');
                            setIsPostProblemModalOpen(true);
                          }}
                          className="mt-4 w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all cursor-pointer"
                        >
                          + Post New Problem Statement
                        </button>
                      </div>

                      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Adjust Outreach Firewall</h3>
                          <p className="text-xs text-slate-600 mt-1">Tweak match threshold & minimum commit requirements.</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('firewall')}
                          className="mt-4 w-full py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          Configure Firewall Shield
                        </button>
                      </div>

                      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Consultation Settlements</h3>
                          <p className="text-xs text-slate-600 mt-1">₹6,000 net earned across 12 completed sessions.</p>
                        </div>
                        <button
                          onClick={handleInstantSettlementPayout}
                          className="mt-4 w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer"
                        >
                          Request Instant Payout
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ALUMNI PROBLEMS & PR SUBMISSION REVIEW CONSOLE */}
                {activeTab === 'problems' && (
                  <div key="alumni-problems" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          Company Problem Statements & Submission Review
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                          Review candidate GitHub repositories, inspect diffs, and grant interview referrals.
                        </p>
                      </div>

                      <button
                        onClick={() => setIsPostProblemModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Post New Problem Statement</span>
                      </button>
                    </div>

                    {/* Candidate Submissions Review Console */}
                    <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-900">Candidate PR & Solution Queue</h3>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {candidateSubmissions.length} Submissions Received
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 border-y border-slate-100">
                            <tr>
                              <th className="py-2.5 px-3">Student Builder</th>
                              <th className="py-2.5 px-3">Problem Statement</th>
                              <th className="py-2.5 px-3">Repo & Test Pass</th>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {candidateSubmissions.map((sub) => (
                              <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3 px-3">
                                  <span className="font-bold text-slate-900 block">{sub.studentName}</span>
                                  <span className="text-[10px] text-slate-500">{sub.studentCollege}</span>
                                </td>
                                <td className="py-3 px-3 max-w-xs">
                                  <span className="font-medium truncate block">{sub.problemQuestion}</span>
                                  <span className="text-[10px] text-slate-500">{sub.submittedAt}</span>
                                </td>
                                <td className="py-3 px-3">
                                  <a href={sub.repoUrl} target="_blank" rel="noreferrer" className="font-bold text-slate-900 hover:text-[#E25C38] flex items-center gap-1">
                                    <Github className="w-3.5 h-3.5" />
                                    <span>View GitHub Repo</span>
                                  </a>
                                  <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                                    {sub.testsPassed}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    sub.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                                    sub.status === 'changes_requested' ? 'bg-amber-100 text-amber-800' :
                                    sub.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {sub.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  {sub.status === 'pending' ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => handleReviewSubmission(sub.id, 'accepted')}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                                      >
                                        Accept & Refer
                                      </button>
                                      <button
                                        onClick={() => handleReviewSubmission(sub.id, 'changes_requested')}
                                        className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[11px] cursor-pointer"
                                      >
                                        Changes
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-bold">Reviewed</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ALUMNI AUTO-CONNECT FIREWALL TAB */}
                {activeTab === 'firewall' && (
                  <div key="alumni-firewall" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Outreach Firewall & Automated Acceptance Policies (The Gatekeeper)
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        Block unverified cold outreach. Candidates meeting your automated policy are admitted directly into your network.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Policy Control Console */}
                      <div className="lg:col-span-6 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <h3 className="text-base font-bold text-slate-900">Firewall Shield Policy</h3>
                            <p className="text-xs text-slate-500">Automated gatekeeper rule set</p>
                          </div>
                          <button
                            onClick={() => {
                              setFirewallActive(!firewallActive);
                              showToast(`Firewall shield ${!firewallActive ? 'Enabled' : 'Disabled'}`);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                              firewallActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {firewallActive ? 'Shield Active' : 'Shield Off'}
                          </button>
                        </div>

                        {/* Threshold Slider */}
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span>Auto-Accept Match Threshold:</span>
                            <span className="text-[#E25C38]">{firewallThreshold}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="100"
                            value={firewallThreshold}
                            onChange={(e) => setFirewallThreshold(Number(e.target.value))}
                            className="w-full accent-[#E25C38]"
                          />
                          <span className="text-[10px] text-slate-400">Students scoring ≥ {firewallThreshold}% bypass cold queues immediately.</span>
                        </div>

                        {/* Minimum GitHub Commits */}
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span>Minimum GitHub Commits Required:</span>
                            <span className="text-[#E25C38]">{firewallMinCommits} Commits</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            value={firewallMinCommits}
                            onChange={(e) => setFirewallMinCommits(Number(e.target.value))}
                            className="w-full accent-[#E25C38]"
                          />
                        </div>

                        {/* Required Skill Chips */}
                        <div>
                          <span className="text-xs font-bold text-slate-700 block mb-2">Mandatory Verified Skills (Select to require):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['React', 'Python', 'Go', 'Docker', 'PostgreSQL', 'FastAPI', 'Kubernetes'].map((sk) => {
                              const active = selectedFirewallSkills.includes(sk);
                              return (
                                <button
                                  key={sk}
                                  type="button"
                                  onClick={() => {
                                    if (active) setSelectedFirewallSkills(selectedFirewallSkills.filter((s) => s !== sk));
                                    else setSelectedFirewallSkills([...selectedFirewallSkills, sk]);
                                  }}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {sk} {active ? '✓' : '+'}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          onClick={() => showToast('Firewall policies saved and deployed to live gateway!')}
                          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          Save Policy Configuration
                        </button>
                      </div>

                      {/* Pending Review Queue Table */}
                      <div className="lg:col-span-6 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-bold text-slate-900">Manual Triage Queue ({pendingQueue.length})</h3>
                          <span className="text-[10px] text-slate-500">Did not meet automated threshold</span>
                        </div>

                        {pendingQueue.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-400">
                            No pending connection requests in queue.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {pendingQueue.map((item) => (
                              <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-slate-900">{item.name}</span>
                                    <span className="text-[10px] text-slate-500 ml-1.5">({item.college})</span>
                                  </div>
                                  <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                    {item.match}% Match
                                  </span>
                                </div>
                                <p className="text-[11px] text-rose-600 font-semibold mt-1">Missing: {item.missing}</p>
                                <p className="text-xs text-slate-700 mt-1 italic">&ldquo;{item.note}&rdquo;</p>
                                
                                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handlePendingQueueAction(item.id, 'decline')}
                                    className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                  <button
                                    onClick={() => handlePendingQueueAction(item.id, 'approve')}
                                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
                                  >
                                    Approve & Connect
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ALUMNI CAREER TIME MACHINE PUBLISHER TAB */}
                {activeTab === 'time-machine' && (
                  <div key="alumni-publisher" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Your Authentic Journey & Mentorship Footprint (Pathway Publisher)
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        Publish your real career progression milestones so juniors can benchmark their skill path against reality.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-8 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-900">Published Career Progression</h3>
                          <button
                            onClick={() => showToast('Opening milestone editor...')}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
                          >
                            + Add Career Milestone
                          </button>
                        </div>

                        <div className="space-y-3">
                          {[
                            { period: '2020 - 2021', role: 'Software Engineer Intern', comp: 'Microsoft', hurdles: 'Overcame multithreading race conditions in C++ telemetry services.' },
                            { period: '2021 - 2023', role: 'SDE-1', comp: 'Uber Core Platform', hurdles: 'Built asynchronous webhook retry workers processing 40M events/day.' },
                            { period: '2023 - Present', role: 'Senior Systems Architect', comp: 'Uber / TechCorp', hurdles: 'Driving zero-downtime database sharding and mentoring junior engineers.' }
                          ].map((step, idx) => (
                            <div key={`step-${step.period || 'p'}-${idx}`} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                                <span>{step.role} • {step.comp}</span>
                                <span className="font-mono text-slate-500">{step.period}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                                <strong>Hurdle Overcome:</strong> {step.hurdles}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="lg:col-span-4 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#E25C38] flex items-center justify-center mb-3">
                            <Users className="w-5 h-5" />
                          </div>
                          <h3 className="text-base font-bold text-slate-900">Student Benchmark Footprint</h3>
                          <div className="my-3">
                            <span className="text-3xl font-black text-slate-900">148</span>
                            <span className="text-xs text-slate-600 block mt-1">Students used your timeline as their target benchmark this month.</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                          Kin verified trajectory footprint
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. ALUMNI 20-MINUTE DOORWAY HOST & PAYOUTS TAB */}
                {activeTab === 'doorway' && (
                  <div key="alumni-doorway" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Consultation Availability & Financial Settlement
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        Host 20-minute paid sessions. 50% settles directly to your bank, 50% funds student hackathon endowments.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Rate Settings */}
                      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
                        <h3 className="text-base font-bold text-slate-900">Consultation Pricing</h3>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Set Fee per 20 Minutes:</label>
                          <input
                            type="text"
                            value={consultFeeSetting}
                            onChange={(e) => setConsultFeeSetting(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none"
                          />
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Your earnings: <strong>50%</strong> (e.g. ₹500/session). The remaining 50% funds competitive student grants.
                        </p>
                        <button
                          onClick={() => showToast('Consultation schedule & fee updated!')}
                          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
                        >
                          Save Pricing & Hours
                        </button>
                      </div>

                      {/* Revenue Ledger */}
                      <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-slate-900">Financial Ledger (50/50 Revenue Split)</h3>
                            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Verified Settlements
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-500 font-bold uppercase">Sessions Done</span>
                              <p className="text-2xl font-black text-slate-900 mt-1">{totalSessionsConducted}</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-500 font-bold uppercase">Gross Revenue</span>
                              <p className="text-2xl font-black text-slate-900 mt-1">₹12,000</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                              <span className="text-[10px] text-emerald-700 font-bold uppercase">Your 50% Share</span>
                              <p className="text-2xl font-black text-emerald-700 mt-1">₹6,000</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-600">Pending Instant Settlement: <strong>₹6,000</strong></span>
                          <button
                            onClick={handleInstantSettlementPayout}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Request Instant Settlement Payout
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. ALUMNI WISDOM CAPSULE INTERVIEWER COCKPIT TAB */}
                {activeTab === 'wisdom' && (
                  <div key="alumni-wisdom" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Wisdom Capsule Interviewer Cockpit
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        Listen to candidate 90-second voice pitches and grade them on technical depth and brevity.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-7 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-slate-500">Candidate: Darsh Ohri (IIIT Delhi)</span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">New Submission</span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900">
                          Prompt: &ldquo;Explain distributed consensus failure recovery in 90 seconds.&rdquo;
                        </h3>

                        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => showToast('Playing simulated candidate audio recording...')}
                              className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                            >
                              <Play className="w-4 h-4 ml-0.5" />
                            </button>
                            <div>
                              <span className="text-xs font-bold block">Darsh_Ohri_Consensus_Answer.wav</span>
                              <span className="text-[10px] text-slate-400">1:28 duration • Waveform clear</span>
                            </div>
                          </div>
                        </div>

                        {/* Grading Sliders */}
                        <div className="space-y-3 pt-2">
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span>Technical Depth:</span>
                              <span className="text-[#E25C38]">{wisdomDepthScore}/5</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={wisdomDepthScore}
                              onChange={(e) => setWisdomDepthScore(Number(e.target.value))}
                              className="w-full accent-[#E25C38]"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span>Clarity & Communication:</span>
                              <span className="text-[#E25C38]">{wisdomClarityScore}/5</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={wisdomClarityScore}
                              onChange={(e) => setWisdomClarityScore(Number(e.target.value))}
                              className="w-full accent-[#E25C38]"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span>Structure & Brevity:</span>
                              <span className="text-[#E25C38]">{wisdomBrevityScore}/5</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={wisdomBrevityScore}
                              onChange={(e) => setWisdomBrevityScore(Number(e.target.value))}
                              className="w-full accent-[#E25C38]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Feedback Submission */}
                      <div className="lg:col-span-5 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 mb-2">Provide Feedback & Tags</h3>
                          
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {['Strong architectural thinking', 'Add quantifiable metrics', 'Clear latency trade-offs', 'Great vocal pacing'].map((tag) => (
                              <button
                                key={tag}
                                onClick={() => setWisdomFeedbackAdvice((prev) => prev ? `${prev} ${tag}.` : `${tag}.`)}
                                className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>

                          <textarea
                            value={wisdomFeedbackAdvice}
                            onChange={(e) => setWisdomFeedbackAdvice(e.target.value)}
                            placeholder="Write constructive tactical advice for Darsh..."
                            rows={4}
                            className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={() => {
                            showToast('Scorecard & tactical advice submitted to candidate!');
                            setWisdomFeedbackAdvice('');
                          }}
                          className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
                        >
                          Submit Scorecard to Student
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. ALUMNI TALENT SCOUT RADAR TAB */}
                {activeTab === 'radar' && (
                  <div key="alumni-radar" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Unclaimed Talent Scout (Radar)
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        Discover high-performing students who have top commit velocity and bounty wins but are from non-target colleges or unplaced branches.
                      </p>
                    </div>

                    <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900">Unplaced Top Builders (AST Verified)</h3>
                        <span className="text-xs text-slate-500">Sorted by Commit Velocity & Bounty Wins</span>
                      </div>

                      <div className="space-y-3">
                        {[
                          { name: 'Darsh Ohri', college: 'IIIT Delhi (CSE Data Science)', velocity: 'Top 4% Velocity', topSkill: 'FastAPI, FHIR, Vector Search', bountyWins: '2 Bounties Won' },
                          { name: 'Aarav Sharma', college: 'Tier 3 Govt College (Electrical)', velocity: 'Top 2% Velocity', topSkill: 'Rust, WebUSB, Account Abstraction', bountyWins: '3 Bounties Won' },
                          { name: 'Sanya Mirza', college: 'SGSITS Indore (IT)', velocity: 'Top 5% Velocity', topSkill: 'Next.js, Solr, Predictive ML', bountyWins: '1 Bounty Won' }
                        ].map((cand) => (
                          <div key={cand.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900">{cand.name}</h4>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  {cand.velocity}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600">{cand.college}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5"><strong>Core:</strong> {cand.topSkill} • {cand.bountyWins}</p>
                            </div>

                            <button
                              onClick={() => showToast(`Direct referral interview invite sent to ${cand.name}!`)}
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                            >
                              Send Direct Referral
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. ALUMNI COMMUNITY & SOCIAL TAB */}
                {activeTab === 'community' && (
                  <div key="alumni-community" className="flex-1 flex flex-col gap-5 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          Professional & Ghost Social Network
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                          Share architectural learnings with peers or share industry compensation realities in Ghost Mode.
                        </p>
                      </div>

                      {/* Sub-Tab Switcher */}
                      <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200">
                        <button
                          onClick={() => setCommunitySubTab('feed')}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            communitySubTab === 'feed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          🌐 Public Feed
                        </button>
                        <button
                          onClick={() => setCommunitySubTab('ghost')}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            communitySubTab === 'ghost' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          👻 Kin Ghost Mode
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-8 space-y-4">
                        {communitySubTab === 'feed' ? (
                          <>
                            <form onSubmit={handleSocialPost} className="p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                              <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="Share engineering architectures, hiring openings, or tech updates..."
                                rows={2}
                                className="w-full text-xs text-slate-900 placeholder-slate-400 bg-transparent resize-none focus:outline-none"
                              />
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <span className="text-[10px] text-slate-500 font-bold">Posting as: Verified Alumni (Uber)</span>
                                <button
                                  type="submit"
                                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
                                >
                                  Post Update
                                </button>
                              </div>
                            </form>

                            {socialFeed.map((post) => (
                              <div key={post.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-900">{post.author.name}</h4>
                                    <span className="text-[10px] text-slate-500">{post.author.role}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">{post.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-800 leading-relaxed my-2">{post.content}</p>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            <form onSubmit={handleGhostPost} className="p-4 rounded-3xl bg-[#181A20] text-white border border-white/10 shadow-lg">
                              <span className="text-xs font-mono text-amber-400 block mb-2">👻 Posting as: Ghost-Architect-402 (Zero Employer Trace)</span>
                              <textarea
                                value={newGhostText}
                                onChange={(e) => setNewGhostText(e.target.value)}
                                placeholder="Share unfiltered industry advice, real salary bands, or layoff warnings..."
                                rows={2}
                                className="w-full text-xs text-white placeholder-slate-400 bg-transparent resize-none focus:outline-none"
                              />
                              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                <span className="text-[10px] text-slate-400">Identity protected</span>
                                <button
                                  type="submit"
                                  className="px-4 py-1.5 rounded-xl bg-[#E25C38] text-white text-xs font-bold cursor-pointer"
                                >
                                  Post Ghost Insight
                                </button>
                              </div>
                            </form>

                            {ghostPosts.map((g) => (
                              <div key={g.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-mono font-bold text-slate-900">👻 {g.persona}</span>
                                  <span className="text-[10px] text-slate-400">{g.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-800 leading-relaxed my-2">{g.content}</p>
                              </div>
                            ))}
                          </>
                        )}
                      </div>

                      <div className="lg:col-span-4 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
                        <h3 className="text-base font-bold text-slate-900">Talent to Watch</h3>
                        <p className="text-xs text-slate-500">Students with highest commit momentum</p>
                        <div className="space-y-3">
                          {[
                            { name: 'Darsh Ohri', metric: '48 commits / 14 days' },
                            { name: 'Aarav Sharma', metric: '36 commits / 14 days' }
                          ].map((t) => (
                            <div key={t.name} className="p-2.5 rounded-2xl bg-slate-50 flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-900">{t.name}</span>
                              <span className="text-emerald-600 font-mono font-bold text-[10px]">{t.metric}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ─── TOAST NOTIFICATION BANNER ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-800"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E25C38]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── BOTTOM FLOATING GLASS DOCK (SINGLE KIN MASCOT BEHIND DOCK) ─── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none">
        
        {/* PEEKING KIN MASCOT BEHIND DOCK: ONLY RENDERED WHEN TOUR IS NOT ACTIVE! */}
        <AnimatePresence mode="wait">
          {!showMascotTour && (
            <motion.button
              key="dock-mascot-peek"
              initial={{ opacity: 0, y: 28, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.85 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                setMascotStepIndex(0);
                setShowMascotTour(true);
              }}
              className="relative -mb-4 z-10 pointer-events-auto group cursor-pointer transition-transform duration-300 hover:-translate-y-2 focus:outline-none"
              title="Kin AI Guide • Click me to interact! 👋"
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-200 shadow-md text-[10px] font-bold text-slate-800 whitespace-nowrap pointer-events-none">
                Kin Guide • Click me 👋
              </div>

              <div className="w-14 h-14 relative filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.1)]">
                <KinMascot pose={activeTab as any} size={56} />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* FROSTED GLASS NAV DOCK */}
        <nav
          aria-label="Dashboard Navigation"
          className="relative z-20 pointer-events-auto flex items-center gap-1 sm:gap-2 py-1.5 px-3.5 rounded-full bg-white/75 hover:bg-white/85 border border-white/80 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1),_inset_0_1.5px_2px_rgba(255,255,255,0.8)] transition-all"
        >
          {activeNavList.map((item) => {
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
                    ? 'text-white bg-slate-900 shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
                title={item.label}
              >
                <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />

                {/* Floating tooltip */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap pointer-events-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── KIN MASCOT TOUR MODAL / OVERLAY (SINGLE KIN) ─── */}
      <AnimatePresence>
        {showMascotTour && (
          <>
            {/* STEP 0: Centered Welcome Mascot */}
            {mascotStepIndex === 0 && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md">
                <div className="relative flex flex-col items-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
                  {/* Speech bubble */}
                  <div className="w-full rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.2)] text-slate-900 mb-4 text-center relative">
                    <button
                      onClick={() => setShowMascotTour(false)}
                      className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <h3 className="text-xl font-black text-slate-900">Hi, I&apos;m Kin 👋</h3>
                    <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed font-medium">
                      Welcome to your dashboard! Let me introduce you to your role features and problem bounties.
                    </p>
                    <button
                      onClick={() => {
                        setMascotStepIndex(1);
                        setActiveTab(KIN_WALKTHROUGH[1].tabId);
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Show me around</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-100" />
                  </div>

                  {/* Character Model (Zero Hands, Clean Shadow) */}
                  <div className="relative filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)]">
                    <KinMascot pose="welcome" size={200} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1+: Tour Guide Hovering Above Bottom Dock */}
            {mascotStepIndex > 0 && (
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none w-full max-w-sm sm:max-w-md px-4">
                <div className="pointer-events-auto w-full rounded-3xl p-5 bg-white border border-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.2)] text-slate-900 mb-2 relative animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <button
                    onClick={() => setShowMascotTour(false)}
                    className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">{currentTourStep.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {currentTourStep.lines.join(' ')}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      {KIN_WALKTHROUGH.slice(1).map((step, idx) => (
                        <div
                          key={step.id}
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
                            showToast('Walkthrough complete! Kin is resting behind the dock navigation.');
                          }
                        }}
                        className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>{mascotStepIndex === KIN_WALKTHROUGH.length - 1 ? 'Finish Tour' : 'Next'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-100" />
                </div>

                {/* Pure Mascot hovering above dock */}
                <div className="relative filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)]">
                  <KinMascot pose={currentTourStep.tabId as any} size={84} />
                </div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* ─── MODAL 1: SUBMIT SOLUTION / GITHUB REPO TO ALUMNI ─── */}
      <AnimatePresence>
        {isSubmitSolutionModalOpen && selectedProblem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full rounded-[32px] bg-white border border-slate-100 p-6 sm:p-7 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold text-[#E25C38] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  {selectedProblem.category} Bounty • {selectedProblem.bountyReward}
                </span>
                <button
                  onClick={() => setIsSubmitSolutionModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-black text-slate-900 leading-snug mb-2">
                {selectedProblem.question}
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {selectedProblem.context}
              </p>

              {/* Alumni Recipient Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Reviewing Alumni:</span>
                  <span className="text-xs font-bold text-slate-900">{selectedProblem.alumniName}</span>
                  <span className="text-[10px] text-slate-600 block">{selectedProblem.alumniTitle} @ {selectedProblem.alumniCompany}</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Direct Triage
                </span>
              </div>

              <form onSubmit={handleSubmitProjectSolution} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    GitHub Repository Link <span className="text-[#E25C38]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Github className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      required
                      value={repoUrlInput}
                      onChange={(e) => setRepoUrlInput(e.target.value)}
                      placeholder="https://github.com/your-username/repo-name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Live Demo or Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={liveUrlInput}
                    onChange={(e) => setLiveUrlInput(e.target.value)}
                    placeholder="https://your-demo.vercel.app"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Technical Architecture & Solution Summary
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={approachSummaryInput}
                    onChange={(e) => setApproachSummaryInput(e.target.value)}
                    placeholder="Explain your approach, core algorithmic trade-offs, and test evidence..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingSolution}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingSolution ? 'Submitting to Alumni...' : 'Submit Solution Directly to Alumni'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 2: ALUMNI POST NEW PROBLEM STATEMENT ─── */}
      <AnimatePresence>
        {isPostProblemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full rounded-[32px] bg-white border border-slate-100 p-6 sm:p-7 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Post New Problem Statement</h3>
                <button
                  onClick={() => setIsPostProblemModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePostNewProblem} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Problem Question (Punchy Provocative Question) <span className="text-[#E25C38]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProblemQuestion}
                    onChange={(e) => setNewProblemQuestion(e.target.value)}
                    placeholder="e.g. Why can't micro-merchants settle cross-border stablecoins without gas spikes?"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Category</label>
                    <select
                      value={newProblemCategory}
                      onChange={(e) => setNewProblemCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="Healthcare">Healthcare</option>
                      <option value="Blockchain">Blockchain</option>
                      <option value="FinTech">FinTech</option>
                      <option value="Fake News">Fake News</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Housing">Housing</option>
                      <option value="Career">Career</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Reward</label>
                    <input
                      type="text"
                      value={newProblemReward}
                      onChange={(e) => setNewProblemReward(e.target.value)}
                      placeholder="₹25,000 / $300 USDC"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Organization / Company Name
                  </label>
                  <input
                    type="text"
                    value={newProblemCompany}
                    onChange={(e) => setNewProblemCompany(e.target.value)}
                    placeholder="e.g. Uber Platform Labs"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Architecture Background & Acceptance Criteria
                  </label>
                  <textarea
                    rows={3}
                    value={newProblemContext}
                    onChange={(e) => setNewProblemContext(e.target.value)}
                    placeholder="Describe the production context, test requirements, and acceptance thresholds..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Problem Statement</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 3: 20-MIN CONSULTATION BOOKING ─── */}
      <AnimatePresence>
        {bookingModalOpen && selectedExpert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full rounded-[32px] bg-white border border-slate-100 p-6 shadow-2xl text-slate-900"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-[#E25C38]">20-Minute Doorway</span>
                <button
                  onClick={() => setBookingModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Book 1-on-1 with {selectedExpert.name}
              </h3>
              <p className="text-xs text-slate-600 mb-4">{selectedExpert.role}</p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-4 text-xs space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Session Type:</span>
                  <span>{selectedExpert.specialty}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Price:</span>
                  <span className="text-emerald-700">{selectedExpert.fee}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Select Time Slot:</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Saturday, 3:00 PM - 3:20 PM">Saturday, 3:00 PM - 3:20 PM</option>
                  <option value="Saturday, 4:00 PM - 4:20 PM">Saturday, 4:00 PM - 4:20 PM</option>
                  <option value="Sunday, 11:00 AM - 11:20 AM">Sunday, 11:00 AM - 11:20 AM</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 mb-4">
                ✓ 100% human-verified session, protected by Kin&apos;s anti-AI-slop guarantee.
              </div>

              <button
                onClick={handleConfirmConsultBooking}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
              >
                Confirm Booking & Dispatch Invite
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 4: SUBMIT MANUAL NOTE TO SENIOR QUEUE ─── */}
      <AnimatePresence>
        {manualNoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full rounded-[32px] bg-white border border-slate-100 p-6 shadow-2xl text-slate-900"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-[#E25C38]">Manual Triage Submission</span>
                <button
                  onClick={() => setManualNoteModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                Send Note to {manualNoteSenior}&apos;s Queue
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Attach proof-of-work context to explain why you should connect even though your profile hasn&apos;t met the automated threshold yet.
              </p>

              <form onSubmit={handleSendManualQueueNote} className="space-y-3.5">
                <textarea
                  rows={4}
                  required
                  value={manualNoteText}
                  onChange={(e) => setManualNoteText(e.target.value)}
                  placeholder={`Hi ${manualNoteSenior.split(' ')[0]}! I've been building...`}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
                >
                  Submit Note to Queue
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadResumeModalOpen}
        onClose={closeUploadResumeModal}
        onSuccess={(newProf) => {
          setParsedProfile(newProf);
          showToast('CV successfully analyzed & profile updated with Gemini AI!');
        }}
      />
    </div>
  );
}
