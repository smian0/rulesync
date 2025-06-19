import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateClaudeConfig(
  rules: ParsedRule[],
  config: Config
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  // Separate overview and detail rules
  const overviewRules = rules.filter(r => r.frontmatter.ruleLevel === "overview");
  const detailRules = rules.filter(r => r.frontmatter.ruleLevel === "detail");

  // Generate CLAUDE.md with overview rule and references to detail files
  const claudeMdContent = generateClaudeMarkdown(overviewRules, detailRules);
  outputs.push({
    tool: "claude",
    filepath: join(config.outputPaths.claude, "CLAUDE.md"),
    content: claudeMdContent,
  });

  // Generate individual memory files for detail rules
  for (const rule of detailRules) {
    const memoryContent = generateMemoryFile(rule);
    outputs.push({
      tool: "claude",
      filepath: join(config.outputPaths.claude, ".claude", "memories", `${rule.filename}.md`),
      content: memoryContent,
    });
  }

  return outputs;
}

function generateClaudeMarkdown(overviewRules: ParsedRule[], detailRules: ParsedRule[]): string {
  const lines: string[] = [];

  // Add references to memory files at the top
  if (detailRules.length > 0) {
    for (const rule of detailRules) {
      lines.push(`@${rule.filename}`);
    }
    lines.push("");
  }

  lines.push("# Claude Code Memory - Project Instructions");
  lines.push("");
  lines.push(
    "Generated from rulesync configuration. These instructions guide Claude Code's behavior for this project."
  );
  lines.push("");

  // Add overview rules
  if (overviewRules.length > 0) {
    for (const rule of overviewRules) {
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

function generateMemoryFile(rule: ParsedRule): string {
  const lines: string[] = [];
  
  lines.push("Please also refer to the following files as needed:");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`# ${rule.filename}`);
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
  
  return lines.join("\n");
}