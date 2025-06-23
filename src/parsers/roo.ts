import { join } from "node:path";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface RooImportResult {
  rules: ParsedRule[];
  errors: string[];
}

export async function parseRooConfiguration(
  baseDir: string = process.cwd()
): Promise<RooImportResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];

  // Check for .roo/instructions.md file
  const rooFilePath = join(baseDir, ".roo", "instructions.md");
  if (!(await fileExists(rooFilePath))) {
    errors.push(".roo/instructions.md file not found");
    return { rules, errors };
  }

  try {
    const content = await readFileContent(rooFilePath);

    if (content.trim()) {
      const frontmatter: RuleFrontmatter = {
        root: false,
        targets: ["roo"],
        description: "Roo Code AI assistant instructions",
        globs: ["**/*"],
      };

      rules.push({
        frontmatter,
        content: content.trim(),
        filename: "roo-instructions",
        filepath: rooFilePath,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Failed to parse Roo configuration: ${errorMessage}`);
  }

  return { rules, errors };
}
