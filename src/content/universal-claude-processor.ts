import { basename, join } from "path";
import { readFile } from "fs/promises";
import { FeatureProcessor } from "../types/feature-processor.js";
import { RulesyncFile } from "../types/rulesync-file.js";
import { ToolFile } from "../types/tool-file.js";
import { ToolTarget } from "../types/tool-targets.js";
import { logger } from "../utils/logger.js";
import { ContentScanner, ContentMap } from "../discovery/content-scanner.js";
import { CursorGenericContent } from "./cursor-generic-content.js";
import { GenericRulesyncFile } from "./generic-rulesync-file.js";

export interface UniversalClaudeProcessorOptions {
  baseDir?: string;
  toolTarget: ToolTarget;
}

/**
 * Universal Claude Processor - handles ANY .claude directory structure automatically
 * No need for specific processors or feature flags - discovers and processes everything
 */
export class UniversalClaudeProcessor extends FeatureProcessor {
  private readonly toolTarget: ToolTarget;
  
  constructor({ baseDir = ".", toolTarget }: UniversalClaudeProcessorOptions) {
    super({ baseDir });
    this.toolTarget = toolTarget;
  }

  static getToolTargets(): ToolTarget[] {
    return ["cursor"];
  }

  async loadRulesyncFiles(): Promise<RulesyncFile[]> {
    // Not implemented - this processor is for .claude -> .cursor only
    return [];
  }

  async loadToolFiles(): Promise<ToolFile[]> {
    const scanner = new ContentScanner(this.baseDir);
    const contentMap = await scanner.scanClaudeDirectory();
    
    const allToolFiles: ToolFile[] = [];
    
    // Process all discovered content types automatically
    for (const [contentType, contentDir] of Object.entries(contentMap)) {
      const allFiles = ContentScanner.getAllFiles(contentDir);
      
      if (allFiles.length === 0) {
        continue;
      }
      
      logger.info(`Processing ${contentType}: ${allFiles.length} files`);
      
      for (const filePath of allFiles) {
        try {
          const content = await readFile(filePath, "utf-8");
          const relativePath = filePath.replace(join(this.baseDir, ".claude") + "/", "");
          const fileName = basename(filePath, ".md");
          
          // Create generic tool file for any content type
          if (this.toolTarget === "cursor") {
            const toolFile = new CursorGenericContent({
              fileName: this.generateFileName(contentType, relativePath),
              fileContent: content,
              contentType,
              relativePath
            });
            allToolFiles.push(toolFile);
          }
          
        } catch (error) {
          logger.error(`Error reading ${contentType} file ${filePath}: ${error}`);
        }
      }
    }
    
    // Process individual files in .claude root (like CLAUDE.md, settings.json)
    await this.processRootFiles(allToolFiles);
    
    logger.info(`Universal processor loaded ${allToolFiles.length} files total`);
    return allToolFiles;
  }

  private async processRootFiles(allToolFiles: ToolFile[]): Promise<void> {
    try {
      const { readdir } = await import("fs/promises");
      const claudeRootPath = join(this.baseDir, ".claude");
      const entries = await readdir(claudeRootPath, { withFileTypes: true });
      
      // Process all files in .claude root (not subdirectories)
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.json'))) {
          const filePath = join(claudeRootPath, entry.name);
          try {
            const content = await readFile(filePath, "utf-8");
            
            if (this.toolTarget === "cursor") {
              const toolFile = new CursorGenericContent({
                fileName: entry.name.replace(/\.(md|json)$/, ""),
                fileContent: content,
                contentType: "root",
                relativePath: entry.name
              });
              allToolFiles.push(toolFile);
            }
            
            logger.info(`Processed root file: ${entry.name}`);
          } catch (error) {
            logger.error(`Error reading root file ${entry.name}: ${error}`);
          }
        }
      }
    } catch (error) {
      logger.error(`Error scanning .claude root directory: ${error}`);
    }
  }

  private generateFileName(contentType: string, relativePath: string): string {
    const fileName = basename(relativePath, ".md");
    
    // Handle nested files (like epics/mcp-ccpm-server/001.md)
    if (relativePath.includes("/")) {
      const pathParts = relativePath.split("/");
      pathParts.pop(); // Remove filename
      const subPath = pathParts.join("-");
      return `${contentType}-${subPath}-${fileName}`;
    }
    
    return `${contentType}-${fileName}`;
  }

  async convertRulesyncFilesToToolFiles(rulesyncFiles: RulesyncFile[]): Promise<ToolFile[]> {
    // Not implemented - this processor is for .claude -> .cursor only
    return [];
  }

  async convertToolFilesToRulesyncFiles(toolFiles: ToolFile[]): Promise<RulesyncFile[]> {
    // Not implemented - this processor is for .claude -> .cursor only  
    return [];
  }
}