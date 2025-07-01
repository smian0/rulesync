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
  if (await fileExists(clineFilePath)) {
    try {
      const content = await readFileContent(clineFilePath);

      if (content.trim()) {
        const frontmatter: RuleFrontmatter = {
          root: false,
          targets: ["cline"],
          description: "Cline instructions",
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
      errors.push(`Failed to parse .cline/instructions.md: ${errorMessage}`);
    }
  }

  // Check for .clinerules/*.md files
  const clinerulesDirPath = join(baseDir, ".clinerules");
  if (await fileExists(clinerulesDirPath)) {
    try {
      const { readdir } = await import("node:fs/promises");
      const files = await readdir(clinerulesDirPath);

      for (const file of files) {
        if (file.endsWith(".md")) {
          const filePath = join(clinerulesDirPath, file);
          try {
            const content = await readFileContent(filePath);

            if (content.trim()) {
              const filename = file.replace(".md", "");
              const frontmatter: RuleFrontmatter = {
                root: false,
                targets: ["cline"],
                description: `Cline rule: ${filename}`,
                globs: ["**/*"],
              };

              rules.push({
                frontmatter,
                content: content.trim(),
                filename: `cline-${filename}`,
                filepath: filePath,
              });
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.push(`Failed to parse ${filePath}: ${errorMessage}`);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to parse .clinerules files: ${errorMessage}`);
    }
  }

  if (rules.length === 0) {
    errors.push("No Cline configuration files found (.cline/instructions.md or .clinerules/*.md)");
  }

  return { rules, errors };
}
