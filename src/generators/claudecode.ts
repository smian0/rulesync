import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateClaudecodeConfig(
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
  const claudeOutputDir = baseDir
    ? join(baseDir, config.outputPaths.claudecode)
    : config.outputPaths.claudecode;
  outputs.push({
    tool: "claudecode",
    filepath: join(claudeOutputDir, "CLAUDE.md"),
    content: claudeMdContent,
  });

  // Generate individual memory files for detail rules
  for (const rule of detailRules) {
    const memoryContent = generateMemoryFile(rule);
    outputs.push({
      tool: "claudecode",
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
    lines.push("| Document | Description | File Patterns |");
    lines.push("|----------|-------------|---------------|");
    for (const rule of detailRules) {
      const globsText = rule.frontmatter.globs.length > 0 ? rule.frontmatter.globs.join(", ") : "-";
      lines.push(
        `| @.claude/memories/${rule.filename}.md | ${rule.frontmatter.description} | ${globsText} |`
      );
    }
    lines.push("");
  }

  // Add root rules
  if (rootRules.length > 0) {
    for (const rule of rootRules) {
      lines.push(rule.content);
      lines.push("");
    }
  }

  return lines.join("\n");
}

function generateMemoryFile(rule: ParsedRule): string {
  return rule.content.trim();
}
