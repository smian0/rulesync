import type { Config, ToolTarget } from "../types/index.js";

export function getDefaultConfig(): Config {
  return {
    aiRulesDir: ".ai-rules",
    outputPaths: {
      copilot: ".github/instructions",
      cursor: ".cursor/rules",
      cline: ".clinerules",
    },
    watchEnabled: false,
    defaultTargets: ["copilot", "cursor", "cline"],
  };
}

export function resolveTargets(targets: ToolTarget[] | ["*"], config: Config): ToolTarget[] {
  if (targets.includes("*" as ToolTarget)) {
    return config.defaultTargets;
  }
  return targets as ToolTarget[];
}