// Configurable risk scoring weights for professional anti-fraud engine
// UPDATED: Removed automatic minimum score enforcement
// All weights produce pure weighted sums without floor values
// Support for granular 1% scoring (0-100)
// Weights unchanged per REQ-8 constraint — no session changes affect this module.

export interface RiskWeights {
  // Isolated word weights (1-40%)
  // "Amigo"/"Friend" should be 5 (1-9% range)
  // "Dinheiro"/"Money" should be 24 (21-28% range)
  isolatedWordMin: number;
  isolatedWordMax: number;

  // Specific keyword weights
  socialWordWeight: number; // For "Amigo", "Friend" (1-9%)
  financialWordWeight: number; // For "Dinheiro", "Money" (21-28%)

  // Critical expression weights (65-95%)
  criticalExpressionMin: number;
  criticalExpressionMax: number;

  // Contextual combination bonus (+5% to +25%)
  contextualBonusMin: number;
  contextualBonusMax: number;

  // Legacy weights (preserved for backward compatibility)
  highRiskKeywords: number;
  mediumRiskKeywords: number;
  internalReportBase: number;
  internalReportMax: number;
  externalPublicSource: number;
  highReportFrequency: number;
}

export interface RiskThresholds {
  highFrequencyReportCount: number;
  // REMOVED: criticalIndicatorMinimumScore - no automatic minimum enforcement
  // REMOVED: criticalIndicatorThreshold - no automatic minimum enforcement
}

// Professional default weights (0-100 scale with granular 1% precision)
export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  // Granular scoring ranges
  isolatedWordMin: 10,
  isolatedWordMax: 40,

  // Specific keyword weights for "Amigo"/"Friend" and "Dinheiro"/"Money"
  socialWordWeight: 5, // "Amigo", "Friend" → 5% (1-9% range)
  financialWordWeight: 24, // "Dinheiro", "Money" → 24% (21-28% range)

  criticalExpressionMin: 65,
  criticalExpressionMax: 95,
  contextualBonusMin: 5,
  contextualBonusMax: 25,

  // Legacy weights
  highRiskKeywords: 40,
  mediumRiskKeywords: 20,
  internalReportBase: 10,
  internalReportMax: 30,
  externalPublicSource: 25,
  highReportFrequency: 15,
};

// Configurable thresholds
export const DEFAULT_RISK_THRESHOLDS: RiskThresholds = {
  highFrequencyReportCount: 5, // 5+ reports = high frequency
  // REMOVED: criticalIndicatorMinimumScore
  // REMOVED: criticalIndicatorThreshold
};

// Export singleton config for easy import
export const riskConfig = {
  weights: DEFAULT_RISK_WEIGHTS,
  thresholds: DEFAULT_RISK_THRESHOLDS,
};
