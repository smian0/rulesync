import { join } from "node:path";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface ClineImportResult {
  rules: ParsedRule[];
  errors: string[];
}

export async function parseClineConfiguration(
  baseDir: string = process.cwd()
): Promise<ClineImportResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];

  // Check for .cline/instructions.md file
  const clineFilePath = join(baseDir, ".cline", "instructions.md");
  if (!(await fileExists(clineFilePath))) {
    errors.push(".cline/instructions.md file not found");
    return { rules, errors };
  }

  try {
    const content = await readFileContent(clineFilePath);

    if (content.trim()) {
      const frontmatter: RuleFrontmatter = {
        root: false,
        targets: ["cline"],
        description: "Cline AI assistant instructions",
        globs: ["**/*"],
      };

      rules.push({
        frontmatter,
        content: content.trim(),
        filename: "cline-instructions",
        filepath: clineFilePath,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Failed to parse Cline configuration: ${errorMessage}`);
  }

  return { rules, errors };
}
