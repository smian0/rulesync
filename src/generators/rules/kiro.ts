import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../../types/index.js";

export async function generateKiroConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string,
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];

  // Generate custom steering documents
  for (const rule of rules) {
    const content = generateKiroMarkdown(rule);
    const outputDir = baseDir ? join(baseDir, config.outputPaths.kiro) : config.outputPaths.kiro;
    const filepath = join(outputDir, `${rule.filename}.md`);

    outputs.push({
      tool: "kiro",
      filepath,
      content,
    });
  }

  return outputs;
}

function generateKiroMarkdown(rule: ParsedRule): string {
  return rule.content.trim();
}
