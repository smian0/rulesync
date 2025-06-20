import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../types/index.js";

export async function generateClineConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  for (const rule of rules) {
    const content = generateClineMarkdown(rule);
    const outputDir = baseDir ? join(baseDir, config.outputPaths.cline) : config.outputPaths.cline;
    const filepath = join(outputDir, `${rule.filename}.md`);

    outputs.push({
      tool: "cline",
      filepath,
      content,
    });
  }

  return outputs;
}

function generateClineMarkdown(rule: ParsedRule): string {
  return rule.content.trim();
}
