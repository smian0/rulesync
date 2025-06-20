import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateCopilotConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  // Generate individual instruction files for all rules
  for (const rule of rules) {
    const content = generateCopilotMarkdown(rule);
    const baseFilename = rule.filename.replace(/\.md$/, "");
    const outputDir = baseDir
      ? join(baseDir, config.outputPaths.copilot)
      : config.outputPaths.copilot;
    const filepath = join(outputDir, `${baseFilename}.instructions.md`);

    outputs.push({
      tool: "copilot",
      filepath,
      content,
    });
  }

  return outputs;
}

function generateCopilotMarkdown(rule: ParsedRule): string {
  const lines: string[] = [];

  // Add Front Matter for GitHub Copilot
  lines.push("---");
  lines.push(`description: "${rule.frontmatter.description}"`);
  if (rule.frontmatter.globs.length > 0) {
    lines.push(`applyTo: "${rule.frontmatter.globs.join(", ")}"`);
  } else {
    lines.push('applyTo: "**"');
  }
  lines.push("---");

  lines.push(rule.content);

  return lines.join("\n");
}
