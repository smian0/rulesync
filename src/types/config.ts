import type { ToolTarget } from "./rules.js";

export type Config = {
  aiRulesDir: string;
  outputPaths: Record<ToolTarget, string>;
  watchEnabled: boolean;
  defaultTargets: ToolTarget[];
};
