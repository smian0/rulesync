import type { Config, GeneratedOutput, ParsedRule } from "../../types/index.js";
import { generateRulesConfig } from "./shared-helpers.js";

export async function generateClineConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string,
): Promise<GeneratedOutput[]> {
  return generateRulesConfig(
    rules,
    config,
    {
      tool: "cline",
      fileExtension: ".md",
      ignoreFileName: ".clineignore",
      generateContent: (rule: ParsedRule) => rule.content.trim(),
    },
    baseDir,
  );
}
