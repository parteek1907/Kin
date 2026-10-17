export type PersonaType = 
  | 'student' 
  | 'alumni' 
  | 'founder' 
  | 'faculty' 
  | 'recruiter' 
  | 'institution';

export interface RepositoryArtifact {
  name: string;
  url: string;
  description: string;
  languages: { [key: string]: number };
  commitsCount: number;
  recentCommitHash: string;
  recentCommitMessage: string;
  verifiedAt: string;
  impactScore: number;
  citations: string[];
  isGithubVerified: boolean;
}

export interface PaperArtifact {
  title: string;
  doi?: string;
  conference: string;
  year: number;
  citationsCount: number;
  abstract: string;
  pdfUrl?: string;
}

export interface ProofOfWork {
  repos: RepositoryArtifact[];
  papers: PaperArtifact[];
  topLanguages: string[];
  totalCommits: number;
  verifiedImpactScore: number; // 0-100
  specializations: string[];
  githubUsername?: string;
  veralonEmbeddingsCalculated: boolean;
}

export interface CampusNode {
  id: string;
  name: string;
  handle: string;
  persona: PersonaType;
  avatar: string;
  role: string;
  department: string;
  institution: string;
  gradYear?: number;
  proofOfWork: ProofOfWork;
  statusBadge: string;
  bio: string;
  phoneBridged?: boolean;
  // Canvas physics fields
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  radius?: number;
}

export interface TrustEdge {
  id: string;
  source: string; // node ID or node object during simulation
  target: string;
  relationship: string;
  weight: number; // 0.0 - 1.0
  status: 'tentative' | 'verified' | 'vouched';
  vouchedAt?: string;
  bridgeNotes?: string;
}

export interface IntentMatchEvidence {
  nodeId: string;
  score: number; // 0 - 100%
  quote: string;
  repo: string;
  commitHash?: string;
}

export interface IntentCapsule {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorPersona: PersonaType;
  authorAvatar: string;
  query: string;
  category: 'Fintech' | 'AI / RAG' | 'Systems' | 'Spatial Computing' | 'Robotics' | 'DevOps';
  compensation?: string;
  duration?: string;
  createdAt: string;
  expiresIn: string;
  status: 'active' | 'matched' | 'routed';
  topMatchIds: string[];
  evidenceList: IntentMatchEvidence[];
}

export interface TrustPathHop {
  fromNode: CampusNode;
  toNode: CampusNode;
  relationship: string;
  trustWeight: number;
}

export interface ShortestTrustPath {
  path: CampusNode[];
  hops: TrustPathHop[];
  compositeTrustScore: number;
  bridgeNode?: CampusNode;
  rationale: string;
}

export interface WhatsAppMessage {
  id: string;
  sender: 'ai' | 'user' | 'bridge';
  senderName: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isVoice?: boolean;
  audioDuration?: string;
  interactiveButtons?: {
    id: string;
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  isSystemNotice?: boolean;
  cards?: {
    nodeId: string;
    name: string;
    role: string;
    score: number;
    topRepo: string;
    citation: string;
  }[];
}
