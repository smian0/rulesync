import { basename, join, dirname, relative } from "path";
import { readFile } from "fs/promises";
import { FeatureProcessor } from "../types/feature-processor.js";
import { RulesyncFile } from "../types/rulesync-file.js";
import { ToolFile } from "../types/tool-file.js";
import { ToolTarget } from "../types/tool-targets.js";
import { logger } from "../utils/logger.js";
import { CursorGenericContent } from "./cursor-generic-content.js";
import { GenericRulesyncFile } from "./generic-rulesync-file.js";
import { parseFrontmatter } from "../utils/frontmatter.js";

export interface UniversalClaudeProcessorOptions {
  baseDir?: string;
  toolTarget: ToolTarget;
}

/**
 * Universal Claude Code Sync - handles ALL .claude content automatically
 * 
 * This processor discovers and converts any content from .rulesync/custom/
 * to the target IDE format, enabling full Claude Code project sync
 * without manual configuration.
 */
export class UniversalClaudeProcessor extends FeatureProcessor<RulesyncFile, ToolFile> {
  private readonly toolTarget: ToolTarget;

  constructor({ baseDir = ".", toolTarget }: UniversalClaudeProcessorOptions) {
    super({ baseDir });
    this.toolTarget = toolTarget;
  }

  static getToolTargets(): ToolTarget[] {
    return ["cursor", "opencode"];
  }

  async loadRulesyncFiles(): Promise<RulesyncFile[]> {
    const customDir = join(this.baseDir, ".rulesync/custom");
    const rulesyncFiles: RulesyncFile[] = [];
    
    try {
      // Scan for all files in .rulesync/custom/ following directory structure
      const allFiles = await this.scanForMdFiles(customDir);
      
      for (const filePath of allFiles) {
        try {
          const content = await readFile(filePath, "utf-8");
          const relativePath = relative(customDir, filePath);
          const fileName = basename(filePath, ".md");
          const dirPath = dirname(relativePath);
          
          // Parse the existing file content with custom frontmatter
          const { frontmatter, body } = parseFrontmatter(content);
          
          // Convert custom frontmatter to rulesync format
          const convertedFrontmatter = {
            targets: ["*"] as const,
            description: frontmatter.source || `Generated from ${relativePath}`,
            originalPath: frontmatter.originalPath || relativePath.replace(/\.md$/, ""),
            contentType: frontmatter.contentType || dirPath
          };
          
          const rulesyncFile = new GenericRulesyncFile({
            baseDir: this.baseDir,
            fileName: `${dirPath}-${fileName}`, // Encode directory in filename for compatibility
            body: body,
            frontmatter: convertedFrontmatter,
            validate: false
          });
          
          rulesyncFiles.push(rulesyncFile);
        } catch (error) {
          logger.warn(`Failed to process universal file ${filePath}:`, error);
          continue;
        }
      }
      
      logger.info(`Loaded ${rulesyncFiles.length} files from rulesync/custom (universal pattern)`);
      return rulesyncFiles;
      
    } catch (error) {
      logger.warn("Failed to load universal files:", error);
      return [];
    }
  }

  async convertRulesyncFilesToToolFiles(rulesyncFiles: RulesyncFile[]): Promise<ToolFile[]> {
    const toolFiles: ToolFile[] = [];
    
    for (const rulesyncFile of rulesyncFiles) {
      try {
        const frontmatter = rulesyncFile.getFrontmatter();
        const fileName = rulesyncFile.getRelativeFilePath().replace(/\.md$/, "");
        const body = rulesyncFile.getBody();
        
        // Extract directory structure from encoded filename or frontmatter
        const originalPath = frontmatter.originalPath || fileName;
        const contentType = frontmatter.contentType || "universal";
        
        // Determine directory structure
        let directoryPath: string | undefined;
        let cleanFileName: string;
        
        if (originalPath.includes("/")) {
          const parts = originalPath.split("/");
          directoryPath = parts.slice(0, -1).join("/");
          cleanFileName = parts[parts.length - 1];
        } else if (fileName.includes("-")) {
          // Handle encoded filenames like "context-project-overview"
          const parts = fileName.split("-");
          if (parts.length > 1) {
            directoryPath = parts[0];
            cleanFileName = parts.slice(1).join("-");
          } else {
            cleanFileName = fileName;
          }
        } else {
          cleanFileName = fileName;
        }
        
        // Generate tool file based on target
        let toolFile: ToolFile;
        
        if (this.toolTarget === "cursor") {
          toolFile = new CursorGenericContent({
            fileName: cleanFileName,
            fileContent: body,
            contentType: contentType,
            relativePath: originalPath,
            directoryPath: directoryPath
          });
        } else if (this.toolTarget === "opencode") {
          // For opencode, create a simple markdown file in .opencode/memories
          const OpencodeGenericContent = this.createOpencodeGenericContent();
          toolFile = new OpencodeGenericContent({
            fileName: cleanFileName,
            fileContent: body,
            contentType: contentType,
            relativePath: originalPath,
            directoryPath: directoryPath
          });
        } else {
          logger.warn(`Unsupported tool target: ${this.toolTarget}`);
          continue;
        }
        
        toolFiles.push(toolFile);
        
      } catch (error) {
        logger.warn(`Failed to convert universal file ${rulesyncFile.getRelativeFilePath()}:`, error);
        continue;
      }
    }
    
    return toolFiles;
  }

  private createOpencodeGenericContent() {
    return class OpencodeGenericContent extends ToolFile {
      private readonly contentType: string;
      private readonly sourceRelativePath: string;

      constructor({ fileName, fileContent, contentType, relativePath, directoryPath }: {
        fileName: string;
        fileContent: string;
        contentType: string;
        relativePath: string;
        directoryPath?: string;
      }) {
        const baseName = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
        const opencodeFileName = `${baseName}.md`;
        
        super({
          baseDir: ".",
          relativeDirPath: ".opencode/memories",
          relativeFilePath: opencodeFileName,
          fileContent: fileContent,
          validate: false
        });
        
        this.contentType = contentType;
        this.sourceRelativePath = relativePath;
      }

      getFileContent(): string {
        // Format content for OpenCode with metadata header
        const header = `<!-- Generated from .claude/${this.contentType}/${this.sourceRelativePath} -->\n` +
                      `<!-- Content Type: ${this.contentType} -->\n` +
                      `<!-- Generated by rulesync Universal Claude Code Sync -->\n`;
        
        const processedContent = super.getFileContent();
        
        return `${header}\n${processedContent}`;
      }
    };
  }

  private async scanForMdFiles(dir: string): Promise<string[]> {
    const { globSync } = await import("fs");
    const pattern = join(dir, "**/*.md");
    return globSync(pattern, { absolute: true });
  }

  async loadToolFiles(): Promise<ToolFile[]> {
    // Not implemented for universal processor
    return [];
  }
}
