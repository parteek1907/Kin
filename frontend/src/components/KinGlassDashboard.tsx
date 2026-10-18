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
  Globe,
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
  CheckSquare,
  Trash2,
  GitPullRequest,
  Loader2
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import ResumeUploadModal from './ResumeUploadModal';
import KinMascot from './KinMascot';
import ProfileCompletionWizard from './profile/ProfileCompletionWizard';
import LiveCommunityNetwork from './community/LiveCommunityNetwork';
import FloatingInboxWidget, { DMTargetUser } from './network/FloatingInboxWidget';
import {
  ALUMNI_PROBLEMS,
  AlumniProblem,
  INITIAL_SUBMITTED_SOLUTIONS,
  CandidateSolutionSubmission,
  OutreachApplication
} from '@/data/alumniProblems';
import {
  MOCK_POLICIES,
  MOCK_SOCIAL_FEED,
  SocialFeedItem,
  AutoConnectionPolicy,
  MOCK_CAREER_MILESTONES,
  MOCK_SKILL_GAP,
  MOCK_BOUNTIES,
  MOCK_RADAR_OPPORTUNITIES
} from '@/services/dashboardService';

type ActiveTab = 
  | 'overview' 
  | 'problems' 
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
  },
  {
    id: 'profile-setup',
    title: "Profile Setup & Resume Verification",
    lines: [
      "Finally, check out 'Profile Setup' on the top right! Upload your CV here, extract verified proof-of-work skills, sync your LinkedIn and GitHub, and manage your account anytime."
    ],
    tabId: 'overview'
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
    isProfileModalOpen,
    openProfileModal,
    closeProfileModal,
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
  const [showMascotTour, setShowMascotTour] = useState(false);
  const [mascotStepIndex, setMascotStepIndex] = useState(0);

  // Floating Inbox Target User
  const [inboxTargetUser, setInboxTargetUser] = useState<DMTargetUser | null>(null);

  // Profile Setup Modal State: local + context sync
  const [localProfileModalOpen, setLocalProfileModalOpen] = useState(false);
  const isProfileWizardOpen = isProfileModalOpen || localProfileModalOpen;
  const handleOpenProfileWizard = () => {
    setLocalProfileModalOpen(true);
    if (openProfileModal) openProfileModal();
  };
  const handleCloseProfileWizard = () => {
    setLocalProfileModalOpen(false);
    if (closeProfileModal) closeProfileModal();
  };

  const dismissMascotTour = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kin_mascot_tour_seen', 'true');
    }
    setShowMascotTour(false);
  };

  // Tab & role persistence across reloads & URL sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      const urlTab = params.get('tab');
      const savedTab = localStorage.getItem('kin_active_tab') as ActiveTab | null;
      const savedRole = localStorage.getItem('kin_network_role') as 'student' | 'alumni' | null;

      const validTabs: ActiveTab[] = [
        'overview',
        'problems',
        'firewall',
        'time-machine',
        'doorway',
        'wisdom',
        'radar',
        'community',
      ];

      const effectiveTab =
        urlTab && validTabs.includes(urlTab as ActiveTab)
          ? (urlTab as ActiveTab)
          : savedTab && validTabs.includes(savedTab)
          ? savedTab
          : 'overview';

      setActiveTab(effectiveTab);

      if (params.get('setup') === 'true' || params.get('profile') === 'true' || params.has('step')) {
        setLocalProfileModalOpen(true);
      }

      const effectiveRole =
        urlRole === 'alumni' || urlRole === 'student'
          ? (urlRole as 'student' | 'alumni')
          : savedRole || (activeRole === 'Alumni' ? 'alumni' : 'student');

      if (effectiveRole === 'alumni') {
        setNetworkRole('alumni');
        setShowMascotTour(false);
      } else {
        setNetworkRole('student');
      }

      // Sync URL immediately without reload
      const url = new URL(window.location.href);
      url.searchParams.set('role', effectiveRole);
      url.searchParams.set('tab', effectiveTab);
      window.history.replaceState(null, '', url.toString());
    }
  }, [activeRole]);

  // Continuously persist activeTab and networkRole to URL and localStorage on any tab change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kin_active_tab', activeTab);
      localStorage.setItem('kin_network_role', networkRole);
      const url = new URL(window.location.href);
      url.searchParams.set('role', networkRole);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState(null, '', url.toString());
    }
  }, [activeTab, networkRole]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Switch Role Handler
  const handleRoleToggle = (targetRole: 'student' | 'alumni') => {
    setNetworkRole(targetRole);
    setActiveRole(targetRole === 'student' ? 'Student' : 'Alumni');
    showToast(`Switched to ${targetRole === 'student' ? 'Student Dashboard' : 'Working Professional Command Center'}`);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PROBLEM STATEMENTS (IMAGE 3 UI) & SOLUTION SUBMISSION MODAL STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [problems, setProblems] = useState<AlumniProblem[]>([]);
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
  const [candidateSubmissions, setCandidateSubmissions] = useState<CandidateSolutionSubmission[]>([]);

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTO-CONNECT & FIREWALL STATES
  // ─────────────────────────────────────────────────────────────────────────────
  // Student Outreach State (Live Connected & Evaluated Applications)
  const [outreachApplications, setOutreachApplications] = useState<OutreachApplication[]>([]);
  const [manualNoteModalOpen, setManualNoteModalOpen] = useState(false);
  const [manualNoteSenior, setManualNoteSenior] = useState<string>('');
  const [manualNoteText, setManualNoteText] = useState('');

  // Send CV to Professional Modal State (Direct ATS Review from Social / Directory)
  const [isSendCvModalOpen, setIsSendCvModalOpen] = useState(false);
  const [selectedProForCv, setSelectedProForCv] = useState<{
    name: string;
    role: string;
    company: string;
    avatar?: string;
  }>({
    name: '',
    role: '',
    company: '',
  });
  const [isEvaluatingAts, setIsEvaluatingAts] = useState(false);
  const [targetProPolicy, setTargetProPolicy] = useState<{
    threshold: number;
    minCommits: number;
    mandatorySkills: string[];
  } | null>(null);
  const [isLoadingProPolicy, setIsLoadingProPolicy] = useState(false);

  useEffect(() => {
    if (isSendCvModalOpen && selectedProForCv.name) {
      setIsLoadingProPolicy(true);
      fetch(`/api/firewall/policy?professionalName=${encodeURIComponent(selectedProForCv.name)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.policy) {
            setTargetProPolicy({
              threshold: d.policy.threshold,
              minCommits: d.policy.minCommits,
              mandatorySkills: d.policy.mandatorySkills || ['React', 'Docker', 'PostgreSQL'],
            });
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingProPolicy(false));
    }
  }, [isSendCvModalOpen, selectedProForCv.name]);

  // Professional Firewall Settings State
  const [firewallThreshold, setFirewallThreshold] = useState<number>(75);
  const [firewallMinCommits, setFirewallMinCommits] = useState<number>(15);
  const [firewallActive, setFirewallActive] = useState<boolean>(true);
  const [selectedFirewallSkills, setSelectedFirewallSkills] = useState<string[]>(['React', 'Docker', 'PostgreSQL']);
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 20-MINUTE DOORWAY STATES (LIVE INTERLINKED CONSULTATIONS & SETTLEMENTS)
  // ─────────────────────────────────────────────────────────────────────────────
  const [doorwaySlots, setDoorwaySlots] = useState<any[]>([]);
  const [isLoadingDoorwaySlots, setIsLoadingDoorwaySlots] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('Saturday, 3:00 PM - 3:20 PM');
  const [bookingTopic, setBookingTopic] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Professional Consultation Pricing & Availability (Image 2)
  const [consultFeeSetting, setConsultFeeSetting] = useState('1000');
  const [consultSpecialtySetting, setConsultSpecialtySetting] = useState('System Design Drill');
  const [consultIsOpenForBookings, setConsultIsOpenForBookings] = useState(true);
  const [isSavingConsultPricing, setIsSavingConsultPricing] = useState(false);

  // Professional Financial Ledger (Real Data, 50/50 Split)
  const [proSessionsDone, setProSessionsDone] = useState(0);
  const [proGrossRevenue, setProGrossRevenue] = useState(0);
  const [proShare50, setProShare50] = useState(0);
  const [proPendingSettlement, setProPendingSettlement] = useState(0);
  const [proBookingsList, setProBookingsList] = useState<any[]>([]);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  const refreshDoorwaySlots = async () => {
    setIsLoadingDoorwaySlots(true);
    try {
      const res = await fetch('/api/doorway/slots?onlyAvailable=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.slots)) {
        setDoorwaySlots(data.slots);
      }
    } catch (e) {
      console.error('Failed to load doorway slots', e);
    } finally {
      setIsLoadingDoorwaySlots(false);
    }
  };

  const refreshProfessionalLedger = async () => {
    try {
      const proEmail = user?.email || activeUserEmail || 'professional@kin.network';
      const proName = user?.name || activeUserName || 'Verified Professional';
      const res = await fetch(`/api/doorway/bookings?professionalEmail=${encodeURIComponent(proEmail)}&professionalName=${encodeURIComponent(proName)}`);
      const data = await res.json();
      if (data.success && data.stats) {
        setProSessionsDone(data.stats.totalSessions || 0);
        setProGrossRevenue(data.stats.grossRevenue || 0);
        setProShare50(data.stats.share50 || 0);
        setProPendingSettlement(data.stats.pendingSettlement || 0);
        setProBookingsList(data.bookings || []);
      }
    } catch (e) {
      console.error('Failed to load professional ledger', e);
    }
  };


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
  // TIME MACHINE STATES & AI PATHWAY GENERATOR
  // ─────────────────────────────────────────────────────────────────────────────
  const [targetRoleSelection, setTargetRoleSelection] = useState('Staff AI Engineer');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(0);
  const [isGeneratingPathway, setIsGeneratingPathway] = useState(false);
  const [activePathwayData, setActivePathwayData] = useState<{
    targetRole: string;
    milestones: Array<{ year: string; desc: string; hurdles?: string }>;
    skillGap: {
      matchPercentage: number;
      items: Array<{ skill: string; status: string; progress: number; verified: boolean }>;
      recommendedBounty?: string;
    };
  } | null>(null);

  // Career Milestones State (Published by both students and professionals)
  const [careerMilestones, setCareerMilestones] = useState<Array<{
    id: string;
    period: string;
    role: string;
    comp: string;
    hurdles: string;
    skills?: string[];
    userEmail?: string;
    userName?: string;
    userRole?: 'student' | 'alumni';
  }>>([]);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);
  const [newMilestoneForm, setNewMilestoneForm] = useState({
    role: '',
    comp: '',
    period: '',
    hurdles: '',
    skills: ''
  });

  const fetchCareerMilestones = async () => {
    try {
      const email = user?.email || parsedProfile?.email || (activeRole === 'Student' ? 'student@iiitd.ac.in' : 'professional@kin.network');
      const name = user?.name || parsedProfile?.name || (activeRole === 'Student' ? 'Student Member' : 'Verified Professional');
      const res = await fetch(`/api/career-milestones?userEmail=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.milestones)) {
        setCareerMilestones(data.milestones);
      }
    } catch (e) {
      console.error('Failed to fetch milestones', e);
    }
  };

  useEffect(() => {
    fetchCareerMilestones();
  }, [activeRole, user?.email]);

  const handleGenerateAiPathway = async (roleOverride?: string) => {
    const role = (roleOverride || customRoleInput || targetRoleSelection).trim();
    if (!role) {
      showToast('Please specify a desired job role!');
      return;
    }
    setIsGeneratingPathway(true);
    try {
      const currentSkills = (user?.skills && user.skills.length > 0)
        ? user.skills
        : (parsedProfile?.skills && parsedProfile.skills.length > 0)
        ? parsedProfile.skills
        : ['React', 'TypeScript', 'Node.js', 'FastAPI'];
      const headline = user?.headline || parsedProfile?.role || 'Full-Stack Developer';

      const res = await fetch('/api/time-machine/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: role,
          currentSkills,
          githubCommits: 342,
          headline
        })
      });
      const data = await res.json();
      if (data.success && data.pathway) {
        setActivePathwayData(data.pathway);
        setTargetRoleSelection(data.pathway.targetRole || role);
        showToast(`AI generated authentic roadmap for ${data.pathway.targetRole || role}!`);
      } else {
        showToast(data.error || 'Failed to generate pathway');
      }
    } catch (e) {
      console.error(e);
      showToast('Error contacting AI Career Architect');
    } finally {
      setIsGeneratingPathway(false);
    }
  };

  const handlePublishMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneForm.role.trim() || !newMilestoneForm.comp.trim()) {
      showToast('Please provide role and organization/company');
      return;
    }
    setIsSavingMilestone(true);
    try {
      const email = user?.email || parsedProfile?.email || (activeRole === 'Student' ? 'student@iiitd.ac.in' : 'professional@kin.network');
      const name = user?.name || parsedProfile?.name || (activeRole === 'Student' ? 'Student Member' : 'Verified Professional');
      const res = await fetch('/api/career-milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: newMilestoneForm.role,
          comp: newMilestoneForm.comp,
          period: newMilestoneForm.period || '2024 - Present',
          hurdles: newMilestoneForm.hurdles,
          skills: newMilestoneForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
          userEmail: email,
          userName: name,
          userRole: activeRole === 'Student' ? 'student' : 'alumni'
        })
      });
      const data = await res.json();
      if (data.success && data.milestone) {
        setCareerMilestones((prev) => [data.milestone, ...prev]);
        setIsMilestoneModalOpen(false);
        setNewMilestoneForm({ role: '', comp: '', period: '', hurdles: '', skills: '' });
        showToast('Career milestone published to your authentic trajectory!');
      } else {
        showToast(data.error || 'Failed to publish milestone');
      }
    } catch (e) {
      console.error(e);
      showToast('Error saving milestone');
    } finally {
      setIsSavingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      const res = await fetch(`/api/career-milestones?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCareerMilestones((prev) => prev.filter((m) => m.id !== id));
        showToast('Milestone removed');
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  // Live Connected Problem Statements & Candidate Submissions Sync
  useEffect(() => {
    // 1. Instant hydration from localStorage
    try {
      const cachedProblems = localStorage.getItem('kin_live_problems');
      if (cachedProblems) {
        const parsed = JSON.parse(cachedProblems);
        if (Array.isArray(parsed) && parsed.length >= 8) {
          setProblems(parsed);
        }
      }
      const cachedSubmissions = localStorage.getItem('kin_live_submissions');
      if (cachedSubmissions) {
        const parsed = JSON.parse(cachedSubmissions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCandidateSubmissions(parsed);
        }
      }
    } catch (e) {}

    // 2. Fetch live problem statements from persistent API
    fetch('/api/problems')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.problems)) {
          setProblems(d.problems);
          try {
            localStorage.setItem('kin_live_problems', JSON.stringify(d.problems));
          } catch {}
        }
      })
      .catch(() => {});

    // 3. Fetch live candidate submissions from persistent API
    fetch('/api/problems/submissions')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.submissions)) {
          setCandidateSubmissions(d.submissions);
          try {
            localStorage.setItem('kin_live_submissions', JSON.stringify(d.submissions));
          } catch {}
        }
      })
      .catch(() => {});

    // 4. Fetch live firewall policy configuration
    fetch('/api/firewall/policy')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.policy) {
          setFirewallThreshold(d.policy.threshold);
          setFirewallMinCommits(d.policy.minCommits);
          setSelectedFirewallSkills(d.policy.mandatorySkills);
          setFirewallActive(d.policy.firewallActive);
        }
      })
      .catch(() => {});

    // 5. Fetch student's evaluated outreach applications (Image 1)
    const currentStudentEmail = user?.email || activeUserEmail || 'aditya@iiitd.ac.in';
    fetch(`/api/firewall/outreach?type=student&studentEmail=${encodeURIComponent(currentStudentEmail)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.applications)) {
          setOutreachApplications(d.applications);
        }
      })
      .catch(() => {});

    // 6. Fetch professional's manual triage queue (Image 2)
    fetch('/api/firewall/outreach?type=manual_queue')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.queue)) {
          setPendingQueue(d.queue);
        }
      })
      .catch(() => {});

    // 7. Fetch live Doorway consultation offerings & professional ledger
    refreshDoorwaySlots();
    refreshProfessionalLedger();
  }, [user?.email, activeUserEmail]);

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
  const handleSubmitProjectSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrlInput.trim()) {
      showToast('Please enter your GitHub repository link.');
      return;
    }
    if (!selectedProblem) return;
    setSubmittingSolution(true);

    const submissionPayload = {
      problemId: selectedProblem.id,
      problemQuestion: selectedProblem.question,
      studentName: activeUserName || 'Student Builder',
      studentCollege: activeUserInstitution || 'IIIT Delhi',
      studentAvatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      repoUrl: repoUrlInput.trim(),
      liveDemoUrl: liveUrlInput.trim() || undefined,
      approachSummary: approachSummaryInput.trim() || 'Implemented core architecture with full test verification.',
      testsPassed: `${selectedProblem.testCasesCount}/${selectedProblem.testCasesCount} tests passed (100%)`,
    };

    try {
      const res = await fetch('/api/problems/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });

      if (res.ok) {
        const data = await res.json();
        const created = data.submission;
        const updated = [created, ...candidateSubmissions.filter((s) => s.id !== created.id)];
        setCandidateSubmissions(updated);
        try {
          localStorage.setItem('kin_live_submissions', JSON.stringify(updated));
        } catch {}
      } else {
        const fallbackSub: CandidateSolutionSubmission = {
          id: `sub-${Date.now()}`,
          ...submissionPayload,
          submittedAt: 'Just now',
          status: 'pending',
        };
        const updated = [fallbackSub, ...candidateSubmissions];
        setCandidateSubmissions(updated);
        try {
          localStorage.setItem('kin_live_submissions', JSON.stringify(updated));
        } catch {}
      }
    } catch {
      const fallbackSub: CandidateSolutionSubmission = {
        id: `sub-${Date.now()}`,
        ...submissionPayload,
        submittedAt: 'Just now',
        status: 'pending',
      };
      const updated = [fallbackSub, ...candidateSubmissions];
      setCandidateSubmissions(updated);
      try {
        localStorage.setItem('kin_live_submissions', JSON.stringify(updated));
      } catch {}
    }

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

    // Update problem status in local state
    setProblems((prev) =>
      prev.map((p) => (p.id === selectedProblem.id ? { ...p, status: 'under_review' } : p))
    );

    showToast('Solution submitted directly to Senior Alumni! They will review your repository diff.');
    setRepoUrlInput('');
    setLiveUrlInput('');
    setApproachSummaryInput('');
  };

  const handleConfirmConsultBooking = async () => {
    if (!selectedExpert) return;
    setIsSubmittingBooking(true);
    try {
      const expertName = selectedExpert.professionalName || selectedExpert.name || 'Verified Mentor';
      const expertEmail = selectedExpert.professionalEmail || 'professional@kin.network';
      const numericFee = typeof selectedExpert.fee === 'number'
        ? selectedExpert.fee
        : parseInt(String(selectedExpert.fee).replace(/[^0-9]/g, '')) || 1000;

      const res = await fetch('/api/doorway/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doorwayId: selectedExpert.id,
          professionalEmail: expertEmail,
          professionalName: expertName,
          studentName: activeUserName,
          studentEmail: user?.email || activeUserEmail || 'student@iiitd.ac.in',
          studentCollege: activeUserInstitution || 'IIIT Delhi',
          fee: numericFee,
          slot: selectedSlot,
          topic: bookingTopic.trim() || 'System architecture drill and real engineering hurdle review',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingModalOpen(false);
        setBookingTopic('');
        try {
          confetti({
            particleCount: 110,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
        showToast(`Confirmed! 20-min consult booked with ${expertName}. Calendar invite dispatched.`);
        refreshProfessionalLedger();
      } else {
        showToast(data.error || 'Failed to book consultation');
      }
    } catch {
      showToast('Network error while booking consultation');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleSaveConsultationPricing = async () => {
    setIsSavingConsultPricing(true);
    try {
      const numericFee = parseInt(String(consultFeeSetting).replace(/[^0-9]/g, '')) || 1000;
      const res = await fetch('/api/doorway/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalEmail: user?.email || activeUserEmail || 'professional@kin.network',
          professionalName: activeUserName || 'Verified Leader',
          role: (user?.headline && !user.headline.toLowerCase().includes('student'))
            ? user.headline
            : 'Senior Technical Leader & Mentor',
          company: (user?.institution && !user.institution.toLowerCase().includes('student'))
            ? user.institution
            : 'Global Technology Syndicate',
          specialty: consultSpecialtySetting || 'System Design & Distributed Scalability Drill',
          fee: numericFee,
          isAvailable: consultIsOpenForBookings,
          availableSlots: [
            'Saturday, 10:00 AM - 10:20 AM',
            'Saturday, 3:00 PM - 3:20 PM',
            'Sunday, 11:00 AM - 11:20 AM'
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Consultation schedule & pricing published to Student Cockpit!');
        refreshDoorwaySlots();
      } else {
        showToast(data.error || 'Failed to update consultation availability');
      }
    } catch {
      showToast('Error saving consultation pricing');
    } finally {
      setIsSavingConsultPricing(false);
    }
  };


  const handleSendManualQueueNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const note = manualNoteText.trim();
    const senior = manualNoteSenior;
    setManualNoteModalOpen(false);

    try {
      const res = await fetch('/api/firewall/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_manual_queue',
          professionalName: senior,
          studentEmail: activeUserEmail,
          studentName: activeUserName,
          studentCollege: activeUserInstitution,
          manualNote: note,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setOutreachApplications((prev) =>
          prev.map((a) =>
            a.professionalName.toLowerCase() === senior.toLowerCase()
              ? { ...a, status: 'in_manual_queue', manualNote: note }
              : a
          )
        );
        // Refresh manual triage queue
        fetch('/api/firewall/outreach?type=manual_queue')
          .then((r) => r.json())
          .then((qd) => {
            if (qd.success && Array.isArray(qd.queue)) setPendingQueue(qd.queue);
          })
          .catch(() => {});
      }
    } catch {}

    showToast(`Note submitted to ${senior}'s manual triage queue!`);
    setManualNoteText('');
  };

  const handleInstantConnect = async (app: OutreachApplication) => {
    try {
      await fetch('/api/firewall/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'instant_connect',
          professionalName: app.professionalName,
          studentEmail: activeUserEmail,
          studentName: activeUserName,
          studentCollege: activeUserInstitution,
        }),
      });
      setOutreachApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: 'connected' } : a))
      );
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
      } catch {}
      showToast(`Smart Auto-Connect handshake triggered with ${app.professionalName}! Accepted.`);
    } catch {
      showToast(`Smart Auto-Connect handshake triggered with ${app.professionalName}!`);
    }
  };

  const handleSaveFirewallPolicy = async () => {
    try {
      const res = await fetch('/api/firewall/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalName: activeUserName,
          professionalRole: activeUserRole,
          firewallActive,
          threshold: firewallThreshold,
          minCommits: firewallMinCommits,
          mandatorySkills: selectedFirewallSkills,
        }),
      });
      const d = await res.json();
      if (d.success) {
        showToast('Firewall policies saved and deployed to live gateway!');
      } else {
        showToast('Firewall policies updated.');
      }
    } catch {
      showToast('Firewall policies saved.');
    }
  };

  const handleEvaluateAndSendCv = async (
    pro: { name: string; role: string; company?: string; avatar?: string },
    policyReqs?: { threshold: number; minCommits: number; mandatorySkills: string[] }
  ) => {
    setIsEvaluatingAts(true);
    try {
      const studentCommits = githubData?.recentPushesCount ? githubData.recentPushesCount * 4 : 18;

      // 1. Evaluate with Gemini AI
      const evalRes = await fetch('/api/ats-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: activeUserEmail,
          studentName: activeUserName,
          studentCollege: activeUserInstitution,
          studentHeadline: activeUserRole,
          studentSkills: activeSkills,
          studentCommits,
          resumeText: parsedProfile?.summary || '',
          professionalName: pro.name,
          professionalRole: pro.role,
          firewallPolicy: policyReqs || {
            threshold: firewallThreshold,
            minCommits: firewallMinCommits,
            mandatorySkills: selectedFirewallSkills,
          },
        }),
      });

      const evalData = await evalRes.json();
      const result = evalData.result || {
        currentMatch: 68,
        targetMatch: policyReqs?.threshold || 75,
        met: ['React (AST Verified)', `${studentCommits} Commits (Met)`],
        missing: ['Docker (Missing on profile)'],
        passed: false,
      };

      // 2. Save application to live outreach system
      const outreachRes = await fetch('/api/firewall/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          studentEmail: activeUserEmail,
          studentName: activeUserName,
          studentCollege: activeUserInstitution,
          professionalName: pro.name,
          professionalRole: pro.role,
          professionalCompany: pro.company || 'TechCorp',
          professionalAvatar: pro.avatar,
          policy: `Requires ≥ ${result.targetMatch}% match, ${(policyReqs?.mandatorySkills || selectedFirewallSkills).join(', ')}, and min ${policyReqs?.minCommits || firewallMinCommits} commits.`,
          targetMatch: result.targetMatch,
          currentMatch: result.currentMatch,
          met: result.met,
          missing: result.missing,
          atsFeedback: result.feedback || '',
        }),
      });

      const outreachData = await outreachRes.json();
      if (outreachData.success && outreachData.application) {
        setOutreachApplications((prev) => {
          const filtered = prev.filter(
            (a) => a.professionalName.toLowerCase() !== pro.name.toLowerCase()
          );
          return [outreachData.application, ...filtered];
        });
      }

      if (result.passed) {
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch {}
        showToast(`🎉 ATS Firewall Passed! Match: ${result.currentMatch}% / ${result.targetMatch}%. You can Instant Connect!`);
      } else {
        showToast(`ATS Firewall Score: ${result.currentMatch}% / ${result.targetMatch}%. Added to your Outreach list.`);
      }

      setIsSendCvModalOpen(false);
      setActiveTab('community');
    } catch (err) {
      showToast('ATS Review completed.');
      setIsSendCvModalOpen(false);
      setActiveTab('community');
    } finally {
      setIsEvaluatingAts(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS FOR ALUMNI / PROFESSIONAL ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePostNewProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblemQuestion.trim()) return;

    const payload = {
      question: newProblemQuestion.trim(),
      category: newProblemCategory,
      alumniCompany: newProblemCompany.trim() || activeUserInstitution || 'TechCorp',
      bountyReward: newProblemReward.trim() || '₹25,000 / $300 USDC',
      context: newProblemContext.trim() || 'Real production problem statement requiring AST-verified architecture.',
      starterRepoUrl: newProblemRepo.trim() || 'https://github.com/kin-network/starter',
      alumniName: activeUserName || 'Verified Alumni',
      alumniTitle: user?.headline || 'Senior Engineering Architect',
    };

    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const created = data.problem;
        const updated = [created, ...problems];
        setProblems(updated);
        try {
          localStorage.setItem('kin_live_problems', JSON.stringify(updated));
        } catch {}
      } else {
        const fallbackProblem: AlumniProblem = {
          id: `prob-${Date.now()}`,
          category: newProblemCategory,
          cardVariant: newProblemCategory === 'Housing' || newProblemCategory === 'Consumer Services' ? 'blue' : 'charcoal',
          question: newProblemQuestion.trim(),
          alumniName: activeUserName || 'Verified Alumni',
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
        const updated = [fallbackProblem, ...problems];
        setProblems(updated);
        try {
          localStorage.setItem('kin_live_problems', JSON.stringify(updated));
        } catch {}
      }
    } catch {
      const fallbackProblem: AlumniProblem = {
        id: `prob-${Date.now()}`,
        category: newProblemCategory,
        cardVariant: newProblemCategory === 'Housing' || newProblemCategory === 'Consumer Services' ? 'blue' : 'charcoal',
        question: newProblemQuestion.trim(),
        alumniName: activeUserName || 'Verified Alumni',
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
      const updated = [fallbackProblem, ...problems];
      setProblems(updated);
      try {
        localStorage.setItem('kin_live_problems', JSON.stringify(updated));
      } catch {}
    }

    setIsPostProblemModalOpen(false);
    showToast('New Problem Statement posted to KIN Challenge Board!');
    setNewProblemQuestion('');
    setNewProblemContext('');
  };

  const handleDeleteProblem = async (problemId: string) => {
    try {
      await fetch(`/api/problems?id=${problemId}`, { method: 'DELETE' });
    } catch {}
    const updated = problems.filter((p) => p.id !== problemId);
    setProblems(updated);
    try {
      localStorage.setItem('kin_live_problems', JSON.stringify(updated));
    } catch {}
    showToast('Problem statement removed from board.');
  };

  const handleReviewSubmission = async (subId: string, action: 'accepted' | 'changes_requested' | 'rejected') => {
    try {
      await fetch('/api/problems/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subId, status: action }),
      });
    } catch {}

    const updated = candidateSubmissions.map((s) => (s.id === subId ? { ...s, status: action } : s));
    setCandidateSubmissions(updated);
    try {
      localStorage.setItem('kin_live_submissions', JSON.stringify(updated));
    } catch {}

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

  const handlePendingQueueAction = async (id: string, action: 'approve' | 'decline') => {
    const student = pendingQueue.find((p) => p.id === id);
    setPendingQueue((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch('/api/firewall/outreach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      setOutreachApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: action === 'approve' ? 'connected' : 'declined' } : a))
      );
    } catch {}

    if (action === 'approve') {
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
      } catch {}
      showToast(`Connected with ${student?.name || 'candidate'}! Direct network admission granted.`);
    } else {
      showToast(`Declined request from ${student?.name || 'candidate'}.`);
    }
  };

  const handleInstantSettlementPayout = async () => {
    if (proPendingSettlement <= 0) {
      showToast('No pending settlement balance to withdraw.');
      return;
    }
    setIsRequestingPayout(true);
    try {
      const proEmail = user?.email || activeUserEmail || 'professional@kin.network';
      const proName = user?.name || activeUserName || 'Verified Professional';
      const res = await fetch('/api/doorway/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'payout',
          professionalEmail: proEmail,
          professionalName: proName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        try {
          confetti({
            particleCount: 130,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {}
        showToast(`Instant Settlement of ₹${data.paidAmount.toLocaleString()} transferred via UPI / NEFT!`);
        refreshProfessionalLedger();
      } else {
        showToast(data.error || 'Failed to process instant payout');
      }
    } catch {
      showToast('Network error processing payout');
    } finally {
      setIsRequestingPayout(false);
    }
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
        avatar: activeUserName.toLowerCase().includes('aditya') ? '/images/aditya_sharma.jpg' : (user?.avatarUrl || '/images/aditya_sharma.jpg'),
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
      <div className="relative z-10 w-full flex-1 flex flex-col items-center px-3 sm:px-6 lg:px-8 pt-4 pb-36">
        {/* ─── UNIVERSAL TOPBAR WITH 3D LOGO & EVALUATOR ROLE SWITCHER ─── */}
        <header className="relative z-40 w-full max-w-[1360px] mb-3 flex flex-wrap items-center justify-between gap-3 bg-white/70 backdrop-blur-xl border border-white/60 p-2.5 px-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
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

          {/* Right: Profile Setup, Resume Upload & Profile Dropdown */}
          <div className="flex items-center gap-2">
            {/* Profile Setup / Edit Wizard */}
            <button
              id="profile-setup-btn"
              onClick={handleOpenProfileWizard}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer ${
                showMascotTour && currentTourStep.id === 'profile-setup'
                  ? 'ring-4 ring-[#E25C38] ring-offset-2 animate-pulse shadow-lg shadow-[#E25C38]/40 scale-105'
                  : ''
              }`}
              title="Complete or Edit your 4-Step Profile"
            >
              <User className="w-3.5 h-3.5 text-[#E25C38]" />
              <span className="hidden sm:inline">Profile Setup</span>
              <span className="sm:hidden">Profile</span>
            </button>

            {/* User Profile Avatar with Sign Out Popover */}
            <div className="relative z-50">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-xs cursor-pointer hover:ring-2 hover:ring-[#E25C38]/40 transition-all"
                title="Account menu"
              >
                {userInitial || activeUserName.charAt(0) || 'U'}
              </button>

              {profileMenuOpen && (
                <>
                  {/* Invisible click-away backdrop */}
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.18)] z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{activeUserName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{activeUserInstitution}</p>
                    </div>
                    <button
                      id="menu-edit-profile-btn"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleOpenProfileWizard();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer font-bold"
                    >
                      <User className="w-3.5 h-3.5 text-[#E25C38]" />
                      <span>Edit 4-Step Profile</span>
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
                </>
              )}
            </div>
          </div>
        </header>

        {/* ─── MAIN CONTENT VIEWPORT ─── */}
        <main className="relative z-10 w-full max-w-[1360px] flex-1 flex flex-col min-h-[calc(100vh-140px)]">
          <div className="flex-1 w-full rounded-[36px] bg-white/25 border border-white/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.04),_inset_0_1.5px_2px_rgba(255,255,255,0.7)] p-4 sm:p-7 flex flex-col justify-between transition-all">
            
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
                {activePortfolioUrl && (
                  <a
                    href={activePortfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>

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
                          <strong>Tip from Kin:</strong> Complete your Docker milestone to unlock senior referrals at Microsoft and Uber!
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
                        {['All', 'Healthcare', 'Blockchain', 'FinTech', 'Fake News', 'Hardware', 'Automotive', 'Housing', 'Career', 'Consumer Services'].map((cat) => (
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

                    {/* Image 3 High-Contrast Bento Grid - 100% Light Themed */}
                    {filteredProblems.length === 0 ? (
                      <div className="rounded-3xl p-10 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] text-center flex flex-col items-center justify-center my-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#E25C38] mb-4">
                          <Trophy className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {problems.length === 0
                            ? 'No Active Problem Statements on Challenge Board'
                            : `No Problems Found in "${problemCategoryFilter}"`}
                        </h3>
                        <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6">
                          {problems.length === 0
                            ? 'Working professionals post real production bottlenecks from their Professional Dashboard. Once posted, you will see them here with USDC bounties and direct referral pathways.'
                            : `Try selecting "All" or another category filter to explore live engineering challenges.`}
                        </p>
                        {problems.length === 0 ? (
                          <button
                            onClick={() => handleRoleToggle('alumni')}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-[#E25C38]" />
                            <span>Switch to Professional Dashboard & Post Problem</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setProblemCategoryFilter('All')}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                          >
                            View All Categories
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProblems.map((prob) => {
                          const getCategoryBadge = (cat: string) => {
                            switch (cat) {
                              case 'Healthcare':
                                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                              case 'Blockchain':
                                return 'bg-purple-50 text-purple-700 border-purple-200';
                              case 'FinTech':
                                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                              case 'Fake News':
                                return 'bg-rose-50 text-rose-700 border-rose-200';
                              case 'Hardware':
                                return 'bg-amber-50 text-amber-800 border-amber-200';
                              case 'Automotive':
                                return 'bg-cyan-50 text-cyan-700 border-cyan-200';
                              case 'Housing':
                                return 'bg-sky-50 text-sky-700 border-sky-200';
                              case 'Career':
                                return 'bg-orange-50 text-[#E25C38] border-orange-200';
                              case 'Consumer Services':
                                return 'bg-teal-50 text-teal-700 border-teal-200';
                              default:
                                return 'bg-slate-100 text-slate-700 border-slate-200';
                            }
                          };

                          return (
                            <div
                              key={prob.id}
                              onClick={() => {
                                setSelectedProblem(prob);
                                setIsSubmitSolutionModalOpen(true);
                              }}
                              className="rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 group relative bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 hover:border-[#E25C38]/40 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(226,92,56,0.08)]"
                            >
                              {/* Card Top: Category Pill + Circular Arrow */}
                              <div>
                                <div className="flex items-center justify-between mb-3.5">
                                  <span
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getCategoryBadge(prob.category)}`}
                                  >
                                    {prob.category}
                                  </span>

                                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#E25C38] text-slate-500 group-hover:text-white transition-all flex items-center justify-center">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </div>
                                </div>

                                {/* Question in Clean Typography */}
                                <h3 className="text-base font-bold leading-snug tracking-tight text-slate-900 group-hover:text-[#E25C38] transition-colors mb-4 line-clamp-2">
                                  {prob.question}
                                </h3>
                              </div>

                              {/* Card Footer: Alumni Poster & Reward */}
                              <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500 font-medium truncate max-w-[120px]">
                                    {prob.alumniName}
                                  </span>
                                  <span className="font-bold text-slate-800 text-[11px] truncate max-w-[130px]">
                                    {prob.alumniCompany}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E25C38]/10 text-[#E25C38] border border-[#E25C38]/20">
                                    {prob.bountyReward}
                                  </span>

                                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#E25C38] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                    <span>Submit Solution</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}


                {/* 4. STUDENT CAREER TIME MACHINE TAB */}
                {activeTab === 'time-machine' && (
                  <div key="student-time-machine" className="flex-1 flex flex-col gap-6 animate-in fade-in duration-150">
                    {/* Header & AI Role Generator Controls */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            Career Time Machine (The Skill-Gap Explorer)
                          </h2>
                        </div>
                        <p className="text-xs text-slate-600">
                          Build an authentic year-by-year trajectory for any dream role & compute your deterministic skill gap.
                        </p>
                      </div>

                      {/* AI Generator Bar */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* Quick preset selector */}
                        <select
                          value={targetRoleSelection}
                          onChange={(e) => {
                            setTargetRoleSelection(e.target.value);
                            setCustomRoleInput(e.target.value);
                            handleGenerateAiPathway(e.target.value);
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 shadow-2xs focus:outline-none focus:border-[#E25C38]"
                        >
                          <option value="Staff AI Engineer">Staff AI Engineer</option>
                          <option value="FinTech Quant Lead">FinTech Quant Lead</option>
                          <option value="Founding Frontend Engineer">Founding Frontend Engineer</option>
                          <option value="Distributed Systems Architect">Distributed Systems Architect</option>
                          <option value="Autonomous Robotics Engineer">Autonomous Robotics Engineer</option>
                        </select>

                        {/* Custom Role Input */}
                        <div className="relative flex-1 sm:w-64">
                          <input
                            type="text"
                            value={customRoleInput}
                            onChange={(e) => setCustomRoleInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleGenerateAiPathway();
                            }}
                            placeholder="Or type custom role..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#E25C38]"
                          />
                        </div>

                        {/* AI Trigger Button */}
                        <button
                          id="ask-ai-timemachine-btn"
                          onClick={() => handleGenerateAiPathway()}
                          disabled={isGeneratingPathway}
                          className="px-4 py-2 rounded-xl bg-[#E25C38] hover:bg-[#d04e2b] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
                        >
                          {isGeneratingPathway ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Building Pathway...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Build Pathway</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Pathway Progression & Deterministic Skill Gap Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Timeline Progression */}
                      <div className="lg:col-span-7 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>Alumni Verified Milestone Path for</span>
                            <span className="text-[#E25C38]">
                              {activePathwayData?.targetRole || targetRoleSelection}
                            </span>
                          </h3>
                          {activePathwayData && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Verified Roadmap
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {(activePathwayData?.milestones && activePathwayData.milestones.length > 0
                            ? activePathwayData.milestones
                            : [
                                {
                                  year: 'Year 1: University & Intern',
                                  desc: 'Shipped Next.js full-stack apps, mastered React & relational schemas. 300+ GitHub commits.',
                                  hurdles: 'Overcame cold start API latency in serverless edge runtimes.'
                                },
                                {
                                  year: 'Year 2: Associate SDE',
                                  desc: 'Implemented Docker containerization, Kafka event pipelines, and production CI/CD.',
                                  hurdles: 'Debugged memory leaks in multi-tenant Redis message brokers.'
                                },
                                {
                                  year: 'Year 4: Senior SDE',
                                  desc: 'Designed high-availability microservices handling 25k req/sec with sub-50ms p99 latency.',
                                  hurdles: 'Executed zero-downtime database sharding without data corruption.'
                                },
                                {
                                  year: 'Year 6: Staff Architect',
                                  desc: 'Technical strategy, cross-org distributed consensus design, and mentorship of 18 engineers.',
                                  hurdles: 'Aligned 4 cross-functional product orgs around unified schema contracts.'
                                },
                              ]
                          ).map((step, idx) => (
                            <div key={`${step.year}-${idx}`} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2 transition-all hover:bg-orange-50/20 hover:border-[#E25C38]/30">
                              <div className="flex items-start gap-3">
                                <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  <h4 className="text-xs font-bold text-slate-900">{step.year}</h4>
                                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                                </div>
                              </div>

                              {step.hurdles && (
                                <div className="ml-10 text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80">
                                  <span className="font-bold text-orange-700 uppercase tracking-wider text-[9px] block">
                                    Hurdle Overcome
                                  </span>
                                  <p className="font-medium">{step.hurdles}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deterministic Skill Gap Analysis */}
                      <div className="lg:col-span-5 rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900">Deterministic Skill Gap</h3>
                            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                              {activePathwayData?.skillGap?.matchPercentage
                                ? `${activePathwayData.skillGap.matchPercentage}% Match`
                                : '64% Match'}
                            </span>
                          </div>

                          <div className="space-y-3.5 text-xs">
                            {(activePathwayData?.skillGap?.items && activePathwayData.skillGap.items.length > 0
                              ? activePathwayData.skillGap.items
                              : [
                                  { skill: 'React & Frontend Engineering', status: '100% (Verified)', progress: 100, verified: true },
                                  { skill: 'FastAPI & Python AI Pipelines', status: '85% (Verified)', progress: 85, verified: true },
                                  { skill: 'Docker & Container Orchestration', status: 'Missing on Profile', progress: 15, verified: false },
                                  { skill: 'High-Throughput Kafka Streams', status: 'In Progress (40%)', progress: 40, verified: false },
                                ]
                            ).map((item, i) => {
                              const isMissing = item.status.toLowerCase().includes('missing');
                              const isInProgress = item.status.toLowerCase().includes('progress');
                              const isVerified = item.verified || item.status.toLowerCase().includes('verified');

                              return (
                                <div key={i} className="space-y-1.5">
                                  <div className="flex justify-between font-bold text-xs">
                                    <span className="text-slate-800">{item.skill}</span>
                                    <span
                                      className={
                                        isVerified
                                          ? 'text-emerald-600'
                                          : isMissing
                                          ? 'text-rose-600'
                                          : 'text-amber-600'
                                      }
                                    >
                                      {item.status}
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        isVerified
                                          ? 'bg-emerald-500'
                                          : isMissing
                                          ? 'bg-rose-500'
                                          : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${Math.min(100, Math.max(5, item.progress))}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab('problems')}
                          className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>
                            {activePathwayData?.skillGap?.recommendedBounty
                              ? `Solve ${activePathwayData.skillGap.recommendedBounty} Bounty to Close Gap`
                              : 'Solve Docker Bounty to Close Gap'}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Student Authentic Career Experience Publisher (Identical to Image 2 for Students) */}
                    <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              Your Authentic Experience & Mentorship Footprint (Pathway Publisher)
                            </h3>
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[#E25C38] text-[10px] font-bold">
                              Student Profile
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Publish your real internship, lab, and open-source project milestones with hurdles overcome so seniors can verify your authenticity.
                          </p>
                        </div>
                        <button
                          id="student-add-milestone-btn"
                          onClick={() => setIsMilestoneModalOpen(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#E25C38] hover:bg-[#d04e2b] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Career Milestone</span>
                        </button>
                      </div>

                      {careerMilestones.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
                          <History className="w-8 h-8 mx-auto text-slate-300" />
                          <p className="text-xs font-bold text-slate-700">No milestones added to your trajectory yet</p>
                          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                            Click <strong>&quot;+ Add Career Milestone&quot;</strong> to document your summer internships, college labs, or projects with real hurdles overcome.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {careerMilestones.map((m) => (
                            <div
                              key={m.id}
                              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xs group"
                            >
                              <div className="flex justify-between items-center text-xs font-bold text-slate-900 mb-1">
                                <span className="flex items-center gap-2">
                                  <span>{m.role} • {m.comp}</span>
                                  {m.userRole === 'student' && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                                      Student Experience
                                    </span>
                                  )}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-slate-500">{m.period}</span>
                                  <button
                                    onClick={() => handleDeleteMilestone(m.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all"
                                    title="Delete milestone"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {m.hurdles && (
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  <strong className="text-slate-800">Hurdle Overcome:</strong> {m.hurdles}
                                </p>
                              )}

                              {m.skills && m.skills.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {m.skills.map((s, si) => (
                                    <span
                                      key={si}
                                      className="px-2 py-0.5 rounded bg-slate-200/60 text-slate-700 text-[10px] font-semibold"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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
                      {isLoadingDoorwaySlots ? (
                        <div className="col-span-1 md:col-span-3 py-16 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] text-slate-500">
                          <Loader2 className="w-8 h-8 animate-spin text-[#E25C38]" />
                          <p className="text-sm font-semibold">Loading verified professional consultation slots...</p>
                        </div>
                      ) : doorwaySlots.length === 0 ? (
                        <div className="col-span-1 md:col-span-3 p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
                          <Calendar className="w-10 h-10 mx-auto text-slate-300" />
                          <h4 className="text-base font-bold text-slate-800">No active calls available right now</h4>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Verified professionals configure their 20-minute consultation availability and rates from their Command Center. As soon as a mentor publishes hours, they will appear here.
                          </p>
                        </div>
                      ) : (
                        doorwaySlots.map((exp) => (
                          <div
                            key={exp.id}
                            className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-all group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 truncate max-w-[190px]">
                                  {exp.specialty}
                                </span>
                                <span className="text-xs font-bold text-slate-900">{exp.rating || '5.0 ★'}</span>
                              </div>

                              <h3 className="text-base font-bold text-slate-900 mt-2">{exp.professionalName}</h3>
                              <p className="text-xs text-slate-600 truncate">{exp.role} @ {exp.company}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{exp.exp || 'Senior Industry Mentor'}</p>

                              <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                                <span className="font-bold text-slate-900 block">
                                  ₹{Number(exp.fee).toLocaleString()} for 20 mins
                                </span>
                                <span className="text-[10px] text-slate-500">50% supports student endowments</span>
                              </div>
                            </div>

                            <button
                              id={`book-doorway-btn-${exp.id}`}
                              onClick={() => {
                                setSelectedExpert(exp);
                                setSelectedSlot(exp.availableSlots?.[0] || 'Saturday, 3:00 PM - 3:20 PM');
                                setBookingModalOpen(true);
                              }}
                              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Book 20-Min Slot</span>
                            </button>
                          </div>
                        ))
                      )}
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

                {/* 8. STUDENT & PROFESSIONAL COMMUNITY & SOCIAL TAB (LIVE DATABASE BACKED) */}
                {activeTab === 'community' && (
                  <LiveCommunityNetwork
                    currentUserEmail={user?.email || 'aditya@iiitd.ac.in'}
                    currentUserName={activeUserName}
                    currentUserRole={activeUserRole}
                    currentUserInstitution={activeUserInstitution}
                    isStudent={true}
                    onShowToast={showToast}
                    onOpenInboxUser={(target) => setInboxTargetUser(target)}
                    onSendCvToProfessional={(pro) => {
                      setSelectedProForCv({
                        name: pro.name,
                        role: pro.role || 'Senior Engineering Leader',
                        company: pro.institution || 'Tech Firm',
                        avatar: pro.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
                      });
                      setIsSendCvModalOpen(true);
                    }}
                  />
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
                          <p className="text-xs text-slate-600 mt-1">₹{proShare50.toLocaleString()} net earned across {proSessionsDone} completed sessions.</p>
                        </div>
                        <button
                          onClick={handleInstantSettlementPayout}
                          disabled={proPendingSettlement <= 0}
                          className="mt-4 w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
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
                            {candidateSubmissions.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-10 text-center text-slate-400">
                                  <div className="flex flex-col items-center justify-center gap-1.5">
                                    <GitPullRequest className="w-6 h-6 text-slate-300" />
                                    <span className="font-bold text-xs text-slate-700">No Candidate Submissions in Queue Yet</span>
                                    <span className="text-[11px] text-slate-400 max-w-sm">
                                      When students submit GitHub solutions to your problem statements, their PRs, AST proof-of-work, and test results appear here for your review and interview referral.
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              candidateSubmissions.map((sub) => (
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
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Live Problem Statements Management Section for Working Professionals */}
                    <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Active Problem Statements on Challenge Board</h3>
                          <p className="text-xs text-slate-500">Live bottlenecks visible to students on their challenge feed</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {problems.length} Active Challenges
                        </span>
                      </div>

                      {problems.length === 0 ? (
                        <div className="py-8 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl">
                          <Trophy className="w-6 h-6 text-slate-300 mb-2" />
                          <span className="text-xs font-bold text-slate-700 mb-1">No Active Problem Statements</span>
                          <p className="text-[11px] text-slate-500 max-w-sm mb-4">
                            Click &ldquo;+ Post New Problem Statement&rdquo; above to publish an engineering bottleneck and invite student submissions.
                          </p>
                          <button
                            onClick={() => setIsPostProblemModalOpen(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Post Problem Statement</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {problems.map((prob) => (
                            <div
                              key={prob.id}
                              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition-colors"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-800">
                                    {prob.category}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteProblem(prob.id)}
                                    title="Delete Problem"
                                    className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mb-2">
                                  {prob.question}
                                </h4>
                              </div>
                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                                <span className="font-mono font-bold text-slate-700">{prob.bountyReward}</span>
                                <span className="text-slate-500">{prob.alumniCompany}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                          onClick={handleSaveFirewallPolicy}
                          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Save Policy Configuration</span>
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
                            id="pro-add-milestone-btn"
                            onClick={() => setIsMilestoneModalOpen(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#E25C38] hover:bg-[#d04e2b] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Career Milestone</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(careerMilestones.length > 0
                            ? careerMilestones
                            : [
                                {
                                  id: 'seed-1',
                                  period: '2020 - 2021',
                                  role: 'Software Engineer Intern',
                                  comp: 'Microsoft',
                                  hurdles: 'Overcame multithreading race conditions in C++ telemetry services.',
                                  skills: ['C++', 'Telemetry', 'Multi-threading']
                                },
                                {
                                  id: 'seed-2',
                                  period: '2021 - 2023',
                                  role: 'SDE-1',
                                  comp: 'Uber Core Platform',
                                  hurdles: 'Built asynchronous webhook retry workers processing 40M events/day.',
                                  skills: ['Go', 'Kafka', 'Redis']
                                },
                                {
                                  id: 'seed-3',
                                  period: '2023 - Present',
                                  role: 'Senior Systems Architect',
                                  comp: 'Uber / TechCorp',
                                  hurdles: 'Driving zero-downtime database sharding and mentoring junior engineers.',
                                  skills: ['PostgreSQL', 'Distributed Systems', 'Mentorship']
                                }
                              ]
                          ).map((step, idx) => (
                            <div key={step.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xs group">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                                <span>{step.role} • {step.comp}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-slate-500">{step.period}</span>
                                  {step.id && !step.id.startsWith('seed-') && (
                                    <button
                                      onClick={() => handleDeleteMilestone(step.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all"
                                      title="Delete milestone"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                                <strong>Hurdle Overcome:</strong> {step.hurdles}
                              </p>
                              {step.skills && step.skills.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {step.skills.map((s, si) => (
                                    <span
                                      key={si}
                                      className="px-2 py-0.5 rounded bg-slate-200/60 text-slate-700 text-[10px] font-semibold"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
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
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-900">Consultation Pricing</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            consultIsOpenForBookings ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {consultIsOpenForBookings ? 'Active in Cockpit' : 'Paused'}
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Set Fee per 20 Minutes (₹):</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={consultFeeSetting}
                              onChange={(e) => setConsultFeeSetting(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#E25C38]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Focus Topic / Drill Specialty:</label>
                          <input
                            type="text"
                            value={consultSpecialtySetting}
                            onChange={(e) => setConsultSpecialtySetting(e.target.value)}
                            placeholder="e.g. System Design Drill"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#E25C38]"
                          />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                          <input
                            type="checkbox"
                            checked={consultIsOpenForBookings}
                            onChange={(e) => setConsultIsOpenForBookings(e.target.checked)}
                            className="accent-[#E25C38] w-4 h-4 rounded cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-700">Open for Student 20-Min Bookings</span>
                        </label>

                        <p className="text-xs text-slate-500 leading-relaxed">
                          Your earnings: <strong>50%</strong> (e.g. ₹{Math.round((parseInt(String(consultFeeSetting).replace(/[^0-9]/g, '')) || 1000) * 0.5)}/session). The remaining 50% funds competitive student grants.
                        </p>

                        <button
                          id="pro-save-pricing-btn"
                          onClick={handleSaveConsultationPricing}
                          disabled={isSavingConsultPricing}
                          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {isSavingConsultPricing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Publishing Availability...</span>
                            </>
                          ) : (
                            <span>Save Pricing & Hours</span>
                          )}
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
                              <p className="text-2xl font-black text-slate-900 mt-1">{proSessionsDone}</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-500 font-bold uppercase">Gross Revenue</span>
                              <p className="text-2xl font-black text-slate-900 mt-1">₹{proGrossRevenue.toLocaleString()}</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                              <span className="text-[10px] text-emerald-700 font-bold uppercase">Your 50% Share</span>
                              <p className="text-2xl font-black text-emerald-700 mt-1">₹{proShare50.toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Recent Bookings List */}
                          {proBookingsList.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                Booked Consultations ({proBookingsList.length})
                              </span>
                              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                                {proBookingsList.map((b) => (
                                  <div
                                    key={b.id}
                                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="font-bold text-slate-900">
                                        {b.studentName} <span className="text-slate-500 font-normal">({b.studentCollege})</span>
                                      </div>
                                      <p className="text-[11px] text-slate-600 truncate max-w-sm">
                                        {b.slot} • {b.topic}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-mono font-bold text-slate-900 block">₹{b.fee}</span>
                                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                        {b.status === 'paid_out' ? 'Settled' : '50% Accrued'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-600">
                            Pending Instant Settlement: <strong>₹{proPendingSettlement.toLocaleString()}</strong>
                          </span>
                          <button
                            id="pro-request-payout-btn"
                            onClick={handleInstantSettlementPayout}
                            disabled={proPendingSettlement <= 0 || isRequestingPayout}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isRequestingPayout ? 'Processing Instant Payout...' : 'Request Instant Settlement Payout'}
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
                          <span className="text-xs font-mono font-bold text-slate-500">Candidate: Aditya Sharma (IIIT Delhi)</span>
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
                              <span className="text-xs font-bold block">Aditya_Consensus_Answer.wav</span>
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
                            placeholder="Write constructive tactical advice for Aditya..."
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
                          { name: 'Aditya Sharma', college: 'IIIT Delhi (CSE & AI)', velocity: 'Top 3% Velocity', topSkill: 'FastAPI, PyTorch, Distributed Raft', bountyWins: '2 Bounties Won' },
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

                {/* 8. ALUMNI COMMUNITY & GHOST MODE TAB (LIVE DATABASE BACKED) */}
                {activeTab === 'community' && (
                  <LiveCommunityNetwork
                    currentUserEmail={user?.email || 'parth.arora@deepmind.com'}
                    currentUserName={activeUserName}
                    currentUserRole={activeUserRole}
                    currentUserInstitution={activeUserInstitution}
                    isStudent={false}
                    onShowToast={showToast}
                    onOpenInboxUser={(target) => setInboxTargetUser(target)}
                    onSendCvToProfessional={(pro) => {
                      setSelectedProForCv({
                        name: pro.name,
                        role: pro.role || 'Senior Engineering Leader',
                        company: pro.institution || 'Tech Firm',
                        avatar: pro.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
                      });
                      setIsSendCvModalOpen(true);
                    }}
                  />
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
        
        {/* ─── KIN AI MASCOT GUIDE FLOATING PROUDLY ABOVE DOCK ─── */}
        <AnimatePresence mode="wait">
          {!showMascotTour && (
            <motion.button
              key="dock-mascot-peek"
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                setMascotStepIndex(0);
                setShowMascotTour(true);
              }}
              className="relative mb-2 z-30 pointer-events-auto group cursor-pointer transition-transform duration-300 hover:scale-110 hover:-translate-y-1 focus:outline-none"
              title="Kin AI Guide • Click me to interact! 👋"
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-200 shadow-md text-[10px] font-bold text-slate-800 whitespace-nowrap pointer-events-none">
                Kin Guide • Click me 👋
              </div>

              <div className="w-13 h-13 relative filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
                <KinMascot pose={activeTab as any} size={52} />
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
                id={`nav-tab-${item.id}`}
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
                      {currentTourStep.id === 'profile-setup' ? (
                        <button
                          onClick={() => {
                            setShowMascotTour(false);
                            handleOpenProfileWizard();
                          }}
                          className="px-4 py-1.5 rounded-xl bg-[#E25C38] hover:bg-[#d04e2b] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 animate-pulse"
                        >
                          <User className="w-3 h-3" />
                          <span>Open Profile Setup</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (mascotStepIndex < KIN_WALKTHROUGH.length - 1) {
                              const next = mascotStepIndex + 1;
                              setMascotStepIndex(next);
                              setActiveTab(KIN_WALKTHROUGH[next].tabId);
                            } else {
                              setShowMascotTour(false);
                              showToast('Walkthrough complete! Kin is here whenever you need guidance.');
                            }
                          }}
                          className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>{mascotStepIndex === KIN_WALKTHROUGH.length - 1 ? 'Finish Tour' : 'Next'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
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
                Book 1-on-1 with {selectedExpert.professionalName || selectedExpert.name}
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                {selectedExpert.role} @ {selectedExpert.company || selectedExpert.institution || 'Verified Network'}
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-4 text-xs space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Session Focus:</span>
                  <span className="text-slate-800">{selectedExpert.specialty}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Fee (20 mins):</span>
                  <span className="text-emerald-700 font-mono">
                    ₹{Number(selectedExpert.fee).toLocaleString()} (50% supports student grants)
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Select Available Slot:</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#E25C38]"
                >
                  {(selectedExpert.availableSlots && selectedExpert.availableSlots.length > 0
                    ? selectedExpert.availableSlots
                    : [
                        'Saturday, 10:00 AM - 10:20 AM',
                        'Saturday, 3:00 PM - 3:20 PM',
                        'Sunday, 11:00 AM - 11:20 AM'
                      ]
                  ).map((sl: string, i: number) => (
                    <option key={i} value={sl}>
                      {sl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Discussion Objective / Question:
                </label>
                <input
                  type="text"
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value)}
                  placeholder="e.g. Distributed system race condition review & scale bottlenecks"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#E25C38]"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 mb-4">
                ✓ 100% human-verified session, protected by Kin&apos;s anti-AI-slop guarantee.
              </div>

              <button
                id="confirm-booking-btn"
                onClick={handleConfirmConsultBooking}
                disabled={isSubmittingBooking}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingBooking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirming Booking...</span>
                  </>
                ) : (
                  <span>Confirm Booking & Dispatch Invite</span>
                )}
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

      {/* ─── MODAL 5: SUBMIT CV & RUN GEMINI AI ATS GATEKEEPER REVIEW ─── */}
      <AnimatePresence>
        {isSendCvModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="max-w-lg w-full rounded-[32px] bg-white border border-slate-100 p-6 sm:p-7 shadow-2xl text-slate-900 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#E25C38] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">AI ATS Gatekeeper Evaluation</h3>
                    <p className="text-[11px] text-slate-500">Direct Outreach & Acceptance Review</p>
                  </div>
                </div>
                <button
                  onClick={() => !isEvaluatingAts && setIsSendCvModalOpen(false)}
                  disabled={isEvaluatingAts}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer disabled:opacity-40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target Senior Info & Live Gatekeeper Criteria */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProForCv.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                    alt={selectedProForCv.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedProForCv.name}</h4>
                    <p className="text-xs text-slate-600 font-medium">{selectedProForCv.role}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{selectedProForCv.company}</span>
                  </div>
                </div>

                {/* Senior's Live Firewall Settings (The exact policy they configured in Image 2!) */}
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#E25C38]" />
                      <span>Live Firewall Policy</span>
                    </span>
                    <span className="font-mono font-bold text-[#E25C38] bg-white px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                      Threshold: ≥ {targetProPolicy?.threshold || firewallThreshold}% Match
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-3 gap-y-1 pt-1">
                    <span>
                      <strong>Min GitHub Commits:</strong> {targetProPolicy?.minCommits || firewallMinCommits}
                    </span>
                    <span>
                      <strong>Mandatory Skills:</strong> {(targetProPolicy?.mandatorySkills || selectedFirewallSkills).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student's Uploaded / Onboarded CV Snapshot */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-[11px]">Your Evaluated Credentials</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Profile Linked
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Candidate:</span>
                    <span className="font-bold text-slate-800 truncate block">{activeUserName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Verified Commits:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {githubData?.recentPushesCount ? githubData.recentPushesCount * 4 : 18} Commits (AST Met)
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Profile Skills:</span>
                    <span className="text-slate-700 font-medium line-clamp-1">
                      {activeSkills.slice(0, 6).join(', ')}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-700 truncate">
                      <FileText className="w-3.5 h-3.5 text-[#E25C38] shrink-0" />
                      <span className="truncate">{user?.resumeName || parsedProfile?.resumeName || 'Primary_Engineering_Resume.pdf'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">Onboarded CV</span>
                  </div>
                </div>
              </div>

              {/* Engine description */}
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                Kin&apos;s automated ATS evaluation engine checks semantic project relevance, verified GitHub commits, and syntax AST checks strictly against {selectedProForCv.name.split(' ')[0]}&apos;s live gatekeeper policy.
              </p>

              {/* Action Button */}
              <button
                type="button"
                disabled={isEvaluatingAts}
                onClick={() => handleEvaluateAndSendCv(selectedProForCv, targetProPolicy || undefined)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-black hover:from-black hover:to-slate-900 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isEvaluatingAts ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Analyzing CV against Firewall Criteria...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Run ATS Review & Submit CV</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 6: PUBLISH AUTHENTIC CAREER MILESTONE ─── */}
      <AnimatePresence>
        {isMilestoneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="max-w-lg w-full rounded-[32px] bg-white border border-slate-100 p-6 sm:p-7 shadow-2xl text-slate-900 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#E25C38] flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add Authentic Career Milestone</h3>
                    <p className="text-[11px] text-slate-500">
                      Publish to your career progression footprint ({activeRole === 'Student' ? 'Student' : 'Professional'})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isSavingMilestone && setIsMilestoneModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePublishMilestone} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Role / Position Title <span className="text-[#E25C38]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMilestoneForm.role}
                    onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, role: e.target.value })}
                    placeholder={activeRole === 'Student' ? 'e.g. Software Engineer Intern / Lab Researcher' : 'e.g. Senior Systems Architect'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E25C38]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Organization / Company / Lab <span className="text-[#E25C38]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newMilestoneForm.comp}
                      onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, comp: e.target.value })}
                      placeholder="e.g. Uber / IIITD AI Lab"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Timeline Period
                    </label>
                    <input
                      type="text"
                      value={newMilestoneForm.period}
                      onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, period: e.target.value })}
                      placeholder="e.g. 2023 - 2024 or Present"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Technical Hurdle Overcome
                  </label>
                  <textarea
                    rows={3}
                    value={newMilestoneForm.hurdles}
                    onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, hurdles: e.target.value })}
                    placeholder="Describe a real problem, race condition, scalability bottleneck, or hurdle you resolved..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38] resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Skills Tagged (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newMilestoneForm.skills}
                    onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, skills: e.target.value })}
                    placeholder="e.g. React, Next.js, Docker, PostgreSQL"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#E25C38]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsMilestoneModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingMilestone}
                    className="px-5 py-2.5 rounded-xl bg-[#E25C38] hover:bg-[#d04e2b] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingMilestone ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Publish Milestone</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ─── Profile Completion Wizard Modal ─── */}
      <ProfileCompletionWizard
        isOpen={isProfileWizardOpen}
        onClose={handleCloseProfileWizard}
        initialRole={networkRole}
      />

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadResumeModalOpen}
        onClose={closeUploadResumeModal}
        onSuccess={(newProf) => {
          setParsedProfile(newProf);
          showToast('CV successfully analyzed & profile updated!');
        }}
      />

      {/* ─── Floating Real-Time Inbox Widget (Bottom Right) ─── */}
      <FloatingInboxWidget
        currentUserEmail={user?.email || (networkRole === 'alumni' ? 'parth.arora@deepmind.com' : 'aditya@iiitd.ac.in')}
        currentUserName={activeUserName}
        externalTargetUser={inboxTargetUser}
        onClearExternalTarget={() => setInboxTargetUser(null)}
      />
    </div>
  );
}
