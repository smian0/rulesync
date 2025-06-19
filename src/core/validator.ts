import type { ParsedRule } from "../types/index.js";
import { fileExists } from "../utils/index.js";

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

export async function validateRules(rules: ParsedRule[]): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for duplicate filenames
  const filenames = new Set<string>();
  for (const rule of rules) {
    if (filenames.has(rule.filename)) {
      errors.push(`Duplicate rule filename: ${rule.filename}`);
    }
    filenames.add(rule.filename);
  }

  // Check for multiple root rules
  const rootRules = rules.filter((rule) => rule.frontmatter.root === true);
  if (rootRules.length > 1) {
    errors.push(
      `Multiple root rules found: ${rootRules.map((r) => r.filename).join(", ")}. Only one root rule is allowed.`
    );
  }

  // Validate individual rules
  for (const rule of rules) {
    const ruleValidation = await validateRule(rule);
    errors.push(...ruleValidation.errors);
    warnings.push(...ruleValidation.warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

async function validateRule(rule: ParsedRule): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if content is not empty
  if (!rule.content.trim()) {
    warnings.push(`Rule ${rule.filename} has empty content`);
  }

  // Check if description is meaningful
  if (rule.frontmatter.description.length < 10) {
    warnings.push(`Rule ${rule.filename} has a very short description`);
  }

  // Check if globs are reasonable
  if (rule.frontmatter.globs.length === 0) {
    warnings.push(`Rule ${rule.filename} has no glob patterns specified`);
  }

  // Check file exists
  if (!(await fileExists(rule.filepath))) {
    errors.push(`Rule file ${rule.filepath} does not exist`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
