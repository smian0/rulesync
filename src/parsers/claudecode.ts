import { basename, join } from "node:path";
import type { ParsedRule, RuleFrontmatter } from "../types/index.js";
import { fileExists, readFileContent } from "../utils/index.js";

export interface ClaudeImportResult {
  rules: ParsedRule[];
  errors: string[];
}

export async function parseClaudeConfiguration(
  baseDir: string = process.cwd()
): Promise<ClaudeImportResult> {
  const errors: string[] = [];
  const rules: ParsedRule[] = [];

  // Check for CLAUDE.md file
  const claudeFilePath = join(baseDir, "CLAUDE.md");
  if (!(await fileExists(claudeFilePath))) {
    errors.push("CLAUDE.md file not found");
    return { rules, errors };
  }

  try {
    const claudeContent = await readFileContent(claudeFilePath);

    // Parse main CLAUDE.md content
    const mainRule = parseClaudeMainFile(claudeContent, claudeFilePath);
    if (mainRule) {
      rules.push(mainRule);
    }

    // Parse memory files if they exist
    const memoryDir = join(baseDir, ".claude", "memories");
    if (await fileExists(memoryDir)) {
      const memoryRules = await parseClaudeMemoryFiles(memoryDir);
      rules.push(...memoryRules);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Failed to parse Claude configuration: ${errorMessage}`);
  }

  return { rules, errors };
}

function parseClaudeMainFile(content: string, filepath: string): ParsedRule | null {
  // Extract the main content, excluding the reference table
  const lines = content.split("\n");
  let contentStartIndex = 0;

  // Skip the reference table if it exists
  if (lines.some((line) => line.includes("| Document | Description | File Patterns |"))) {
    const tableEndIndex = lines.findIndex(
      (line, index) =>
        index > 0 &&
        line.trim() === "" &&
        lines[index - 1]?.includes("|") &&
        !lines[index + 1]?.includes("|")
    );
    if (tableEndIndex !== -1) {
      contentStartIndex = tableEndIndex + 1;
    }
  }

  const mainContent = lines.slice(contentStartIndex).join("\n").trim();

  if (!mainContent) {
    return null;
  }

  const frontmatter: RuleFrontmatter = {
    root: false,
    targets: ["claudecode"],
    description: "Main Claude Code configuration",
    globs: ["**/*"],
  };

  return {
    frontmatter,
    content: mainContent,
    filename: "claude-main",
    filepath,
  };
}

async function parseClaudeMemoryFiles(memoryDir: string): Promise<ParsedRule[]> {
  const rules: ParsedRule[] = [];

  try {
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(memoryDir);

    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = join(memoryDir, file);
        const content = await readFileContent(filePath);

        if (content.trim()) {
          const filename = basename(file, ".md");
          const frontmatter: RuleFrontmatter = {
            root: false,
            targets: ["claudecode"],
            description: `Memory file: ${filename}`,
            globs: ["**/*"],
          };

          rules.push({
            frontmatter,
            content: content.trim(),
            filename: `claude-memory-${filename}`,
            filepath: filePath,
          });
        }
      }
    }
  } catch (_error) {
    // Silently handle directory reading errors
  }

  return rules;
}
