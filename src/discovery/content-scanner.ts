import { join } from "path";
import { readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import { logger } from "../utils/logger.js";

export interface ContentDirectory {
  name: string;
  path: string;
  files: string[];
  subdirectories: ContentDirectory[];
}

export interface ContentMap {
  [directoryName: string]: ContentDirectory;
}

/**
 * Universal Claude Code content discovery engine
 * Automatically scans .claude directory structure and identifies all content types
 */
export class ContentScanner {
  private readonly basePath: string;
  private readonly claudePath: string;

  constructor(basePath = ".") {
    this.basePath = basePath;
    this.claudePath = join(basePath, ".claude");
  }

  /**
   * Scan the entire .claude directory structure
   */
  async scanClaudeDirectory(): Promise<ContentMap> {
    if (!existsSync(this.claudePath)) {
      logger.info("No .claude directory found");
      return {};
    }

    logger.info("Scanning .claude directory structure...");
    const contentMap: ContentMap = {};

    try {
      const entries = await readdir(this.claudePath);
      
      for (const entry of entries) {
        const entryPath = join(this.claudePath, entry);
        const stats = await stat(entryPath);
        
        if (stats.isDirectory()) {
          const contentDir = await this.scanDirectory(entry, entryPath);
          contentMap[entry] = contentDir;
          logger.info(`Found content directory: ${entry} (${contentDir.files.length} files)`);
        }
      }

      return contentMap;
    } catch (error) {
      logger.error(`Error scanning .claude directory: ${error}`);
      return {};
    }
  }

  /**
   * Recursively scan a directory and its subdirectories
   */
  private async scanDirectory(name: string, path: string): Promise<ContentDirectory> {
    const files: string[] = [];
    const subdirectories: ContentDirectory[] = [];

    try {
      const entries = await readdir(path);
      
      for (const entry of entries) {
        const entryPath = join(path, entry);
        const stats = await stat(entryPath);
        
        if (stats.isDirectory()) {
          const subdir = await this.scanDirectory(entry, entryPath);
          subdirectories.push(subdir);
        } else if (entry.endsWith('.md')) {
          files.push(entryPath);
        }
      }
    } catch (error) {
      logger.error(`Error scanning directory ${path}: ${error}`);
    }

    return {
      name,
      path,
      files,
      subdirectories
    };
  }

  /**
   * Get all markdown files from a content directory (including subdirectories)
   */
  static getAllFiles(contentDir: ContentDirectory): string[] {
    const allFiles = [...contentDir.files];
    
    for (const subdir of contentDir.subdirectories) {
      allFiles.push(...ContentScanner.getAllFiles(subdir));
    }
    
    return allFiles;
  }

  /**
   * Check if a specific content type exists
   */
  hasContentType(contentMap: ContentMap, contentType: string): boolean {
    return contentType in contentMap && contentMap[contentType].files.length > 0;
  }

  /**
   * Get content types that have files
   */
  getAvailableContentTypes(contentMap: ContentMap): string[] {
    return Object.keys(contentMap).filter(type => 
      contentMap[type].files.length > 0 || 
      this.hasFilesInSubdirectories(contentMap[type])
    );
  }

  private hasFilesInSubdirectories(contentDir: ContentDirectory): boolean {
    for (const subdir of contentDir.subdirectories) {
      if (subdir.files.length > 0 || this.hasFilesInSubdirectories(subdir)) {
        return true;
      }
    }
    return false;
  }
}