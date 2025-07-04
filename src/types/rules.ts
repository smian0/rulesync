export type ToolTarget =
  | "copilot"
  | "cursor"
  | "cline"
  | "claudecode"
  | "claude"
  | "roo"
  | "geminicli";

export type RuleFrontmatter = {
  root: boolean;
  targets: ToolTarget[] | ["*"];
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
  targetTools?: ToolTarget[];
  outputDir?: string;
  watch?: boolean;
};
