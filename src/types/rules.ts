import { ToolTarget, ToolTargets } from "./tool-targets.js";

export type RuleFrontmatter = {
  root: boolean;
  targets: ToolTargets | ["*"];
  description: string;
  globs: string[];
  cursorRuleType?: "always" | "manual" | "specificFiles" | "intelligently";
};

export type ParsedRule = {
  frontmatter: RuleFrontmatter;
  content: string;
  filename: string;
  filepath: string;
};

export type GeneratedOutput = {
  tool: ToolTarget;
  filepath: string;
  content: string;
};

export type GenerateOptions = {
  targetTools?: ToolTargets;
  outputDir?: string;
  watch?: boolean;
};
