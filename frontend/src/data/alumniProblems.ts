export interface AlumniProblem {
  id: string;
  category: 'Automotive' | 'Housing' | 'Healthcare' | 'Blockchain' | 'FinTech' | 'Fake News' | 'Hardware' | 'Career' | 'Consumer Services';
  cardVariant: 'white' | 'blue' | 'charcoal';
  question: string;
  alumniName: string;
  alumniTitle: string;
  alumniCompany: string;
  alumniAvatar?: string;
  bountyReward: string;
  rewardType: 'USDC' | 'Grant' | 'Referral';
  requiredTech: string[];
  context: string;
  starterRepoUrl?: string;
  deadline: string;
  testCasesCount: number;
  status: 'open' | 'submitted' | 'under_review';
}

export const ALUMNI_PROBLEMS: AlumniProblem[] = [
  {
    id: 'prob-1',
    category: 'Automotive',
    cardVariant: 'white',
    question: "Why can't first time used car buyers verify car histories, conditions and future maintenance costs?",
    alumniName: 'Rahul Mehta',
    alumniTitle: 'Staff Platform Engineer',
    alumniCompany: 'CarDekho & Uber',
    alumniAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹18,000 / $200 USDC',
    rewardType: 'USDC',
    requiredTech: ['Next.js', 'OBD-II Telemetry', 'PostgreSQL', 'Predictive ML'],
    context: 'First-time buyers suffer from information asymmetry regarding odometer rollbacks, hidden structural rust, and predictive maintenance schedules.',
    starterRepoUrl: 'https://github.com/kin-network/automotive-history-verifier',
    deadline: '5 days left',
    testCasesCount: 16,
    status: 'open'
  },
  {
    id: 'prob-2',
    category: 'Housing',
    cardVariant: 'blue',
    question: "Why can't renters access verified mold, pests or hazards before signing leases?",
    alumniName: 'Vikram Sethi',
    alumniTitle: 'Principal Cloud Architect',
    alumniCompany: 'Zillow Group',
    alumniAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹22,000 / $250 USDC',
    rewardType: 'USDC',
    requiredTech: ['Next.js', 'Municipal API Sync', 'GraphQL', 'FastAPI'],
    context: 'Municipal health violation registers, habitability complaints, and pest treatment permits are locked in legacy government PDF records.',
    starterRepoUrl: 'https://github.com/kin-network/civic-hazard-verifier',
    deadline: '3 days left',
    testCasesCount: 22,
    status: 'open'
  },
  {
    id: 'prob-3',
    category: 'Healthcare',
    cardVariant: 'blue',
    question: 'Why are patient duplicate records in medical history still fragmented across hospital networks?',
    alumniName: 'Dr. Priya Sharma',
    alumniTitle: 'Lead Bioinformatician & SDE',
    alumniCompany: 'Apollo Health & Epic EHR',
    alumniAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹30,000 / $350 USDC',
    rewardType: 'USDC',
    requiredTech: ['Python', 'FHIR Standards', 'Record Linkage', 'Vector Search'],
    context: 'Over 18% of hospital records suffer duplicate patient files with slight phonetic misspellings, mismatched addresses, and missing blood groups leading to lethal errors.',
    starterRepoUrl: 'https://github.com/kin-network/ehr-deduplication-engine',
    deadline: '4 days left',
    testCasesCount: 28,
    status: 'open'
  },
  {
    id: 'prob-4',
    category: 'Healthcare',
    cardVariant: 'white',
    question: 'Why do teachers lack real time mental health support at work?',
    alumniName: 'Ananya Roy',
    alumniTitle: 'HealthTech Founder & Alum',
    alumniCompany: 'MindWell Labs',
    alumniAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹15,000 / $180 USDC',
    rewardType: 'USDC',
    requiredTech: ['React Native', 'WebRTC', 'HIPAA Guardrails', 'TailwindCSS'],
    context: 'Secondary school educators experience acute burnout without discreet, confidential avenues to talk to certified therapists during school breaks.',
    starterRepoUrl: 'https://github.com/kin-network/educator-wellness-bridge',
    deadline: '6 days left',
    testCasesCount: 14,
    status: 'open'
  },
  {
    id: 'prob-5',
    category: 'Blockchain',
    cardVariant: 'charcoal',
    question: "Why can't micro-merchants accept cross-border stablecoin payments without high gas fee volatility?",
    alumniName: 'Siddharth Verma',
    alumniTitle: 'Web3 Protocol Lead',
    alumniCompany: 'Polygon Technology',
    alumniAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹35,000 / $400 USDC',
    rewardType: 'USDC',
    requiredTech: ['Solidity', 'Account Abstraction (ERC-4337)', 'Paymasters', 'Ethers.js'],
    context: 'Small cross-border exporters lose 6-8% in intermediary wire fees and cannot bear gas price spikes when settling everyday invoices.',
    starterRepoUrl: 'https://github.com/kin-network/gasless-merchant-rail',
    deadline: '2 days left',
    testCasesCount: 30,
    status: 'open'
  },
  {
    id: 'prob-6',
    category: 'Consumer Services',
    cardVariant: 'blue',
    question: "Why can't consumers see verified kitchen safety standards on food delivery apps?",
    alumniName: 'Devika Nair',
    alumniTitle: 'VP of Engineering',
    alumniCompany: 'Zomato & Blinkit',
    alumniAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹20,000 / $240 USDC',
    rewardType: 'USDC',
    requiredTech: ['TypeScript', 'Computer Vision', 'FSSAI Live API', 'GraphQL'],
    context: 'Food delivery apps only show self-reported ratings. Consumers cannot verify pest inspection logs or water filtration compliance stamps.',
    starterRepoUrl: 'https://github.com/kin-network/kitchen-safety-auditor',
    deadline: '7 days left',
    testCasesCount: 18,
    status: 'open'
  },
  {
    id: 'prob-7',
    category: 'Fake News',
    cardVariant: 'charcoal',
    question: "Why can't newsrooms verify synthesized deepfake voice clips and AI video leaks in real-time?",
    alumniName: 'Rohan Sengupta',
    alumniTitle: 'AI Research Scientist',
    alumniCompany: 'Microsoft Research AI',
    alumniAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹40,000 / $450 USDC',
    rewardType: 'USDC',
    requiredTech: ['PyTorch', 'Audio Spectrograms', 'C2PA Metadata', 'FastAPI'],
    context: 'Breaking newsrooms receive cloned voice clips within minutes of viral incidents. Existing tools take hours to verify phase continuity and frequency artifacts.',
    starterRepoUrl: 'https://github.com/kin-network/deepfake-audio-forensics',
    deadline: '1 day left',
    testCasesCount: 35,
    status: 'open'
  },
  {
    id: 'prob-8',
    category: 'Hardware',
    cardVariant: 'charcoal',
    question: 'Why is connecting specialized hardware to laptops still unreliable and frustrating?',
    alumniName: 'Kabir Anand',
    alumniTitle: 'Embedded Systems Architect',
    alumniCompany: 'Intel Labs',
    alumniAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹25,000 / $300 USDC',
    rewardType: 'USDC',
    requiredTech: ['Rust', 'WebUSB', 'Serial Handshake', 'C++'],
    context: 'Medical devices, robotics actuators, and FPGA debuggers repeatedly drop packets due to fragile serial driver mismatch and baud rate collisions across OSes.',
    starterRepoUrl: 'https://github.com/kin-network/universal-webusb-gateway',
    deadline: '8 days left',
    testCasesCount: 20,
    status: 'open'
  },
  {
    id: 'prob-9',
    category: 'Healthcare',
    cardVariant: 'blue',
    question: 'Why is distinguishing sprains from fractures impossible without costly hospital visits?',
    alumniName: 'Dr. Sameer Joshi',
    alumniTitle: 'Clinical AI Director',
    alumniCompany: 'Fortis Health AI',
    alumniAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹28,000 / $320 USDC',
    rewardType: 'USDC',
    requiredTech: ['TensorFlow Lite', 'Edge AI', 'Mobile Kinematics', 'Swift'],
    context: 'Accident victims clog ER triage units for low-grade ligament sprains because community clinics lack portable acoustic or kinematic fracture discriminators.',
    starterRepoUrl: 'https://github.com/kin-network/ortho-acoustic-triage',
    deadline: '4 days left',
    testCasesCount: 24,
    status: 'open'
  },
  {
    id: 'prob-10',
    category: 'FinTech',
    cardVariant: 'white',
    question: 'Why do young earners struggle with algorithmic tax harvesting and automated emergency buffers?',
    alumniName: 'Tanya Bajaj',
    alumniTitle: 'Head of WealthTech',
    alumniCompany: 'Zerodha Tech',
    alumniAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹20,000 / $250 USDC',
    rewardType: 'USDC',
    requiredTech: ['Python', 'Account Aggregator (AA) SDK', 'Pandas', 'Next.js'],
    context: 'First-time software engineers leave up to ₹1.5L in capital gains offsets unharvested every fiscal year due to complex manual portfolio tracking.',
    starterRepoUrl: 'https://github.com/kin-network/tax-harvesting-agent',
    deadline: '5 days left',
    testCasesCount: 19,
    status: 'open'
  },
  {
    id: 'prob-11',
    category: 'Career',
    cardVariant: 'white',
    question: 'Why do people leaving formal education lack structure, mentorship and clear career guidance?',
    alumniName: 'Arjun Das',
    alumniTitle: 'Senior Engineering Director',
    alumniCompany: 'Google Cloud Core',
    alumniAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹18,000 / Fast-Track Referral',
    rewardType: 'Referral',
    requiredTech: ['Vector Search', 'Graph Databases', 'Next.js', 'LLM Agent'],
    context: 'Graduating engineers experience severe career cliff-drops where university syllabus ends and industrial high-concurrency systems begin.',
    starterRepoUrl: 'https://github.com/kin-network/career-milestone-graph',
    deadline: '9 days left',
    testCasesCount: 15,
    status: 'open'
  },
  {
    id: 'prob-12',
    category: 'Healthcare',
    cardVariant: 'charcoal',
    question: "Why can't anxious people find trustworthy non-prescription sleep solutions easily?",
    alumniName: 'Neha Kapoor',
    alumniTitle: 'Neurotech Fellow',
    alumniCompany: 'Stanford BioX Lab',
    alumniAvatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=100&auto=format&fit=crop&q=80',
    bountyReward: '₹16,000 / $190 USDC',
    rewardType: 'USDC',
    requiredTech: ['Audio Synthesis', 'Circadian Biology', 'HealthKit API', 'React Native'],
    context: 'Standard white noise apps fail to induce delta brainwave entrainment because they lack dynamic feedback synced with biometric resting heart rate.',
    starterRepoUrl: 'https://github.com/kin-network/binaural-sleep-entrainer',
    deadline: '6 days left',
    testCasesCount: 17,
    status: 'open'
  }
];

export interface CandidateSolutionSubmission {
  id: string;
  problemId: string;
  problemQuestion: string;
  studentName: string;
  studentCollege: string;
  studentAvatar: string;
  repoUrl: string;
  liveDemoUrl?: string;
  approachSummary: string;
  testsPassed: string;
  submittedAt: string;
  status: 'pending' | 'accepted' | 'changes_requested' | 'rejected';
}

export const INITIAL_SUBMITTED_SOLUTIONS: CandidateSolutionSubmission[] = [
  {
    id: 'sub-1',
    problemId: 'prob-3',
    problemQuestion: 'Why are patient duplicate records in medical history still fragmented across hospital networks?',
    studentName: 'Darsh Ohri',
    studentCollege: 'IIIT Delhi (Batch 2026)',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    repoUrl: 'https://github.com/darshohri/ehr-deduplication-fastapi',
    liveDemoUrl: 'https://ehr-dedup-demo.vercel.app',
    approachSummary: 'Implemented phonetic double-metaphone hashing with Levenshtein distance fallback over FHIR JSON resources. Added cosine similarity over vector embeddings for address variations.',
    testsPassed: '28/28 tests passed (100%)',
    submittedAt: '2 hours ago',
    status: 'pending'
  },
  {
    id: 'sub-2',
    problemId: 'prob-5',
    problemQuestion: "Why can't micro-merchants accept cross-border stablecoin payments without high gas fee volatility?",
    studentName: 'Aarav Sharma',
    studentCollege: 'IIT Bombay',
    studentAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    repoUrl: 'https://github.com/aarav/erc4337-paymaster-hub',
    liveDemoUrl: 'https://paymaster-testnet.polygon.io',
    approachSummary: 'Built an ERC-4337 Biconomy Paymaster wrapper that sponsors merchant gas fees using native USDC balance swaps on Polygon.',
    testsPassed: '30/30 tests passed (100%)',
    submittedAt: '5 hours ago',
    status: 'pending'
  }
];
