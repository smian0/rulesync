import type { ParsedRule } from "../types/index.js";
import { parseConfigurationFiles } from "./shared-helpers.js";

export interface RooImportResult {
  rules: ParsedRule[];
  errors: string[];
}

export async function parseRooConfiguration(
  baseDir: string = process.cwd(),
): Promise<RooImportResult> {
  return parseConfigurationFiles(baseDir, {
    tool: "roo",
    mainFile: {
      path: ".roo/instructions.md",
      useFrontmatter: false,
      description: "Roo Code instructions",
    },
    directories: [
      {
        directory: ".roo/rules",
        filePattern: ".md",
        description: "Roo rule",
      },
    ],
    errorMessage: "No Roo Code configuration files found (.roo/instructions.md or .roo/rules/*.md)",
  });
}
