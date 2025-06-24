import { basename, join } from "node:path";
import matter from "gray-matter";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface CopilotImportResult {
  rules: ParsedRule[];
  errors: string[];
}

export async function parseCopilotConfiguration(
  baseDir: string = process.cwd()
): Promise<CopilotImportResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];

  // Check for .github/copilot-instructions.md file
  const copilotFilePath = join(baseDir, ".github", "copilot-instructions.md");
  if (await fileExists(copilotFilePath)) {
    try {
      const rawContent = await readFileContent(copilotFilePath);
      const parsed = matter(rawContent);
      const content = parsed.content.trim();

      if (content) {
        const frontmatter: RuleFrontmatter = {
          root: false,
          targets: ["copilot"],
          description: "GitHub Copilot instructions",
          globs: ["**/*"],
        };

        rules.push({
          frontmatter,
          content,
          filename: "copilot-instructions",
          filepath: copilotFilePath,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to parse copilot-instructions.md: ${errorMessage}`);
    }
  }

  // Check for .github/instructions/*.instructions.md files
  const instructionsDir = join(baseDir, ".github", "instructions");
  if (await fileExists(instructionsDir)) {
    try {
      const { readdir } = await import("node:fs/promises");
      const files = await readdir(instructionsDir);

      for (const file of files) {
        if (file.endsWith(".instructions.md")) {
          const filePath = join(instructionsDir, file);
          const rawContent = await readFileContent(filePath);
          const parsed = matter(rawContent);
          const content = parsed.content.trim();

          if (content) {
            const filename = basename(file, ".instructions.md");
            const frontmatter: RuleFrontmatter = {
              root: false,
              targets: ["copilot"],
              description: `Copilot instruction: ${filename}`,
              globs: ["**/*"],
            };

            rules.push({
              frontmatter,
              content,
              filename: `copilot-${filename}`,
              filepath: filePath,
            });
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to parse .github/instructions files: ${errorMessage}`);
    }
  }

  if (rules.length === 0) {
    errors.push(
      "No Copilot configuration files found (.github/copilot-instructions.md or .github/instructions/*.instructions.md)"
    );
  }

  return { rules, errors };
}
