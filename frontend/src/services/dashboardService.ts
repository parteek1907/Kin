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
    role: 'Staff Systems Architect',
    company: 'Anthropic / Scale AI',
    duration: '2.5 Years',
    period: '2023 - Present',
    acquiredSkills: ['Distributed Training', 'vLLM', 'Rust', 'CUDA'],
    keyAchievement: 'Architected 100k-node KV cache memory eviction pipeline',
    verifiedBy: 'IIITD Alumni Trust Cluster #4',
    velocityScore: 98,
  },
  {
    id: 'cm-2',
    role: 'Senior Core Systems Engineer',
    company: 'Figma Infrastructure',
    duration: '2 Years',
    period: '2021 - 2023',
    acquiredSkills: ['WebAssembly', 'CRDTs', 'C++', 'WebGL'],
    keyAchievement: 'Reduced multi-user canvas latency by 41% across APAC',
    verifiedBy: 'Proof-of-Work AST Relay',
    velocityScore: 92,
  },
  {
    id: 'cm-3',
    role: 'Undergraduate Research Fellow',
    company: 'IIIT Delhi CV Lab',
    duration: '1.5 Years',
    period: '2019 - 2021',
    acquiredSkills: ['PyTorch', 'Graph Neural Networks', 'Python'],
    keyAchievement: 'Published CVPR workshop paper on self-supervised representations',
    verifiedBy: 'Prof. Faculty Node ID #09',
    velocityScore: 88,
  },
];

export const MOCK_SKILL_GAP: SkillGapAnalysis = {
  targetRole: 'AI Inference Systems Lead',
  currentSkills: ['TypeScript', 'Python', 'Docker', 'FastAPI', 'PyTorch'],
  requiredSkills: ['vLLM Kernel Tuning', 'CUDA', 'Triton', 'Distributed KV-Cache', 'Rust'],
  missingSkills: [
    { name: 'CUDA Kernel Optimization', priority: 'HIGH', frequency: 89 },
    { name: 'Triton DSL', priority: 'HIGH', frequency: 78 },
    { name: 'Distributed KV-Cache', priority: 'MEDIUM', frequency: 65 },
    { name: 'Rust FFI', priority: 'LOW', frequency: 45 },
  ],
  readinessScore: 74,
};

export const MOCK_BOUNTIES: SkillBounty[] = [
  {
    id: 101,
    title: 'Zero-Copy Shared Memory Ring Buffer for High-Throughput IPC',
    organization: 'Synthetics Core Labs',
    rewardUsdc: 850,
    deadline: '4 days left',
    difficulty: 'HARD',
    category: 'Systems & Kernels',
    requiredSkills: ['C++', 'Shared Memory', 'Linux IPC', 'Low-Latency'],
    submissionsCount: 7,
    status: 'OPEN',
    astVerification: true,
  },
  {
    id: 102,
    title: 'AST-Based TypeScript Dependency Graph Pruner',
    organization: 'KIN Ecosystem',
    rewardUsdc: 586,
    deadline: '6 days left',
    difficulty: 'MEDIUM',
    category: 'Compiler & Tooling',
    requiredSkills: ['TypeScript', 'Compiler API', 'Graph Theory'],
    submissionsCount: 12,
    status: 'OPEN',
    astVerification: true,
  },
  {
    id: 103,
    title: 'WebAssembly SIMD Matrix Multiply for Browser LLM Engine',
    organization: 'EdgeCompute Inc.',
    rewardUsdc: 1200,
    deadline: '2 days left',
    difficulty: 'EXPERT',
    category: 'WebAssembly & AI',
    requiredSkills: ['Wasm', 'Rust', 'SIMD', 'Linear Algebra'],
    submissionsCount: 4,
    status: 'OPEN',
    astVerification: true,
  },
  {
    id: 104,
    title: 'PostgreSQL Vector Search Index Benchmarker',
    organization: 'HyperScale DB',
    rewardUsdc: 450,
    deadline: '8 days left',
    difficulty: 'EASY',
    category: 'Databases',
    requiredSkills: ['SQL', 'pgvector', 'Python', 'Benchmarking'],
    submissionsCount: 19,
    status: 'REVIEWING',
    astVerification: true,
  },
];

export const MOCK_POLICIES: AutoConnectionPolicy[] = [
  {
    id: 1,
    name: 'Alumni & Verified Systems Builders',
    autoAccept: true,
    minCommits: 50,
    requiredSkills: ['Systems', 'Python', 'TypeScript'],
    allowedInstitutions: ['IIIT Delhi', 'IIT Delhi', 'Stanford', 'CMU'],
    qualificationScoreThreshold: 78,
    activeRequestsCount: 8,
  },
  {
    id: 2,
    name: 'Open Source Maintainers',
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
    title: 'Bio-Informatics High-Throughput Engine Architect',
    organization: 'GeneSys Genomics',
    industry: 'Computational Biology',
    type: 'research',
    matchScore: 92,
    transferableBridgeScore: 88,
    bridgeSkills: ['Distributed Systems', 'Python Streaming', 'DAG Processing'],
    reasoning: 'Your distributed systems skills in data streaming directly match genomic FASTA sequencing ETL.',
    status: 'DISCOVERED',
  },
  {
    id: 302,
    title: 'Autonomous Drone Flight Path Graph Optimizer',
    organization: 'Skydio Aerial Robotics',
    industry: 'Robotics & Hardware',
    type: 'bounty',
    matchScore: 89,
    transferableBridgeScore: 84,
    bridgeSkills: ['A* Search', 'Spatial Indexing', 'C++ AST'],
    reasoning: 'Proven graph traversal expertise maps seamlessly to 3D obstacle avoidance meshes.',
    status: 'DISCOVERED',
  },
  {
    id: 303,
    title: 'Quantitative High-Frequency Order Book Simulator',
    organization: 'Citadel Securities Labs',
    industry: 'FinTech / High-Frequency Trading',
    type: 'job',
    matchScore: 86,
    transferableBridgeScore: 81,
    bridgeSkills: ['Zero-Copy IPC', 'C++', 'Lock-Free Queues'],
    reasoning: 'Your real-time low-latency telemetry experience transfers directly to L3 market tick processing.',
    status: 'SHORTLISTED',
  },
  {
    id: 304,
    title: 'Cyber-Physical Systems & Micro-Kernel Sentinel',
    organization: 'VeriSys Security Labs',
    industry: 'Embedded Systems & Security',
    type: 'bounty',
    matchScore: 84,
    transferableBridgeScore: 80,
    bridgeSkills: ['Rust', 'eBPF', 'Static Verification'],
    reasoning: 'Formal AST parsing skills translate directly into eBPF runtime safety assertions.',
    status: 'DISCOVERED',
  },
];

export const MOCK_SOCIAL_FEED: SocialFeedItem[] = [
  {
    id: 401,
    author: {
      name: 'Dr. Aarav Sharma',
      role: 'Founding Engineer @ NexaML (Ex-IIITD)',
      institution: 'IIIT Delhi 2021',
      avatar: '/images/hero_builder_avatar.jpg',
      verified: true,
    },
    content: 'Just deployed our speculative decoding engine on 8x H100s. AST verified benchmark showed a 3.4x speedup over standard baseline. Welcoming IIITD juniors for summer research grants!',
    timestamp: '22m ago',
    mutualConnections: 14,
    tags: ['#Inference', '#GPU', '#AlumniVouch', '#IIITD'],
    likes: 42,
    connected: true,
  },
  {
    id: 402,
    author: {
      name: 'Elena Rostova',
      role: 'Principal Compiler Engineer',
      institution: 'CMU Systems',
      avatar: '/images/hero_builder_avatar.jpg',
      verified: true,
    },
    content: 'Created a new Skill Bounty: $850 USDC for a clean zero-copy Linux ring buffer. Verification runs deterministically against our AST suite. Check the Bounty Network tab.',
    timestamp: '1h ago',
    mutualConnections: 8,
    tags: ['#SkillBounty', '#Rust', '#Systems'],
    likes: 67,
    connected: false,
  },
  {
    id: 403,
    author: {
      name: 'Rohan Mehta',
      role: 'Co-Founder @ Stealth Robotics',
      institution: 'IIT Delhi 2020',
      avatar: '/images/hero_builder_avatar.jpg',
      verified: true,
    },
    content: 'Our Qualification-Based Auto Connect policy just approved 6 student builders without a single resume review. Code commits and verified PRs speak louder than credentials.',
    timestamp: '3h ago',
    mutualConnections: 21,
    tags: ['#AutoConnect', '#ProofOfWork', '#Hiring'],
    likes: 95,
    connected: true,
  },
];
