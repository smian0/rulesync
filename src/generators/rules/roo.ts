import type { Config, GeneratedOutput, ParsedRule } from "../../types/index.js";
import { generateRulesConfig } from "./shared-helpers.js";

export async function generateRooConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string,
): Promise<GeneratedOutput[]> {
  return generateRulesConfig(
    rules,
    config,
    {
      tool: "roo",
      fileExtension: ".md",
      ignoreFileName: ".rooignore",
      generateContent: (rule: ParsedRule) => rule.content.trim(),
    },
    baseDir,
  );
}
