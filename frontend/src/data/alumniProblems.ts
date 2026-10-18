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

export interface OutreachApplication {
  id: string;
  studentEmail: string;
  studentName: string;
  studentCollege: string;
  professionalName: string;
  professionalRole: string;
  professionalCompany?: string;
  professionalAvatar?: string;
  policy: string;
  targetMatch: number;
  currentMatch: number;
  met: string[];
  missing: string[];
  atsFeedback?: string;
  submittedAt: string;
  status: 'evaluated' | 'in_manual_queue' | 'connected' | 'declined';
  manualNote?: string;
  evaluatedAt: string;
}

// Live, connected problems posted by working professionals (starts clean, zero hardcoded demo data)
export const ALUMNI_PROBLEMS: AlumniProblem[] = [];

// Live candidate submissions queue (populated directly from student solution submissions)
export const INITIAL_SUBMITTED_SOLUTIONS: CandidateSolutionSubmission[] = [];

