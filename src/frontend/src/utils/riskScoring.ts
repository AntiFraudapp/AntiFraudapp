// Pure deterministic risk scoring utility
// clampRiskScore enforces 0-99 cap (NEVER 100)
// Provides getRiskLevel and getRiskStatus helpers
// 99-cap preserved per REQ-8 constraint — no session changes affect this module.

export interface RiskFactors {
  hasHighRiskKeywords: boolean;
  hasMediumRiskKeywords: boolean;
  internalReportCount: number;
  hasExternalPublicSource: boolean;
  isHighReportFrequency: boolean;
  isolatedWordCount?: number;
  criticalExpressionCount?: number;
  contextualCombinationCount?: number;
  socialWordCount?: number;
  financialWordCount?: number;
}

export function clampRiskScore(score: number): number {
  return Math.min(Math.max(Math.round(score), 0), 99);
}

export function computeRiskScore(factors: RiskFactors): number {
  let score = 0;

  // Social words: low weight (5% each)
  if (factors.socialWordCount && factors.socialWordCount > 0) {
    score += factors.socialWordCount * 5;
  }

  // Financial words: medium weight (24% each)
  if (factors.financialWordCount && factors.financialWordCount > 0) {
    score += factors.financialWordCount * 24;
  }

  // Isolated high-risk words
  if (factors.isolatedWordCount && factors.isolatedWordCount > 0) {
    score += Math.min(10 + factors.isolatedWordCount * 5, 40);
  }

  // Critical expressions set a floor
  if (factors.criticalExpressionCount && factors.criticalExpressionCount > 0) {
    const expressionScore = Math.min(
      65 + factors.criticalExpressionCount * 10,
      95,
    );
    score = Math.max(score, expressionScore);
  }

  // Contextual combinations bonus
  if (
    factors.contextualCombinationCount &&
    factors.contextualCombinationCount > 0
  ) {
    score += Math.min(5 + factors.contextualCombinationCount * 5, 25);
  }

  // High-risk keywords
  if (factors.hasHighRiskKeywords) {
    score = Math.max(score, 40);
  }

  // Medium-risk keywords
  if (factors.hasMediumRiskKeywords) {
    score += 15;
  }

  // Internal reports
  const reportContribution = Math.min(factors.internalReportCount * 5, 30);
  score += reportContribution;

  // External public source
  if (factors.hasExternalPublicSource) {
    score += 20;
  }

  // High report frequency
  if (factors.isHighReportFrequency) {
    score += 15;
  }

  // Clamp to 0-99 (NEVER 100)
  return clampRiskScore(score);
}

export function scoreToRiskLevel(score: number): "Low" | "Medium" | "High" {
  if (score >= 60) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

export function getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" {
  if (score <= 30) return "LOW";
  if (score <= 69) return "MEDIUM";
  return "HIGH";
}

export function getRiskStatus(score: number): "GREEN" | "YELLOW" | "RED" {
  if (score <= 30) return "GREEN";
  if (score <= 69) return "YELLOW";
  return "RED";
}
