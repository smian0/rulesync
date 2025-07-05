import type { ToolTarget } from "./tool-targets.js";

export type Config = {
  aiRulesDir: string;
  outputPaths: Record<ToolTarget, string>;
  watchEnabled: boolean;
  defaultTargets: ToolTarget[];
};
