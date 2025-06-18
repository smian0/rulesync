import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateClaudeConfig(
  rules: ParsedRule[],
  config: Config
): Promise<GeneratedOutput> {
  const sortedRules = rules.sort((a, b) => {
    // Sort by priority (high first), then by filename
    if (a.frontmatter.priority !== b.frontmatter.priority) {
      return a.frontmatter.priority === "high" ? -1 : 1;
    }
    return a.filename.localeCompare(b.filename);
  });

  const content = generateClaudeMarkdown(sortedRules);
  const filepath = join(config.outputPaths.claude, "CLAUDE.md");

  return {
    tool: "claude",
    filepath,
    content,
  };
}

function generateClaudeMarkdown(rules: ParsedRule[]): string {
  const lines: string[] = [];

  lines.push("# Claude Code Memory - Project Instructions");
  lines.push("");
  lines.push(
    "Generated from rulesync configuration. These instructions guide Claude Code's behavior for this project."
  );
  lines.push("");

  // Group by priority
  const highPriorityRules = rules.filter((r) => r.frontmatter.priority === "high");
  const mediumPriorityRules = rules.filter((r) => r.frontmatter.priority === "medium");
  const lowPriorityRules = rules.filter((r) => r.frontmatter.priority === "low");

  if (highPriorityRules.length > 0) {
    lines.push("## Critical Rules");
    lines.push("These are the most important guidelines to follow:");
    lines.push("");
    for (const rule of highPriorityRules) {
      lines.push(...formatRuleForClaude(rule));
    }
  }

  if (mediumPriorityRules.length > 0) {
    lines.push("## Important Guidelines");
    lines.push("Follow these guidelines when applicable:");
    lines.push("");
    for (const rule of mediumPriorityRules) {
      lines.push(...formatRuleForClaude(rule));
    }
  }

  if (lowPriorityRules.length > 0) {
    lines.push("## Additional Considerations");
    lines.push("Keep these points in mind when working on this project:");
    lines.push("");
    for (const rule of lowPriorityRules) {
      lines.push(...formatRuleForClaude(rule));
    }
  }

  return lines.join("\n");
}

function formatRuleForClaude(rule: ParsedRule): string[] {
  const lines: string[] = [];

  lines.push(`### ${rule.filename}`);
  lines.push("");
  
  if (rule.frontmatter.description) {
    lines.push(`**Description:** ${rule.frontmatter.description}`);
    lines.push("");
  }

  if (rule.frontmatter.globs && rule.frontmatter.globs.length > 0) {
    lines.push(`**File patterns:** ${rule.frontmatter.globs.join(", ")}`);
    lines.push("");
  }

  lines.push(rule.content);
  lines.push("");

  return lines;
}