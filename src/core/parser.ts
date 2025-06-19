import { basename } from "node:path";
import matter from "gray-matter";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import { findFiles, readFileContent } from "../utils/index.js";

export async function parseRulesFromDirectory(aiRulesDir: string): Promise<ParsedRule[]> {
  const ruleFiles = await findFiles(aiRulesDir);
  const rules: ParsedRule[] = [];

  for (const filepath of ruleFiles) {
    try {
      const rule = await parseRuleFile(filepath);
      rules.push(rule);
    } catch (error) {
      console.warn(`Failed to parse rule file ${filepath}:`, error);
    }
  }

  return rules;
}

export async function parseRuleFile(filepath: string): Promise<ParsedRule> {
  const content = await readFileContent(filepath);
  const parsed = matter(content);

  // Validate frontmatter
  validateFrontmatter(parsed.data, filepath);

  const frontmatter = parsed.data as RuleFrontmatter;
  const filename = basename(filepath, ".md");

  return {
    frontmatter,
    content: parsed.content,
    filename,
    filepath,
  };
}

function validateFrontmatter(data: unknown, filepath: string): void {
  if (!data || typeof data !== "object") {
    throw new Error(`Invalid frontmatter in ${filepath}: must be an object`);
  }

  const obj = data as Record<string, unknown>;

  // Validate root
  if (typeof obj.root !== "boolean") {
    throw new Error(`Invalid root in ${filepath}: must be a boolean`);
  }

  // Validate targets
  if (!Array.isArray(obj.targets)) {
    throw new Error(`Invalid targets in ${filepath}: must be an array`);
  }

  const validTargets = ["copilot", "cursor", "cline", "*"];
  for (const target of obj.targets) {
    if (typeof target !== "string" || !validTargets.includes(target)) {
      throw new Error(
        `Invalid target "${target}" in ${filepath}: must be one of ${validTargets.join(", ")}`
      );
    }
  }

  // Validate description
  if (!obj.description || typeof obj.description !== "string") {
    throw new Error(`Invalid description in ${filepath}: must be a non-empty string`);
  }

  // Validate globs
  if (!Array.isArray(obj.globs)) {
    throw new Error(`Invalid globs in ${filepath}: must be an array`);
  }

  for (const glob of obj.globs) {
    if (typeof glob !== "string") {
      throw new Error(`Invalid glob in ${filepath}: all globs must be strings`);
    }
  }
}
