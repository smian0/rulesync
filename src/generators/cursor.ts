import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateCursorConfig(
  rules: ParsedRule[],
  config: Config
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  for (const rule of rules) {
    const content = generateCursorMarkdown(rule);
    const filepath = join(config.outputPaths.cursor, `${rule.filename}`);

    outputs.push({
      tool: "cursor",
      filepath,
      content,
    });
  }

  return outputs;
}

function generateCursorMarkdown(rule: ParsedRule): string {
  const lines: string[] = [];

  // Add MDC header for Cursor
  lines.push("---");
  lines.push(`description: ${rule.frontmatter.description}`);
  if (rule.frontmatter.globs.length > 0) {
    lines.push(`globs: [${rule.frontmatter.globs.map((g) => `"${g}"`).join(", ")}]`);
  }
  
  // Determine ruletype based on ruleLevel and globs
  let ruletype: string;
  if (rule.frontmatter.ruleLevel === "overview") {
    ruletype = "always";
  } else if (rule.frontmatter.ruleLevel === "detail" && rule.frontmatter.globs.length === 0) {
    ruletype = "agentrequested";
  } else {
    ruletype = "autoattached";
  }
  
  lines.push(`ruletype: ${ruletype}`);
  lines.push("---");
  lines.push("");

  lines.push(rule.content);

  return lines.join("\n");
}

