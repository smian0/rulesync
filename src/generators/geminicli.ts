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
  const lines: string[] = [];
  
  // Add description as header if available
  if (rule.frontmatter.description) {
    lines.push(`# ${rule.frontmatter.description}`);
    lines.push("");
  }

  // Add content
  lines.push(rule.content);

  return lines.join("\n");
}

function generateGeminiRootMarkdown(
  rootRule: ParsedRule | undefined, 
  memoryRules: ParsedRule[], 
  _baseDir?: string
): string {
  const lines: string[] = [];

  // Add table of memory files at the beginning
  if (memoryRules.length > 0) {
    lines.push("# Gemini CLI Configuration");
    lines.push("");
    lines.push("## Memory Files");
    lines.push("");
    lines.push("| File | Description |");
    lines.push("|------|-------------|");
    
    for (const rule of memoryRules) {
      const relativePath = `.gemini/memories/${rule.filename}.md`;
      lines.push(`| ${relativePath} | ${rule.frontmatter.description} |`);
    }
    lines.push("");
  }

  // Add root rule content if available
  if (rootRule) {
    if (rootRule.frontmatter.description && memoryRules.length === 0) {
      lines.push(`# ${rootRule.frontmatter.description}`);
      lines.push("");
    } else if (rootRule.frontmatter.description && memoryRules.length > 0) {
      lines.push("## Root Configuration");
      lines.push("");
      lines.push(`### ${rootRule.frontmatter.description}`);
      lines.push("");
    }
    
    lines.push(rootRule.content);
  } else if (memoryRules.length === 0) {
    // Fallback if no rules are provided
    lines.push("# Gemini CLI Configuration");
    lines.push("");
    lines.push("No configuration rules have been defined yet.");
  }

  return lines.join("\n");
}