import { waConfig } from '../whatsapp/config';

export interface MatchingWeights {
  skillOverlap: number;       // default: 0.35 (35%)
  semanticSimilarity: number; // default: 0.25 (25%)
  experienceFit: number;      // default: 0.15 (15%)
  trustProximity: number;     // default: 0.15 (15%)
  recencyOfActivity: number;  // default: 0.10 (10%)
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  skillOverlap: 0.35,
  semanticSimilarity: 0.25,
  experienceFit: 0.15,
  trustProximity: 0.15,
  recencyOfActivity: 0.10,
};

export function getMatchingWeights(): MatchingWeights {
  try {
    if (waConfig.matchWeights && waConfig.matchWeights !== '{}') {
      const parsed = JSON.parse(waConfig.matchWeights);
      return {
        skillOverlap: typeof parsed.skillOverlap === 'number' ? parsed.skillOverlap : DEFAULT_MATCHING_WEIGHTS.skillOverlap,
        semanticSimilarity: typeof parsed.semanticSimilarity === 'number' ? parsed.semanticSimilarity : DEFAULT_MATCHING_WEIGHTS.semanticSimilarity,
        experienceFit: typeof parsed.experienceFit === 'number' ? parsed.experienceFit : DEFAULT_MATCHING_WEIGHTS.experienceFit,
        trustProximity: typeof parsed.trustProximity === 'number' ? parsed.trustProximity : DEFAULT_MATCHING_WEIGHTS.trustProximity,
        recencyOfActivity: typeof parsed.recencyOfActivity === 'number' ? parsed.recencyOfActivity : DEFAULT_MATCHING_WEIGHTS.recencyOfActivity,
      };
    }
  } catch (e) {
    console.warn('[MatchingWeights] Failed to parse MATCH_WEIGHTS env, falling back to default:', e);
  }

  return DEFAULT_MATCHING_WEIGHTS;
}
