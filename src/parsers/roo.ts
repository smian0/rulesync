import { join } from "node:path";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface RooImportResult {
  rules: ParsedRule[];
  errors: string[];
}

export async function parseRooConfiguration(
  baseDir: string = process.cwd(),
): Promise<RooImportResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];

  // Check for .roo/instructions.md file
  const rooFilePath = join(baseDir, ".roo", "instructions.md");
  if (await fileExists(rooFilePath)) {
    try {
      const content = await readFileContent(rooFilePath);

      if (content.trim()) {
        const frontmatter: RuleFrontmatter = {
          root: false,
          targets: ["roo"],
          description: "Roo Code instructions",
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
      errors.push(`Failed to parse .roo/instructions.md: ${errorMessage}`);
    }
  }

  // Check for .roo/rules/*.md files
  const rooRulesDir = join(baseDir, ".roo", "rules");
  if (await fileExists(rooRulesDir)) {
    try {
      const { readdir } = await import("node:fs/promises");
      const files = await readdir(rooRulesDir);

      for (const file of files) {
        if (file.endsWith(".md")) {
          const filePath = join(rooRulesDir, file);
          try {
            const content = await readFileContent(filePath);

            if (content.trim()) {
              const filename = file.replace(".md", "");
              const frontmatter: RuleFrontmatter = {
                root: false,
                targets: ["roo"],
                description: `Roo rule: ${filename}`,
                globs: ["**/*"],
              };

              rules.push({
                frontmatter,
                content: content.trim(),
                filename: `roo-${filename}`,
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
      errors.push(`Failed to parse .roo/rules files: ${errorMessage}`);
    }
  }

  if (rules.length === 0) {
    errors.push("No Roo Code configuration files found (.roo/instructions.md or .roo/rules/*.md)");
  }

  return { rules, errors };
}
