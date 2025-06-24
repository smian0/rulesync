import { basename, join } from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface CursorImportResult {
  rules: ParsedRule[];
  errors: string[];
}

// Custom gray-matter options for more lenient YAML parsing
// This is needed to handle Cursor's .mdc file format where "globs: *" (without quotes) is valid
// but causes YAML parsing errors since * is a reserved character in YAML.
// We preprocess the frontmatter to add quotes around bare asterisks in globs fields.
const customMatterOptions = {
  engines: {
    yaml: {
      parse: (str: string): object => {
        try {
          // Preprocess to handle "globs: *" (Cursor's valid format) by adding quotes
          // This converts "globs: *" to "globs: \"*\"" for proper YAML parsing
          const preprocessed = str.replace(/^(\s*globs:\s*)\*\s*$/gm, '$1"*"');
          return yaml.load(preprocessed, { schema: yaml.DEFAULT_SCHEMA }) as object;
        } catch (error) {
          // If that fails, try with FAILSAFE_SCHEMA as a fallback
          try {
            return yaml.load(str, { schema: yaml.FAILSAFE_SCHEMA }) as object;
          } catch {
            // If all else fails, throw the original error
            throw error;
          }
        }
      },
    },
  },
};

export async function parseCursorConfiguration(
  baseDir: string = process.cwd()
): Promise<CursorImportResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];

  // Check for .cursorrules file (legacy)
  const cursorFilePath = join(baseDir, ".cursorrules");
  if (await fileExists(cursorFilePath)) {
    try {
      const rawContent = await readFileContent(cursorFilePath);
      const parsed = matter(rawContent, customMatterOptions);
      const content = parsed.content.trim();

      if (content) {
        const frontmatter: RuleFrontmatter = {
          root: false,
          targets: ["cursor"],
          description: "Cursor IDE configuration rules",
          globs: ["**/*"],
        };

        rules.push({
          frontmatter,
          content,
          filename: "cursor-rules",
          filepath: cursorFilePath,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to parse .cursorrules file: ${errorMessage}`);
    }
  }

  // Check for .cursor/rules/*.mdc files
  const cursorRulesDir = join(baseDir, ".cursor", "rules");
  if (await fileExists(cursorRulesDir)) {
    try {
      const { readdir } = await import("node:fs/promises");
      const files = await readdir(cursorRulesDir);

      for (const file of files) {
        if (file.endsWith(".mdc")) {
          const filePath = join(cursorRulesDir, file);
          try {
            const rawContent = await readFileContent(filePath);
            const parsed = matter(rawContent, customMatterOptions);
            const content = parsed.content.trim();

            if (content) {
              const filename = basename(file, ".mdc");
              const frontmatter: RuleFrontmatter = {
                root: false,
                targets: ["cursor"],
                description: `Cursor rule: ${filename}`,
                globs: ["**/*"],
              };

              rules.push({
                frontmatter,
                content,
                filename: `cursor-${filename}`,
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
      errors.push(`Failed to parse .cursor/rules files: ${errorMessage}`);
    }
  }

  if (rules.length === 0) {
    errors.push("No Cursor configuration files found (.cursorrules or .cursor/rules/*.mdc)");
  }

  return { rules, errors };
}
