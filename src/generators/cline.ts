import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateClineConfig(
  rules: ParsedRule[],
  config: Config
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  for (const rule of rules) {
    const content = generateClineMarkdown(rule);
    const filepath = join(config.outputPaths.cline, `${rule.filename}`);

    outputs.push({
      tool: "cline",
      filepath,
      content,
    });
  }

  return outputs;
}

function generateClineMarkdown(rule: ParsedRule): string {
  const lines: string[] = [];

  lines.push(`# ${rule.frontmatter.description}`);
  lines.push("");

  if (rule.frontmatter.globs.length > 0) {
    lines.push(`**Applies to files:** ${rule.frontmatter.globs.join(", ")}`);
    lines.push("");
  }

  lines.push(rule.content);

  return lines.join("\n");
}

function formatRuleForCline(rule: ParsedRule): string[] {
  const lines: string[] = [];

  lines.push(`### ${rule.filename}`);
  lines.push("");

  lines.push(`**Description:** ${rule.frontmatter.description}`);
  lines.push("");

  if (rule.frontmatter.globs.length > 0) {
    lines.push(`**Applies to files:** ${rule.frontmatter.globs.join(", ")}`);
    lines.push("");
  }

  // Add the actual rule content with clear formatting
  lines.push("**Guidelines:**");
  lines.push("");
  lines.push(rule.content);
  lines.push("");
  lines.push("---");
  lines.push("");

  return lines;
}
