import { readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { filterIgnoredFiles } from "./ignore.js";
import { ensureDir, fileExists, readFileContent, writeFileContent } from "./file-ops.js";

export { ensureDir, fileExists, readFileContent, writeFileContent };

export async function findFiles(
  dir: string,
  extension: string = ".md",
  ignorePatterns?: string[]
): Promise<string[]> {
  try {
    const files = await readdir(dir);
    const filtered = files
      .filter((file) => file.endsWith(extension))
      .map((file) => join(dir, file));

    if (ignorePatterns && ignorePatterns.length > 0) {
      return filterIgnoredFiles(filtered, ignorePatterns);
    }

    return filtered;
  } catch {
    return [];
  }
}


export async function removeDirectory(dirPath: string): Promise<void> {
  // Safety check: prevent deletion of dangerous paths
  const dangerousPaths = [".", "/", "~", "src", "node_modules"];
  if (dangerousPaths.includes(dirPath) || dirPath === "") {
    console.warn(`Skipping deletion of dangerous path: ${dirPath}`);
    return;
  }

  try {
    if (await fileExists(dirPath)) {
      await rm(dirPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.warn(`Failed to remove directory ${dirPath}:`, error);
  }
}

export async function removeFile(filepath: string): Promise<void> {
  try {
    if (await fileExists(filepath)) {
      await rm(filepath);
    }
  } catch (error) {
    console.warn(`Failed to remove file ${filepath}:`, error);
  }
}

export async function removeClaudeGeneratedFiles(): Promise<void> {
  const filesToRemove = ["CLAUDE.md", ".claude/memories"];

  for (const fileOrDir of filesToRemove) {
    if (fileOrDir.endsWith("/memories")) {
      // Remove the entire memories directory
      await removeDirectory(fileOrDir);
    } else {
      // Remove individual file
      await removeFile(fileOrDir);
    }
  }
}
