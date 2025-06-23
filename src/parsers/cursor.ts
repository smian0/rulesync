import { join } from "node:path";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface CursorImportResult {
  rules: ParsedRule[];
  errors: string[];
}

export async function parseCursorConfiguration(baseDir: string = process.cwd()): Promise<CursorImportResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];

  // Check for .cursorrules file
  const cursorFilePath = join(baseDir, ".cursorrules");
  if (!(await fileExists(cursorFilePath))) {
    errors.push(".cursorrules file not found");
    return { rules, errors };
  }

  try {
    const content = await readFileContent(cursorFilePath);
    
    if (content.trim()) {
      const frontmatter: RuleFrontmatter = {
        root: false,
        targets: ["cursor"],
        description: "Cursor IDE configuration rules",
        globs: ["**/*"]
      };

      rules.push({
        frontmatter,
        content: content.trim(),
        filename: "cursor-rules",
        filepath: cursorFilePath
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Failed to parse Cursor configuration: ${errorMessage}`);
  }

  return { rules, errors };
}