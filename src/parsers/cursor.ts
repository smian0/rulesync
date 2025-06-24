import { basename, join } from "node:path";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface CursorImportResult {
  rules: ParsedRule[];
  errors: string[];
}

export async function parseCursorConfiguration(
  baseDir: string = process.cwd()
): Promise<CursorImportResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];

  // Check for .cursorrules file (legacy)
  const cursorFilePath = join(baseDir, ".cursorrules");
  if (await fileExists(cursorFilePath)) {
    try {
      const content = await readFileContent(cursorFilePath);

      if (content.trim()) {
        const frontmatter: RuleFrontmatter = {
          root: false,
          targets: ["cursor"],
          description: "Cursor IDE configuration rules",
          globs: ["**/*"],
        };

        rules.push({
          frontmatter,
          content: content.trim(),
          filename: "cursor-rules",
          filepath: cursorFilePath,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to parse .cursorrules file: ${errorMessage}`);
    }
  }

  // Check for .cursor/rules/*.md files
  const cursorRulesDir = join(baseDir, ".cursor", "rules");
  if (await fileExists(cursorRulesDir)) {
    try {
      const { readdir } = await import("node:fs/promises");
      const files = await readdir(cursorRulesDir);

      for (const file of files) {
        if (file.endsWith(".md")) {
          const filePath = join(cursorRulesDir, file);
          const content = await readFileContent(filePath);

          if (content.trim()) {
            const filename = basename(file, ".md");
            const frontmatter: RuleFrontmatter = {
              root: false,
              targets: ["cursor"],
              description: `Cursor rule: ${filename}`,
              globs: ["**/*"],
            };

            rules.push({
              frontmatter,
              content: content.trim(),
              filename: `cursor-${filename}`,
              filepath: filePath,
            });
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to parse .cursor/rules files: ${errorMessage}`);
    }
  }

  if (rules.length === 0) {
    errors.push("No Cursor configuration files found (.cursorrules or .cursor/rules/*.md)");
  }

  return { rules, errors };
}
