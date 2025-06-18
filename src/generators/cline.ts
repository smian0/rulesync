import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateClineConfig(
  rules: ParsedRule[],
  config: Config
): Promise<GeneratedOutput> {
  const sortedRules = rules.sort((a, b) => {
    if (a.frontmatter.priority !== b.frontmatter.priority) {
      return a.frontmatter.priority === "high" ? -1 : 1;
    }
    return a.filename.localeCompare(b.filename);
  });

  const content = generateClineMarkdown(sortedRules);
  const filepath = join(config.outputPaths.cline, "01-rulesync.md");

  return {
    tool: "cline",
    filepath,
    content,
  };
}

function generateClineMarkdown(rules: ParsedRule[]): string {
  const lines: string[] = [];

  lines.push("# Cline AI Assistant Rules");
  lines.push("");
  lines.push("Configuration rules for Cline AI Assistant. Generated from rulesync configuration.");
  lines.push("");
  lines.push("These rules provide project-specific guidance for AI-assisted development.");
  lines.push("");

  // Group by priority for better organization
  const highPriorityRules = rules.filter((r) => r.frontmatter.priority === "high");
  const lowPriorityRules = rules.filter((r) => r.frontmatter.priority === "low");

  if (highPriorityRules.length > 0) {
    lines.push("## High Priority Guidelines");
    lines.push("");
    lines.push("These are critical rules that should always be followed:");
    lines.push("");
    for (const rule of highPriorityRules) {
      lines.push(...formatRuleForCline(rule));
    }
  }

  if (lowPriorityRules.length > 0) {
    lines.push("## Standard Guidelines");
    lines.push("");
    lines.push("These are recommended practices for this project:");
    lines.push("");
    for (const rule of lowPriorityRules) {
      lines.push(...formatRuleForCline(rule));
    }
  }

  return lines.join("\n");
}

function formatRuleForCline(rule: ParsedRule): string[] {
  const lines: string[] = [];

  lines.push(`### ${rule.filename}`);
  lines.push("");

  lines.push(`**Description:** ${rule.frontmatter.description}`);
  lines.push("");

  if (rule.frontmatter.globs.length > 0) {
    lines.push(`**Applies to files:** ${rule.frontmatter.globs.join(", ")}`);
    lines.push("");
  }

  // Add the actual rule content with clear formatting
  lines.push("**Guidelines:**");
  lines.push("");
  lines.push(rule.content);
  lines.push("");
  lines.push("---");
  lines.push("");

  return lines;
}
