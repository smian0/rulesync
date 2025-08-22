import type { FeatureType } from "../types/config-options.js";
import { FEATURE_TYPES } from "../types/config-options.js";

/**
 * Type guard to check if a string is a valid FeatureType
 */
function isFeatureType(value: string): value is FeatureType {
  return FEATURE_TYPES.some((type) => type === value);
}

/**
 * Validates and normalizes features specification
 */
export function validateFeatures(features: string[] | "*" | undefined): FeatureType[] | "*" {
  if (features === undefined) {
    return "*";
  }

  if (features === "*") {
    return "*";
  }

  if (!Array.isArray(features)) {
    throw new Error('Features must be an array of feature names or "*"');
  }

  if (features.length === 0) {
    throw new Error('Features array cannot be empty. Use "*" to include all features');
  }

  const validFeatures: FeatureType[] = [];
  const invalidFeatures: string[] = [];

  for (const feature of features) {
    if (isFeatureType(feature)) {
      validFeatures.push(feature);
    } else {
      invalidFeatures.push(feature);
    }
  }

  if (invalidFeatures.length > 0) {
    throw new Error(
      `Invalid feature types: ${invalidFeatures.join(", ")}. ` +
        `Valid features are: ${FEATURE_TYPES.join(", ")}`,
    );
  }

  // Remove duplicates while preserving order
  return [...new Set(validFeatures)];
}

/**
 * Expands wildcard "*" to all available feature types
 */
export function expandWildcard(): FeatureType[] {
  return [...FEATURE_TYPES];
}

/**
 * Normalizes features specification to always return an array
 */
export function normalizeFeatures(features: FeatureType[] | "*" | undefined): FeatureType[] {
  if (features === "*" || features === undefined) {
    return expandWildcard();
  }
  return features;
}

/**
 * Checks if features specification includes all features (equivalent to wildcard)
 */
export function isWildcard(features: FeatureType[] | "*" | undefined): boolean {
  if (features === "*" || features === undefined) {
    return true;
  }

  if (!Array.isArray(features)) {
    return false;
  }

  return (
    features.length === FEATURE_TYPES.length &&
    FEATURE_TYPES.every((feature) => features.includes(feature))
  );
}
