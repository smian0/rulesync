import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateRooConfig(
  rules: ParsedRule[],
  config: Config
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  for (const rule of rules) {
    const content = generateRooMarkdown(rule);
    const filepath = join(config.outputPaths.roo, `${rule.filename}.md`);

    outputs.push({
      tool: "roo",
      filepath,
      content,
    });
  }

  return outputs;
}

function generateRooMarkdown(rule: ParsedRule): string {
  const lines: string[] = [];

  // Add description as header comment for Roo
  lines.push(`# ${rule.frontmatter.description}`);
  lines.push("");

  // Add content
  lines.push(rule.content);

  return lines.join("\n");
}