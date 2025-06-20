import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateRooConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  for (const rule of rules) {
    const content = generateRooMarkdown(rule);
    const outputDir = baseDir ? join(baseDir, config.outputPaths.roo) : config.outputPaths.roo;
    const filepath = join(outputDir, `${rule.filename}.md`);

    outputs.push({
      tool: "roo",
      filepath,
      content,
    });
  }

  return outputs;
}

function generateRooMarkdown(rule: ParsedRule): string {
  return rule.content.trim();
}
