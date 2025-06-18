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
  const filepath = join(config.outputPaths.cline, "rules.md");

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
  lines.push("Configuration rules for Cline AI Assistant.");
  lines.push("");

  // Cline prefers a more structured format
  lines.push("## Rules");
  lines.push("");

  for (const rule of rules) {
    lines.push(...formatRuleForCline(rule));
  }

  return lines.join("\n");
}

function formatRuleForCline(rule: ParsedRule): string[] {
  const lines: string[] = [];

  lines.push(`### ${rule.filename}`);
  lines.push("");

  // Add metadata
  lines.push("```yaml");
  lines.push(`priority: ${rule.frontmatter.priority}`);
  lines.push(`description: "${rule.frontmatter.description}"`);
  if (rule.frontmatter.globs.length > 0) {
    lines.push("applies_to:");
    for (const glob of rule.frontmatter.globs) {
      lines.push(`  - "${glob}"`);
    }
  }
  lines.push("```");
  lines.push("");

  lines.push(rule.content);
  lines.push("");

  return lines;
}
