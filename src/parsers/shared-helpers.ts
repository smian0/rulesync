import { join } from "node:path";
import matter from "gray-matter";
import type { ParsedRule, RuleFrontmatter, ToolTarget } from "../types/index.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface ParserResult {
  rules: ParsedRule[];
  errors: string[];
}

export interface DirectoryConfig {
  directory: string;
  filePattern: string;
  description: string;
}

export interface ParserConfig {
  tool: ToolTarget;
  mainFile?: {
    path: string;
    useFrontmatter?: boolean;
    description: string;
  };
  directories?: DirectoryConfig[];
  errorMessage: string;
}

/**
 * Generic parser for configuration files that follows common patterns
 */
export async function parseConfigurationFiles(
  baseDir: string = process.cwd(),
  config: ParserConfig,
): Promise<ParserResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];

  // Parse main configuration file
  if (config.mainFile) {
    const mainFilePath = join(baseDir, config.mainFile.path);
    if (await fileExists(mainFilePath)) {
      try {
        const rawContent = await readFileContent(mainFilePath);
        let content: string;
        let frontmatter: RuleFrontmatter;

        if (config.mainFile.useFrontmatter) {
          const parsed = matter(rawContent);
          content = parsed.content.trim();
          frontmatter = {
            root: false,
            targets: [config.tool],
            description: config.mainFile.description,
            globs: ["**/*"],
          };
        } else {
          content = rawContent.trim();
          frontmatter = {
            root: false,
            targets: [config.tool],
            description: config.mainFile.description,
            globs: ["**/*"],
          };
        }

        if (content) {
          rules.push({
            frontmatter,
            content,
            filename: `${config.tool}-instructions`,
            filepath: mainFilePath,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to parse ${config.mainFile.path}: ${errorMessage}`);
      }
    }
  }

  // Parse directory-based configuration files
  if (config.directories) {
    for (const dirConfig of config.directories) {
      const dirPath = join(baseDir, dirConfig.directory);
      if (await fileExists(dirPath)) {
        try {
          const { readdir } = await import("node:fs/promises");
          const files = await readdir(dirPath);

          for (const file of files) {
            if (file.endsWith(dirConfig.filePattern)) {
              const filePath = join(dirPath, file);
              try {
                const rawContent = await readFileContent(filePath);
                let content: string;

                if (dirConfig.filePattern === ".instructions.md") {
                  // GitHub Copilot style with frontmatter
                  const parsed = matter(rawContent);
                  content = parsed.content.trim();
                } else {
                  content = rawContent.trim();
                }

                if (content) {
                  const filename = file.replace(new RegExp(`\\${dirConfig.filePattern}$`), "");
                  const frontmatter: RuleFrontmatter = {
                    root: false,
                    targets: [config.tool],
                    description: `${dirConfig.description}: ${filename}`,
                    globs: ["**/*"],
                  };

                  rules.push({
                    frontmatter,
                    content,
                    filename: `${config.tool}-${filename}`,
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
          errors.push(`Failed to parse ${dirConfig.directory} files: ${errorMessage}`);
        }
      }
    }
  }

  if (rules.length === 0) {
    errors.push(config.errorMessage);
  }

  return { rules, errors };
}
