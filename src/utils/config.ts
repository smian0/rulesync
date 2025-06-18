import type { Config, ToolTarget } from "../types/index.js";

export function getDefaultConfig(): Config {
  return {
    aiRulesDir: ".rulesync",
    outputPaths: {
      copilot: ".github/instructions",
      cursor: ".cursor/rules",
      cline: ".clinerules",
      claude: ".",
    },
    watchEnabled: false,
    defaultTargets: ["copilot", "cursor", "cline", "claude"],
  };
}

export function resolveTargets(targets: ToolTarget[] | ["*"], config: Config): ToolTarget[] {
  if (targets.includes("*" as ToolTarget)) {
    return config.defaultTargets;
  }
  return targets as ToolTarget[];
}
