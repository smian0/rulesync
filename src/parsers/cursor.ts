import { basename, join } from "node:path";
import matter from "gray-matter";
import { DEFAULT_SCHEMA, FAILSAFE_SCHEMA, load } from "js-yaml";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import type { RulesyncMcpServer } from "../types/mcp.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface CursorImportResult {
  rules: ParsedRule[];
  errors: string[];
  ignorePatterns?: string[];
  mcpServers?: Record<string, RulesyncMcpServer>;
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
          // Preprocess to handle Cursor's valid formats:
          // 1. "globs: *" (bare asterisk) -> "globs: \"*\""
          // 2. "globs: **/*.ts" (glob patterns without quotes) -> "globs: \"**/*.ts\""
          // 3. "globs: **/*.py,**/*.pyc" (comma-separated patterns) -> "globs: \"**/*.py,**/*.pyc\""
          // Note: Don't process array literals like [] or ["item"]
          let preprocessed = str
            // Handle bare asterisk
            .replace(/^(\s*globs:\s*)\*\s*$/gm, '$1"*"')
            // Handle glob patterns without quotes (single or comma-separated)
            // But exclude array literals (starting with [ or already quoted strings)
            .replace(/^(\s*globs:\s*)([^\s"'[\n][^"'[\n]*?)(\s*)$/gm, '$1"$2"$3');

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

/**
 * convert from .mdc file to rulesync format according to four kinds of .mdc file format
 */
function convertCursorMdcFrontmatter(cursorFrontmatter: any, filename: string): RuleFrontmatter {
  // 用語の定義に従って値を正規化
  const description = normalizeValue(cursorFrontmatter?.description);
  const globs = normalizeGlobsValue(cursorFrontmatter?.globs);
  const alwaysApply = cursorFrontmatter?.alwaysApply === true;

  // 1. always: alwaysApply: true がある場合
  if (alwaysApply) {
    return {
      root: false,
      targets: ["*"],
      description: "",
      globs: ["**/*"],
    };
  }

  // 2. manual: description空 + globs空 + alwaysApply: false
  if (isEmpty(description) && isEmpty(globs)) {
    return {
      root: false,
      targets: ["*"],
      description: "",
      globs: [],
    };
  }

  // 3. auto attached: description空 + globs非空 + alwaysApply: false
  if (isEmpty(description) && !isEmpty(globs)) {
    return {
      root: false,
      targets: ["*"],
      description: `Cursor rule: ${filename}`,
      globs: convertGlobsToArray(globs),
    };
  }

  // 4. agent_request: description非空 + alwaysApply: false
  if (!isEmpty(description)) {
    return {
      root: false,
      targets: ["*"],
      description: description!,
      globs: [],
    };
  }

  // デフォルト: manual として扱う
  return {
    root: false,
    targets: ["*"],
    description: "",
    globs: [],
  };
}

/**
 * 値を正規化する（空文字列、未記載、未定義を統一的に扱う）
 */
function normalizeValue(value: any): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(value);
}

/**
 * globs値を正規化する
 */
function normalizeGlobsValue(value: any): string | string[] | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? undefined : value;
  }
  return String(value);
}

/**
 * 値が空かどうかを判定する
 */
function isEmpty(value: any): boolean {
  return value === undefined || value === null || value === "";
}

/**
 * globs値を配列に変換する
 */
function convertGlobsToArray(globs: string | string[] | undefined): string[] {
  if (!globs) {
    return [];
  }

  if (Array.isArray(globs)) {
    return globs;
  }

  // カンマ区切りの文字列を配列に変換
  if (typeof globs === "string") {
    return globs
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
  }

  return [];
}

export async function parseCursorConfiguration(
  baseDir: string = process.cwd(),
): Promise<CursorImportResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];
  let ignorePatterns: string[] | undefined;
  let mcpServers: Record<string, RulesyncMcpServer> | undefined;

  // Check for .cursorrules file (legacy)
  const cursorFilePath = join(baseDir, ".cursorrules");
  if (await fileExists(cursorFilePath)) {
    try {
      const rawContent = await readFileContent(cursorFilePath);
      const parsed = matter(rawContent, customMatterOptions);
      const content = parsed.content.trim();

      if (content) {
        // Convert Cursor frontmatter format to rulesync format
        const cursorFrontmatter = parsed.data as any;

        // Map Cursor's alwaysApply to rulesync's root (only if explicitly set to true)
        const root = cursorFrontmatter && cursorFrontmatter.alwaysApply === true;

        // Use existing values or defaults
        let globs = (cursorFrontmatter && (cursorFrontmatter.globs || cursorFrontmatter.glob)) || [
          "**/*",
        ];
        // Ensure globs is always an array
        if (typeof globs === "string") {
          globs = [globs];
        }

        const frontmatter: RuleFrontmatter = {
          root: root,
          targets: ["cursor"],
          description:
            (cursorFrontmatter && cursorFrontmatter.description) ||
            "Cursor IDE configuration rules",
          globs: globs,
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
              // Convert according to four kinds of mdc file format
              const frontmatter = convertCursorMdcFrontmatter(parsed.data, filename);

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
        mcpServers = mcp.mcpServers as Record<string, RulesyncMcpServer>;
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
