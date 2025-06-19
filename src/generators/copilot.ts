import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateCopilotConfig(
  rules: ParsedRule[],
  config: Config
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  // Separate root and non-root rules
  const rootRules = rules.filter((r) => r.frontmatter.root === true);
  const detailRules = rules.filter((r) => r.frontmatter.root === false);

  // Generate copilot-instructions.md for root rules
  if (rootRules.length > 0) {
    const content = generateRootCopilotMarkdown(rootRules);
    const filepath = join(".github", "copilot-instructions.md");

    outputs.push({
      tool: "copilot",
      filepath,
      content,
    });
  }

  // Generate individual instruction files for detail rules
  for (const rule of detailRules) {
    const content = generateCopilotMarkdown(rule);
    const baseFilename = rule.filename.replace(/\.md$/, "");
    const filepath = join(config.outputPaths.copilot, `${baseFilename}.instructions.md`);

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

function generateRootCopilotMarkdown(rootRules: ParsedRule[]): string {
  const lines: string[] = [];

  // Combine all root rules into a single copilot-instructions.md
  for (const rule of rootRules) {
    lines.push(rule.content);
    if (rootRules.indexOf(rule) < rootRules.length - 1) {
      lines.push("");
    }
  }

  return lines.join("\n");
}
