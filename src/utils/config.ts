import type { Config, ToolTarget } from "../types/index.js";

export function getDefaultConfig(): Config {
  return {
    aiRulesDir: ".rulesync",
    outputPaths: {
      copilot: ".github/instructions",
      cursor: ".cursor/rules",
      cline: ".clinerules",
      claude: ".",
      roo: ".roo/rules",
    },
    watchEnabled: false,
    defaultTargets: ["copilot", "cursor", "cline", "claude", "roo"],
  };
}

export function resolveTargets(targets: ToolTarget[] | ["*"], config: Config): ToolTarget[] {
  if (targets[0] === "*") {
    return config.defaultTargets;
  }
  return targets as ToolTarget[];
}
