import { join } from "node:path";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface CopilotImportResult {
  rules: ParsedRule[];
  errors: string[];
}

export async function parseCopilotConfiguration(baseDir: string = process.cwd()): Promise<CopilotImportResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];

  // Check for .github/copilot-instructions.md file
  const copilotFilePath = join(baseDir, ".github", "copilot-instructions.md");
  if (!(await fileExists(copilotFilePath))) {
    errors.push(".github/copilot-instructions.md file not found");
    return { rules, errors };
  }

  try {
    const content = await readFileContent(copilotFilePath);
    
    if (content.trim()) {
      const frontmatter: RuleFrontmatter = {
        root: true,
        targets: ["copilot"],
        description: "GitHub Copilot instructions",
        globs: ["**/*"]
      };

      rules.push({
        frontmatter,
        content: content.trim(),
        filename: "copilot-instructions",
        filepath: copilotFilePath
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Failed to parse Copilot configuration: ${errorMessage}`);
  }

  return { rules, errors };
}