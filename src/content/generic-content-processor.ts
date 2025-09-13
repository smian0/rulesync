import { basename, join, relative } from "path";
import { readFile } from "fs/promises";
import { FeatureProcessor } from "../types/feature-processor.js";
import { RulesyncFile } from "../types/rulesync-file.js";
import { ToolFile } from "../types/tool-file.js";
import { ToolTarget } from "../types/tool-targets.js";
import { findFilesByGlobs } from "../utils/file.js";
import { logger } from "../utils/logger.js";
import { ContentScanner, ContentMap } from "../discovery/content-scanner.js";
import { CursorGenericContent } from "./cursor-generic-content.js";

export interface GenericContentProcessorOptions {
  baseDir?: string;
  toolTarget: ToolTarget;
  contentType: string;
}

/**
 * Generic content processor for handling any .claude directory content type
 * Supports context, epics, prds, technical-design, and custom content types
 */
export class GenericContentProcessor extends FeatureProcessor {
  private readonly toolTarget: ToolTarget;
  private readonly contentType: string;
  
  constructor({ baseDir = ".", toolTarget, contentType }: GenericContentProcessorOptions) {
    super({ baseDir });
    this.toolTarget = toolTarget;
    this.contentType = contentType;
  }

  static getToolTargets({ includeSimulated = true } = {}): ToolTarget[] {
    // Support all tools that have generic content capabilities
    const targets: ToolTarget[] = ["cursor"];
    
    if (includeSimulated) {
      // Add simulated targets here if needed
    }
    
    return targets;
  }

  async loadRulesyncFiles(): Promise<RulesyncFile[]> {
    const rulesyncDir = join(this.baseDir, ".rulesync", "content", this.contentType);
    const contentFiles = await findFilesByGlobs(join(rulesyncDir, "**/*.md"));
    
    const rulesyncFiles: RulesyncFile[] = [];
    
    for (const filePath of contentFiles) {
      try {
        const content = await readFile(filePath, "utf-8");
        const fileName = basename(filePath, ".md");
        
        rulesyncFiles.push(new RulesyncFile({
          fileName,
          fileContent: content,
          frontmatter: { contentType: this.contentType }
        }));
      } catch (error) {
        logger.error(`Error reading rulesync file ${filePath}: ${error}`);
      }
    }
    
    return rulesyncFiles;
  }

  async loadToolFiles(): Promise<ToolFile[]> {
    const scanner = new ContentScanner(this.baseDir);
    const contentMap = await scanner.scanClaudeDirectory();
    
    if (!scanner.hasContentType(contentMap, this.contentType)) {
      logger.info(`No ${this.contentType} content found`);
      return [];
    }
    
    const contentDir = contentMap[this.contentType];
    const allFiles = ContentScanner.getAllFiles(contentDir);
    const toolFiles: ToolFile[] = [];
    
    for (const filePath of allFiles) {
      try {
        const content = await readFile(filePath, "utf-8");
        const relativePath = relative(join(this.baseDir, ".claude", this.contentType), filePath);
        const fileName = basename(filePath, ".md");
        
        // Create appropriate ToolFile based on target
        if (this.toolTarget === "cursor") {
          const cursorContent = new CursorGenericContent({
            fileName,
            fileContent: content,
            contentType: this.contentType,
            relativePath
          });
          toolFiles.push(cursorContent);
        }
        
      } catch (error) {
        logger.error(`Error reading ${this.contentType} file ${filePath}: ${error}`);
      }
    }
    
    logger.info(`Successfully loaded ${toolFiles.length} ${this.contentType} file(s)`);
    return toolFiles;
  }

  async convertRulesyncFilesToToolFiles(rulesyncFiles: RulesyncFile[]): Promise<ToolFile[]> {
    const toolFiles: ToolFile[] = [];
    
    for (const rulesyncFile of rulesyncFiles) {
      if (this.toolTarget === "cursor") {
        const cursorContent = new CursorGenericContent({
          fileName: rulesyncFile.getFileName(),
          fileContent: rulesyncFile.getFileContent(),
          contentType: this.contentType,
          relativePath: `${rulesyncFile.getFileName()}.md`
        });
        toolFiles.push(cursorContent);
      }
    }
    
    return toolFiles;
  }

  async convertToolFilesToRulesyncFiles(toolFiles: ToolFile[]): Promise<RulesyncFile[]> {
    const rulesyncFiles: RulesyncFile[] = [];
    
    for (const toolFile of toolFiles) {
      // Extract filename from relative file path
      const fileName = basename(toolFile.getRelativeFilePath(), '.mdc');
      
      const rulesyncFile = new RulesyncFile({
        fileName: fileName,
        fileContent: toolFile.getFileContent(),
        frontmatter: { 
          contentType: this.contentType,
          source: toolFile.getRelativeFilePath()
        }
      });
      rulesyncFiles.push(rulesyncFile);
    }
    
    return rulesyncFiles;
  }
}