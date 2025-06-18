import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateCopilotConfig(
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

  const content = generateCopilotMarkdown(sortedRules);
  const filepath = join(config.outputPaths.copilot, "ai-rules.instructions.md");

  return {
    tool: "copilot",
    filepath,
    content,
  };
}

function generateCopilotMarkdown(rules: ParsedRule[]): string {
  const lines: string[] = [];

  // Add Front Matter for GitHub Copilot
  lines.push("---");
  lines.push('description: "AI rules configuration for GitHub Copilot"');
  lines.push('applyTo: "**"');
  lines.push("---");
  lines.push("");

  lines.push("# GitHub Copilot Instructions");
  lines.push("");
  lines.push(
    "Generated from ai-rules configuration. These instructions guide GitHub Copilot's code suggestions."
  );
  lines.push("");

  // Group by priority
  const highPriorityRules = rules.filter((r) => r.frontmatter.priority === "high");
  const lowPriorityRules = rules.filter((r) => r.frontmatter.priority === "low");

  if (highPriorityRules.length > 0) {
    lines.push("## High Priority Rules");
    lines.push("");
    for (const rule of highPriorityRules) {
      lines.push(...formatRuleForCopilot(rule));
    }
  }

  if (lowPriorityRules.length > 0) {
    lines.push("## Standard Rules");
    lines.push("");
    for (const rule of lowPriorityRules) {
      lines.push(...formatRuleForCopilot(rule));
    }
  }

  return lines.join("\n");
}

function formatRuleForCopilot(rule: ParsedRule): string[] {
  const lines: string[] = [];

  lines.push(`### ${rule.filename}`);
  lines.push("");
  lines.push(`**Description:** ${rule.frontmatter.description}`);
  lines.push("");

  if (rule.frontmatter.globs.length > 0) {
    lines.push(`**Applies to:** ${rule.frontmatter.globs.join(", ")}`);
    lines.push("");
  }

  lines.push(rule.content);
  lines.push("");

  return lines;
}
