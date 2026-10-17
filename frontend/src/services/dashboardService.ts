// Frontend Dashboard Data & Backend Connector for KIN Platform
// Fully aligns with backend models in app/features/

export interface CareerMilestone {
  id: string;
  role: string;
  company: string;
  duration: string;
  period: string;
  acquiredSkills: string[];
  keyAchievement: string;
  verifiedBy: string;
  velocityScore: number;
}

export interface SkillGapAnalysis {
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: { name: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; frequency: number }[];
  readinessScore: number;
}

export interface SkillBounty {
  id: number;
  title: string;
  organization: string;
  rewardUsdc: number;
  deadline: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  category: string;
  requiredSkills: string[];
  submissionsCount: number;
  status: 'OPEN' | 'REVIEWING' | 'AWARDED';
  astVerification: boolean;
  reward?: string;
  sponsor?: string;
  description?: string;
}

export interface AutoConnectionPolicy {
  id: number;
  name: string;
  autoAccept: boolean;
  minCommits: number;
  requiredSkills: string[];
  allowedInstitutions: string[];
  qualificationScoreThreshold: number;
  activeRequestsCount: number;
  targetRole?: string;
  minMatchScore?: number;
  verifiedOnly?: boolean;
}

export interface RadarOpportunity {
  id: number;
  title: string;
  organization: string;
  industry: string;
  type: 'job' | 'bounty' | 'research' | 'fellowship';
  matchScore: number;
  transferableBridgeScore: number;
  bridgeSkills: string[];
  reasoning: string;
  status: 'DISCOVERED' | 'SHORTLISTED' | 'APPLIED';
}

export interface SocialFeedItem {
  id: number;
  author: {
    name: string;
    role: string;
    institution: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: string;
  mutualConnections: number;
  tags: string[];
  likes: number;
  connected: boolean;
}

export interface DashboardMetricStats {
  verifiedBuilders: string;
  activeCommits: string;
  escrowVolume: string;
  openBounties: number;
  networkVelocity: number;
  talentRadarMatches: number;
  autoAcceptedHandshakes: number;
}

export const INITIAL_DASHBOARD_STATS: DashboardMetricStats = {
  verifiedBuilders: '76k',
  activeCommits: '1.5m',
  escrowVolume: '$3.6k',
  openBounties: 47,
  networkVelocity: 94.2,
  talentRadarMatches: 18,
  autoAcceptedHandshakes: 64,
};

export const MOCK_CAREER_MILESTONES: CareerMilestone[] = [
  {
    id: 'cm-1',
    role: 'Lead Systems Architect',
    company: 'Anthropic / Scale AI',
    duration: '2.5 Years',
    period: '2023 - Present',
    acquiredSkills: ['Distributed Systems', 'GPU Acceleration', 'Rust', 'CUDA'],
    keyAchievement: 'Built ultra-fast memory management for large AI models',
    verifiedBy: 'Alumni Mentorship Network',
    velocityScore: 98,
  },
  {
    id: 'cm-2',
    role: 'Senior Core Systems Engineer',
    company: 'Figma Infrastructure',
    duration: '2 Years',
    period: '2021 - 2023',
    acquiredSkills: ['WebAssembly', 'Real-Time Sync', 'C++', 'WebGL'],
    keyAchievement: 'Made multiplayer canvas 41% faster for millions of users',
    verifiedBy: 'Automated Code Verification',
    velocityScore: 92,
  },
  {
    id: 'cm-3',
    role: 'Undergraduate Research Fellow',
    company: 'University Computer Vision Lab',
    duration: '1.5 Years',
    period: '2019 - 2021',
    acquiredSkills: ['PyTorch', 'Neural Networks', 'Python'],
    keyAchievement: 'Published research paper on AI pattern recognition',
    verifiedBy: 'Faculty Review',
    velocityScore: 88,
  },
];

export const MOCK_SKILL_GAP: SkillGapAnalysis = {
  targetRole: 'AI Systems Engineer',
  currentSkills: ['TypeScript', 'Python', 'Docker', 'FastAPI', 'PyTorch'],
  requiredSkills: ['GPU Programming (CUDA)', 'High-Performance Python', 'Distributed Systems', 'Rust'],
  missingSkills: [
    { name: 'GPU Programming (CUDA)', priority: 'HIGH', frequency: 89 },
    { name: 'Performance Optimization', priority: 'HIGH', frequency: 78 },
    { name: 'Distributed Systems', priority: 'MEDIUM', frequency: 65 },
    { name: 'Rust Basics', priority: 'LOW', frequency: 45 },
  ],
  readinessScore: 74,
};

export const MOCK_BOUNTIES: SkillBounty[] = [
  {
    id: 101,
    title: 'High-Performance Shared Memory Buffer in C++',
    organization: 'Synthetics Core Labs',
    rewardUsdc: 850,
    deadline: '4 days left',
    difficulty: 'HARD',
    category: 'Systems Programming',
    requiredSkills: ['C++', 'Shared Memory', 'Linux', 'Low Latency'],
    submissionsCount: 7,
    status: 'OPEN',
    astVerification: true,
  },
  {
    id: 102,
    title: 'Clean Project Dependency Analyzer for TypeScript',
    organization: 'KIN Ecosystem',
    rewardUsdc: 586,
    deadline: '6 days left',
    difficulty: 'MEDIUM',
    category: 'Developer Tools',
    requiredSkills: ['TypeScript', 'Node.js', 'Dependency Graph'],
    submissionsCount: 12,
    status: 'OPEN',
    astVerification: true,
  },
  {
    id: 103,
    title: 'Fast Matrix Math in Browser with WebAssembly',
    organization: 'EdgeCompute Inc.',
    rewardUsdc: 1200,
    deadline: '2 days left',
    difficulty: 'EXPERT',
    category: 'WebAssembly & AI',
    requiredSkills: ['WebAssembly', 'Rust', 'Math Algorithms'],
    submissionsCount: 4,
    status: 'OPEN',
    astVerification: true,
  },
  {
    id: 104,
    title: 'Fast Vector Search Benchmark for PostgreSQL',
    organization: 'HyperScale DB',
    rewardUsdc: 450,
    deadline: '8 days left',
    difficulty: 'EASY',
    category: 'Database Performance',
    requiredSkills: ['SQL', 'pgvector', 'Python', 'Benchmarking'],
    submissionsCount: 19,
    status: 'REVIEWING',
    astVerification: true,
  },
];

export const MOCK_POLICIES: AutoConnectionPolicy[] = [
  {
    id: 1,
    name: 'Alumni & Verified Developers',
    autoAccept: true,
    minCommits: 50,
    requiredSkills: ['Backend', 'Python', 'TypeScript'],
    allowedInstitutions: ['Top Alumni Network', 'Verified Partners'],
    qualificationScoreThreshold: 78,
    activeRequestsCount: 8,
  },
  {
    id: 2,
    name: 'Open Source Contributors',
    autoAccept: false,
    minCommits: 120,
    requiredSkills: ['Rust', 'C++', 'Go'],
    allowedInstitutions: [],
    qualificationScoreThreshold: 85,
    activeRequestsCount: 3,
  },
];

export const MOCK_RADAR_OPPORTUNITIES: RadarOpportunity[] = [
  {
    id: 301,
    title: 'Genomics Big Data Pipeline Engineer',
    organization: 'GeneSys Genomics',
    industry: 'Computational Biology',
    type: 'research',
    matchScore: 92,
    transferableBridgeScore: 88,
    bridgeSkills: ['Distributed Data', 'Python Streaming', 'Data Pipelines'],
    reasoning: 'Your data processing and Python streaming skills match biological data pipelines directly.',
    status: 'DISCOVERED',
  },
  {
    id: 302,
    title: 'Autonomous Drone Flight Path Navigator',
    organization: 'Skydio Aerial Robotics',
    industry: 'Robotics & Hardware',
    type: 'bounty',
    matchScore: 89,
    transferableBridgeScore: 84,
    bridgeSkills: ['Graph Search (A*)', '3D Coordinates', 'C++ Performance'],
    reasoning: 'Your graph algorithm skills easily transfer to 3D drone navigation.',
    status: 'DISCOVERED',
  },
  {
    id: 303,
    title: 'Real-Time Financial Order Simulator',
    organization: 'Citadel Securities Labs',
    industry: 'FinTech / High-Frequency Trading',
    type: 'job',
    matchScore: 86,
    transferableBridgeScore: 81,
    bridgeSkills: ['Fast Networking', 'C++', 'Message Queues'],
    reasoning: 'Your low-latency network experience transfers directly to real-time market trading feeds.',
    status: 'SHORTLISTED',
  },
  {
    id: 304,
    title: 'Operating System Security Defender',
    organization: 'VeriSys Security Labs',
    industry: 'Embedded Systems & Security',
    type: 'bounty',
    matchScore: 84,
    transferableBridgeScore: 80,
    bridgeSkills: ['Rust', 'OS Security', 'Code Verification'],
    reasoning: 'Your systems programming and Rust skills directly match secure operating system defense.',
    status: 'DISCOVERED',
  },
];

export const MOCK_SOCIAL_FEED: SocialFeedItem[] = [
  {
    id: 401,
    author: {
      name: 'Dr. Aarav Sharma',
      role: 'Founding Engineer @ NexaML (Alumni)',
      institution: 'Verified Alumni 2021',
      avatar: '/images/hero_builder_avatar.jpg',
      verified: true,
    },
    content: 'Just deployed our fast AI model serving pipeline. Automated tests showed a 3.4x speedup over standard baseline. Welcoming student builders for research mentorship!',
    timestamp: '22m ago',
    mutualConnections: 14,
    tags: ['#MachineLearning', '#GPU', '#AlumniNetwork', '#Mentorship'],
    likes: 42,
    connected: true,
  },
  {
    id: 402,
    author: {
      name: 'Elena Rostova',
      role: 'Principal Systems Engineer',
      institution: 'Systems Research',
      avatar: '/images/hero_builder_avatar.jpg',
      verified: true,
    },
    content: 'Added a new coding challenge: $850 USDC for a clean Linux shared memory buffer. Automated tests verify submissions in under 30 seconds. Check the Paid Challenges tab!',
    timestamp: '1h ago',
    mutualConnections: 8,
    tags: ['#CodingChallenge', '#Rust', '#Systems'],
    likes: 67,
    connected: false,
  },
  {
    id: 403,
    author: {
      name: 'Rohan Mehta',
      role: 'Co-Founder @ Stealth Robotics',
      institution: 'Alumni Founder',
      avatar: '/images/hero_builder_avatar.jpg',
      verified: true,
    },
    content: 'Our Smart Auto-Connect feature just connected 6 student developers with our team without any resumes or cold emails. Verified code speaks for itself!',
    timestamp: '3h ago',
    mutualConnections: 21,
    tags: ['#AutoConnect', '#VerifiedSkills', '#Hiring'],
    likes: 95,
    connected: true,
  },
];
