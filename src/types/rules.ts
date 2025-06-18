export type Priority = "high" | "medium" | "low";

export type ToolTarget = "copilot" | "cursor" | "cline" | "claude";

export type RuleFrontmatter = {
  priority: Priority;
  targets: ToolTarget[] | ["*"];
  description: string;
  globs: string[];
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
