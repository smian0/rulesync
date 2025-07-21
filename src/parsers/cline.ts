import type { ParsedRule } from "../types/index.js";
import { parseConfigurationFiles } from "./shared-helpers.js";

export interface ClineImportResult {
  rules: ParsedRule[];
  errors: string[];
}

export async function parseClineConfiguration(
  baseDir: string = process.cwd(),
): Promise<ClineImportResult> {
  return parseConfigurationFiles(baseDir, {
    tool: "cline",
    mainFile: {
      path: ".cline/instructions.md",
      useFrontmatter: false,
      description: "Cline instructions",
    },
    directories: [
      {
        directory: ".clinerules",
        filePattern: ".md",
        description: "Cline rule",
      },
    ],
    errorMessage: "No Cline configuration files found (.cline/instructions.md or .clinerules/*.md)",
  });
}
