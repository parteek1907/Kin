import { MatchingWeights, getMatchingWeights } from './weights';

export interface ScoredCandidateResult {
  score: number;           // 0 - 100
  reasons: string[];       // Human-readable rationale
  componentScores: {
    skillOverlap: number;
    semanticSimilarity: number;
    experienceFit: number;
    trustProximity: number;
    recencyOfActivity: number;
  };
}

export interface ScorerRequirementInput {
  title: string;
  type: string;
  mustHaveSkills: string[];
  niceToHaveSkills?: string[];
  experienceLevel: string;
  locationOrRemote: string;
  institution?: string;
  batch?: string;
}

export interface ScorerCandidateInput {
  name: string;
  headline: string;
  skills: string[];
  institution: string;
  batch: string;
  location: string;
  isRemote: boolean;
  experienceYears: number;
  verifiedNode: boolean;
  trustScore?: number;
  activityScore?: number;
  lastActiveAt?: Date | string;
  bio?: string | null;
  // NOTE: Protected attributes (gender, religion, caste, age, etc.) are NOT supported or accepted.
}

/**
 * Deterministic, unit-testable candidate scoring engine.
 * STRICT COMPLIANCE: Protected attributes (gender, religion, caste, age, region of origin)
 * are NEVER accepted, inferred, or factored into scoring.
 */
export function scoreCandidate(
  requirement: ScorerRequirementInput,
  candidate: ScorerCandidateInput,
  customWeights?: MatchingWeights
): ScoredCandidateResult {
  const weights = customWeights || getMatchingWeights();
  const reasons: string[] = [];

  // 1. Skill Overlap (0.0 to 1.0)
  const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase().trim());
  const mustHaves = requirement.mustHaveSkills.map((s) => s.toLowerCase().trim());
  const niceToHaves = (requirement.niceToHaveSkills || []).map((s) => s.toLowerCase().trim());

  let matchedSkills: string[] = [];
  let mustHaveMatches = 0;

  for (const skill of mustHaves) {
    if (candidateSkillsLower.some((cs) => cs.includes(skill) || skill.includes(cs))) {
      mustHaveMatches++;
      matchedSkills.push(skill);
    }
  }

  let niceToHaveMatches = 0;
  for (const skill of niceToHaves) {
    if (candidateSkillsLower.some((cs) => cs.includes(skill) || skill.includes(cs))) {
      niceToHaveMatches++;
      matchedSkills.push(skill);
    }
  }

  const skillScore = mustHaves.length > 0
    ? (mustHaveMatches / mustHaves.length) * 0.8 + (niceToHaves.length > 0 ? (niceToHaveMatches / niceToHaves.length) * 0.2 : 0.2)
    : 0.7;

  if (matchedSkills.length > 0) {
    reasons.push(`Matches ${matchedSkills.slice(0, 3).map(capitalize).join(', ')}`);
  }

  // 2. Semantic Similarity (0.0 to 1.0)
  const reqText = `${requirement.title} ${requirement.type} ${requirement.mustHaveSkills.join(' ')}`.toLowerCase();
  const candText = `${candidate.headline} ${candidate.bio || ''} ${candidate.skills.join(' ')}`.toLowerCase();

  const reqTokens = new Set(reqText.split(/\W+/).filter((t) => t.length > 2));
  let tokenOverlap = 0;
  for (const token of reqTokens) {
    if (candText.includes(token)) {
      tokenOverlap++;
    }
  }
  const semanticScore = reqTokens.size > 0 ? Math.min(1.0, tokenOverlap / Math.min(reqTokens.size, 8)) : 0.6;

  // 3. Experience Fit (0.0 to 1.0)
  let expScore = 0.8;
  const expYears = candidate.experienceYears || 0;
  const level = requirement.experienceLevel.toLowerCase();

  if (requirement.type === 'intern' || level === 'junior') {
    expScore = expYears <= 2 ? 1.0 : 0.7;
    reasons.push(`${expYears <= 1 ? 'Early-career' : `${expYears} yrs exp`} fit`);
  } else if (level === 'senior') {
    expScore = expYears >= 4 ? 1.0 : expYears >= 2 ? 0.75 : 0.4;
    if (expYears >= 3) reasons.push(`${expYears}+ years hands-on experience`);
  } else if (level === 'mid') {
    expScore = expYears >= 2 && expYears <= 5 ? 1.0 : 0.7;
    reasons.push(`${expYears} yrs balanced experience`);
  } else {
    expScore = 0.9;
  }

  // 4. Trust Proximity (0.0 to 1.0)
  let trustProximity = 0.5; // baseline
  const sameCollege =
    requirement.institution &&
    candidate.institution &&
    requirement.institution.toLowerCase().trim() === candidate.institution.toLowerCase().trim();

  if (sameCollege) {
    trustProximity += 0.3;
    reasons.push(`Same campus (${candidate.institution})`);
  }

  const sameBatch =
    requirement.batch &&
    candidate.batch &&
    requirement.batch.trim() === candidate.batch.trim();

  if (sameBatch) {
    trustProximity += 0.1;
    reasons.push(`Same batch (${candidate.batch})`);
  }

  if (candidate.verifiedNode) {
    trustProximity += 0.1;
    reasons.push('Verified campus node');
  }
  trustProximity = Math.min(1.0, trustProximity);

  // 5. Recency of Activity (0.0 to 1.0)
  let recencyScore = 0.8;
  if (candidate.lastActiveAt) {
    const activeDate = new Date(candidate.lastActiveAt).getTime();
    const daysSince = Math.max(0, (Date.now() - activeDate) / (1000 * 60 * 60 * 24));
    if (daysSince <= 2) {
      recencyScore = 1.0;
      reasons.push('Active recently');
    } else if (daysSince <= 7) {
      recencyScore = 0.85;
    } else if (daysSince <= 30) {
      recencyScore = 0.65;
    } else {
      recencyScore = 0.4;
    }
  }

  // Location note if remote
  if (candidate.isRemote) {
    reasons.push('Open to remote');
  } else if (candidate.location) {
    reasons.push(`Based in ${candidate.location}`);
  }

  // Weighted composite score (0 to 100)
  const composite =
    skillScore * weights.skillOverlap +
    semanticScore * weights.semanticSimilarity +
    expScore * weights.experienceFit +
    trustProximity * weights.trustProximity +
    recencyScore * weights.recencyOfActivity;

  const finalScore = Math.round(Math.min(100, Math.max(10, composite * 100)));

  return {
    score: finalScore,
    reasons: Array.from(new Set(reasons)),
    componentScores: {
      skillOverlap: Math.round(skillScore * 100),
      semanticSimilarity: Math.round(semanticScore * 100),
      experienceFit: Math.round(expScore * 100),
      trustProximity: Math.round(trustProximity * 100),
      recencyOfActivity: Math.round(recencyScore * 100),
    },
  };
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
