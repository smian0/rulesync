import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateCursorConfig(
  rules: ParsedRule[],
  config: Config
): Promise<GeneratedOutput> {
  // Cursor can handle multiple rule files, so we'll create a consolidated rules file
  const sortedRules = rules.sort((a, b) => {
    if (a.frontmatter.priority !== b.frontmatter.priority) {
      return a.frontmatter.priority === "high" ? -1 : 1;
    }
    return a.filename.localeCompare(b.filename);
  });

  const content = generateCursorMarkdown(sortedRules);
  const filepath = join(config.outputPaths.cursor, "ai-rules.md");

  return {
    tool: "cursor",
    filepath,
    content,
  };
}

function generateCursorMarkdown(rules: ParsedRule[]): string {
  const lines: string[] = [];

  // Add MDC header for Cursor
  lines.push("---");
  lines.push("description: AI rules configuration for Cursor IDE");
  lines.push("alwaysApply: true");
  lines.push("---");
  lines.push("");

  lines.push("# Cursor IDE Rules");
  lines.push("");
  lines.push("These rules configure Cursor IDE's AI assistant behavior.");
  lines.push("");

  for (const rule of rules) {
    lines.push(...formatRuleForCursor(rule));
  }

  return lines.join("\n");
}

function formatRuleForCursor(rule: ParsedRule): string[] {
  const lines: string[] = [];

  // Generate a separate rule file for each rule (MDC format)
  const priorityBadge = rule.frontmatter.priority === "high" ? "🔴 HIGH" : "🟡 STANDARD";

  // Add rule-specific MDC header
  lines.push("---");
  lines.push(`description: ${rule.frontmatter.description}`);
  if (rule.frontmatter.globs.length > 0) {
    lines.push(`globs: [${rule.frontmatter.globs.map((g) => `"${g}"`).join(", ")}]`);
  }
  lines.push(`alwaysApply: ${rule.frontmatter.priority === "high"}`);
  lines.push("---");
  lines.push("");

  lines.push(`## ${rule.filename} ${priorityBadge}`);
  lines.push("");

  lines.push(`**Priority:** ${rule.frontmatter.priority.toUpperCase()}`);
  lines.push("");

  if (rule.frontmatter.globs.length > 0) {
    lines.push("**File Patterns:**");
    for (const glob of rule.frontmatter.globs) {
      lines.push(`- \`${glob}\``);
    }
    lines.push("");
  }

  lines.push("**Rule:**");
  lines.push(rule.content);
  lines.push("");
  lines.push("---");
  lines.push("");

  return lines;
}
