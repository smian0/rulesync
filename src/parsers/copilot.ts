import type { ParsedRule } from "../types/index.js";
import { parseConfigurationFiles } from "./shared-helpers.js";

export interface CopilotImportResult {
  rules: ParsedRule[];
  errors: string[];
}

export async function parseCopilotConfiguration(
  baseDir: string = process.cwd(),
): Promise<CopilotImportResult> {
  return parseConfigurationFiles(baseDir, {
    tool: "copilot",
    mainFile: {
      path: ".github/copilot-instructions.md",
      useFrontmatter: true,
      description: "GitHub Copilot instructions",
    },
    directories: [
      {
        directory: ".github/instructions",
        filePattern: ".instructions.md",
        description: "Copilot instruction",
      },
    ],
    errorMessage:
      "No Copilot configuration files found (.github/copilot-instructions.md or .github/instructions/*.instructions.md)",
  });
}
