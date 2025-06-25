export type ToolTarget = "copilot" | "cursor" | "cline" | "claudecode" | "roo" | "geminicli";

export type RuleFrontmatter = {
  root: boolean;
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
