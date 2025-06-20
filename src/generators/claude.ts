import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateClaudeConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  // Separate root and non-root rules
  const rootRules = rules.filter((r) => r.frontmatter.root === true);
  const detailRules = rules.filter((r) => r.frontmatter.root === false);

  // Generate CLAUDE.md with root rule and references to detail files
  const claudeMdContent = generateClaudeMarkdown(rootRules, detailRules);
  const claudeOutputDir = baseDir ? join(baseDir, config.outputPaths.claude) : config.outputPaths.claude;
  outputs.push({
    tool: "claude",
    filepath: join(claudeOutputDir, "CLAUDE.md"),
    content: claudeMdContent,
  });

  // Generate individual memory files for detail rules
  for (const rule of detailRules) {
    const memoryContent = generateMemoryFile(rule);
    outputs.push({
      tool: "claude",
      filepath: join(claudeOutputDir, ".claude", "memories", `${rule.filename}.md`),
      content: memoryContent,
    });
  }

  return outputs;
}

function generateClaudeMarkdown(rootRules: ParsedRule[], detailRules: ParsedRule[]): string {
  const lines: string[] = [];

  // Add introductory text and references to memory files at the top
  if (detailRules.length > 0) {
    lines.push("Please also reference the following documents as needed:");
    lines.push("");
    for (const rule of detailRules) {
      lines.push(`@.claude/memories/${rule.filename}.md`);
    }
    lines.push("");
  }

  lines.push("# Claude Code Memory - Project Instructions");
  lines.push("");
  lines.push(
    "Generated from rulesync configuration. These instructions guide Claude Code's behavior for this project."
  );
  lines.push("");

  // Add root rules
  if (rootRules.length > 0) {
    for (const rule of rootRules) {
      lines.push(...formatRuleForClaude(rule));
    }
  }

  return lines.join("\n");
}

function formatRuleForClaude(rule: ParsedRule): string[] {
  const lines: string[] = [];

  lines.push(`### ${rule.frontmatter.description}`);
  lines.push("");

  lines.push(rule.content);
  lines.push("");

  return lines;
}

function generateMemoryFile(rule: ParsedRule): string {
  return rule.content.trim();
}
