import { basename, join } from "node:path";
import matter from "gray-matter";
import { DEFAULT_SCHEMA, FAILSAFE_SCHEMA, load } from "js-yaml";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface CursorImportResult {
  rules: ParsedRule[];
  errors: string[];
  ignorePatterns?: string[];
  mcpServers?: Record<string, unknown>;
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
          return load(preprocessed, { schema: DEFAULT_SCHEMA }) as object;
        } catch (error) {
          // If that fails, try with FAILSAFE_SCHEMA as a fallback
          try {
            return load(str, { schema: FAILSAFE_SCHEMA }) as object;
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
  baseDir: string = process.cwd(),
): Promise<CursorImportResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];
  let ignorePatterns: string[] | undefined;
  let mcpServers: Record<string, unknown> | undefined;

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

  // Check for .cursorignore file
  const cursorIgnorePath = join(baseDir, ".cursorignore");
  if (await fileExists(cursorIgnorePath)) {
    try {
      const content = await readFileContent(cursorIgnorePath);
      const patterns = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));
      if (patterns.length > 0) {
        ignorePatterns = patterns;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to parse .cursorignore: ${errorMessage}`);
    }
  }

  // Check for .cursor/mcp.json file
  const cursorMcpPath = join(baseDir, ".cursor", "mcp.json");
  if (await fileExists(cursorMcpPath)) {
    try {
      const content = await readFileContent(cursorMcpPath);
      const mcp = JSON.parse(content);
      if (mcp.mcpServers && Object.keys(mcp.mcpServers).length > 0) {
        mcpServers = mcp.mcpServers;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to parse .cursor/mcp.json: ${errorMessage}`);
    }
  }

  return {
    rules,
    errors,
    ...(ignorePatterns && { ignorePatterns }),
    ...(mcpServers && { mcpServers }),
  };
}
