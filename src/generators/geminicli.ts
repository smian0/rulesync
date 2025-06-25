import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateGeminiConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  // Find root and non-root rules
  const rootRule = rules.find((rule) => rule.frontmatter.root === true);
  const memoryRules = rules.filter((rule) => rule.frontmatter.root === false);

  // Generate memory files first (root=false files)
  for (const rule of memoryRules) {
    const content = generateGeminiMemoryMarkdown(rule);
    const outputDir = baseDir
      ? join(baseDir, config.outputPaths.geminicli)
      : config.outputPaths.geminicli;
    const filepath = join(outputDir, `${rule.filename}.md`);

    outputs.push({
      tool: "geminicli",
      filepath,
      content,
    });
  }

  // Generate root GEMINI.md file
  const rootContent = generateGeminiRootMarkdown(rootRule, memoryRules, baseDir);
  const rootFilepath = baseDir ? join(baseDir, "GEMINI.md") : "GEMINI.md";

  outputs.push({
    tool: "geminicli",
    filepath: rootFilepath,
    content: rootContent,
  });

  return outputs;
}

function generateGeminiMemoryMarkdown(rule: ParsedRule): string {
  // Just return the content without description header and trim leading whitespace
  return rule.content.trim();
}

function generateGeminiRootMarkdown(
  rootRule: ParsedRule | undefined,
  memoryRules: ParsedRule[],
  _baseDir?: string
): string {
  const lines: string[] = [];

  // Start with CLAUDE.md style introduction if memory files exist
  if (memoryRules.length > 0) {
    lines.push("Please also reference the following documents as needed:");
    lines.push("");
    lines.push("| Document | Description | File Patterns |");
    lines.push("|----------|-------------|---------------|");

    for (const rule of memoryRules) {
      const relativePath = `@.gemini/memories/${rule.filename}.md`;
      const filePatterns =
        rule.frontmatter.globs.length > 0 ? rule.frontmatter.globs.join(", ") : "-";
      lines.push(`| ${relativePath} | ${rule.frontmatter.description} | ${filePatterns} |`);
    }
    lines.push("");
    lines.push("");
  }

  // Add root rule content if available
  if (rootRule) {
    lines.push(rootRule.content.trim());
  } else if (memoryRules.length === 0) {
    // Fallback if no rules are provided
    lines.push("# Gemini CLI Configuration");
    lines.push("");
    lines.push("No configuration rules have been defined yet.");
  }

  return lines.join("\n");
}
