// Feature flag configuration for PRO features
// Single source of truth for toggling PRO-only behaviors

export interface FeatureFlags {
  proEnabled: boolean;
  externalProvidersEnabled: boolean;
  advancedScoringEnabled: boolean;
}

// Default feature flags
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  proEnabled: false, // PRO features disabled by default
  externalProvidersEnabled: false, // External API providers disabled by default
  advancedScoringEnabled: true, // Advanced scoring always enabled
};

// Export singleton config
export const featureFlags = DEFAULT_FEATURE_FLAGS;

/**
 * Check if PRO features are enabled
 */
export function isProEnabled(): boolean {
  return featureFlags.proEnabled;
}

/**
 * Check if external providers are enabled
 */
export function areExternalProvidersEnabled(): boolean {
  return featureFlags.externalProvidersEnabled;
}
