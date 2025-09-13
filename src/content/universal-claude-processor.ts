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
    const rulesyncFiles: RulesyncFile[] = [];
    
    // Define standard rulesync directories
    const standardDirectories = [
      { path: join(this.baseDir, ".rulesync/rules"), type: "rules" },
      { path: join(this.baseDir, ".rulesync/commands"), type: "commands" },
      { path: join(this.baseDir, ".rulesync/subagents"), type: "subagents" },
    ];

    // Auto-discover custom directories (any non-standard directories)
    const customDirectories = await this.discoverCustomDirectories(join(this.baseDir, ".rulesync/custom"));
    
    // Combine all directories to scan
    const directoriesToScan = [...standardDirectories, ...customDirectories];
    
    for (const directory of directoriesToScan) {
      try {
        const allFiles = await this.scanForMdFiles(directory.path);
        
        for (const filePath of allFiles) {
          try {
            const content = await readFile(filePath, "utf-8");
            const relativePath = relative(directory.path, filePath);
            const fileName = basename(filePath, ".md");
            
            // Parse the existing file content with custom frontmatter
            const { frontmatter, body } = parseFrontmatter(content);
            
            // Convert custom frontmatter to rulesync format
            const convertedFrontmatter = {
              targets: ["*"] as const,
              description: frontmatter.description || frontmatter.source || `Generated from ${directory.type}/${relativePath}`,
              originalPath: frontmatter.originalPath || relativePath.replace(/\.md$/, ""),
              contentType: directory.type
            };
            
            const rulesyncFile = new GenericRulesyncFile({
              baseDir: this.baseDir,
              fileName: fileName, // Use clean filename without directory encoding
              body: body,
              frontmatter: convertedFrontmatter,
              validate: false
            });
            
            rulesyncFiles.push(rulesyncFile);
          } catch (error) {
            logger.warn(`Failed to process file ${filePath}:`, error);
            continue;
          }
        }
      } catch (error) {
        // Directory might not exist, continue with others
        logger.debug(`Directory ${directory.path} not found or inaccessible`);
        continue;
      }
    }
    
    logger.info(`Loaded ${rulesyncFiles.length} files from standard + auto-discovered directories (universal pattern)`);
    return rulesyncFiles;
  }

  async convertRulesyncFilesToToolFiles(rulesyncFiles: RulesyncFile[]): Promise<ToolFile[]> {
    const toolFiles: ToolFile[] = [];
    const detectedAgents: Array<{name: string, fileName: string, frontmatter: any}> = [];
    
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
          // Route based on content type (directory structure)
          if (contentType === "subagents") {
            // Route to .opencode/agents/ and track for opencode.json generation
            detectedAgents.push({
              name: cleanFileName,
              fileName: `${cleanFileName}.md`,
              frontmatter: frontmatter
            });
            
            const OpencodeAgentContent = this.createOpencodeAgentContent();
            toolFile = new OpencodeAgentContent({
              fileName: cleanFileName,
              fileContent: body,
              contentType: contentType,
              relativePath: originalPath,
              directoryPath: directoryPath
            });
          } else if (contentType === "commands") {
            // Route to .opencode/command/
            const OpencodeCommandContent = this.createOpencodeCommandContent();
            toolFile = new OpencodeCommandContent({
              fileName: cleanFileName,
              fileContent: body,
              contentType: contentType,
              relativePath: originalPath,
              directoryPath: directoryPath
            });
          } else if (contentType === "rules" && cleanFileName !== "overview") {
            // Route CCMP rules to .opencode/memories/ (skip standard rulesync overview.md)
            const OpencodeGenericContent = this.createOpencodeGenericContent();
            toolFile = new OpencodeGenericContent({
              fileName: cleanFileName,
              fileContent: body,
              contentType: contentType,
              relativePath: originalPath,
              directoryPath: directoryPath
            });
          } else if (!["rules", "commands", "subagents"].includes(contentType)) {
            // Route any non-standard content types (custom directories) to .opencode/memories/
            const OpencodeGenericContent = this.createOpencodeGenericContent();
            toolFile = new OpencodeGenericContent({
              fileName: cleanFileName,
              fileContent: body,
              contentType: contentType,
              relativePath: originalPath,
              directoryPath: directoryPath
            });
          } else {
            // Skip standard rulesync files (like overview.md) or unknown types
            logger.debug(`Skipping file ${cleanFileName} with contentType ${contentType}`);
            continue;
          }
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
    
    // Generate opencode.json if we have detected subagents
    if (this.toolTarget === "opencode" && detectedAgents.length > 0) {
      const opencodeConfig = this.generateOpencodeConfig(detectedAgents);
      const OpencodeConfigFile = this.createOpencodeConfigFile();
      const configFile = new OpencodeConfigFile({
        fileContent: JSON.stringify(opencodeConfig, null, 2)
      });
      toolFiles.push(configFile);
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

  private async discoverCustomDirectories(customBasePath: string): Promise<Array<{path: string, type: string}>> {
    const customDirectories: Array<{path: string, type: string}> = [];
    
    try {
      const { readdirSync, statSync } = await import("fs");
      const entries = readdirSync(customBasePath);
      
      for (const entry of entries) {
        const fullPath = join(customBasePath, entry);
        try {
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            customDirectories.push({
              path: fullPath,
              type: entry // Use directory name as content type
            });
            logger.debug(`Discovered custom directory: ${entry}`);
          }
        } catch (error) {
          // Skip entries that can't be accessed
          continue;
        }
      }
    } catch (error) {
      // Custom directory doesn't exist or can't be read
      logger.debug(`No custom directories found at ${customBasePath}`);
    }
    
    return customDirectories;
  }

  // Note: Removed heuristic detection methods - now using directory-based routing

  private createOpencodeAgentContent() {
    return class OpencodeAgentContent extends ToolFile {
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
        const agentFileName = `${baseName}.md`;
        
        super({
          baseDir: ".",
          relativeDirPath: ".opencode/agents",
          relativeFilePath: agentFileName,
          fileContent: fileContent,
          validate: false
        });
        
        this.contentType = contentType;
        this.sourceRelativePath = relativePath;
      }

      getFileContent(): string {
        // Format content for OpenCode agent with metadata header
        const header = `<!-- Generated from .claude/${this.contentType}/${this.sourceRelativePath} -->\n` +
                      `<!-- Subagent Configuration -->\n` +
                      `<!-- Generated by rulesync Universal Claude Code Sync -->\n`;
        
        const processedContent = super.getFileContent();
        
        return `${header}\n${processedContent}`;
      }
    };
  }

  private createOpencodeCommandContent() {
    return class OpencodeCommandContent extends ToolFile {
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
        const commandFileName = `${baseName}.md`;
        
        super({
          baseDir: ".",
          relativeDirPath: ".opencode/command",
          relativeFilePath: commandFileName,
          fileContent: fileContent,
          validate: false
        });
        
        this.contentType = contentType;
        this.sourceRelativePath = relativePath;
      }

      getFileContent(): string {
        const originalContent = super.getFileContent();
        
        // Parse existing frontmatter or create new one
        let frontmatter = '';
        let body = originalContent;
        
        // Check if content has frontmatter
        const frontmatterMatch = originalContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)/);
        if (frontmatterMatch) {
          const existingFrontmatter = frontmatterMatch[1];
          body = frontmatterMatch[2];
          
          // Convert CCPM format to OpenCode format
          const lines = existingFrontmatter.split('\n');
          const opencodeLines: string[] = [];
          
          for (const line of lines) {
            if (line.includes('description:')) {
              opencodeLines.push(line);
            } else if (line.includes('allowed-tools:')) {
              // Skip allowed-tools - not used in OpenCode commands
              continue;
            } else {
              opencodeLines.push(line);
            }
          }
          
          // Add OpenCode-specific fields if not present
          if (!existingFrontmatter.includes('agent:')) {
            opencodeLines.push('agent: build');
          }
          if (!existingFrontmatter.includes('model:')) {
            opencodeLines.push('model: anthropic/claude-3-5-sonnet-20241022');
          }
          
          frontmatter = opencodeLines.join('\n');
        } else {
          // Create new frontmatter for OpenCode
          frontmatter = `description: Generated from ${this.sourceRelativePath}
agent: build
model: anthropic/claude-3-5-sonnet-20241022`;
        }
        
        // Format for OpenCode command structure
        return `---
${frontmatter}
---

<!-- Generated from .claude/${this.contentType}/${this.sourceRelativePath} -->
<!-- OpenCode Command Configuration -->
<!-- Generated by rulesync Universal Claude Code Sync -->

${body.trim()}`;
      }
    };
  }

  private generateOpencodeConfig(detectedAgents: Array<{name: string, fileName: string, frontmatter: any}>): any {
    const agentConfigs: Record<string, any> = {};
    
    for (const agent of detectedAgents) {
      const agentConfig: any = {
        description: agent.frontmatter.description || `Generated agent: ${agent.name}`,
        mode: "subagent",
        model: agent.frontmatter.model || "anthropic/claude-sonnet-4-20250514",
        temperature: agent.frontmatter.temperature || 0.1,
        prompt: `{file:./agents/${agent.fileName}}`,
        tools: {}
      };
      
      // Extract tool configuration from frontmatter or use defaults
      if (agent.frontmatter.tools) {
        agentConfig.tools = agent.frontmatter.tools;
      } else {
        // Set default tools based on agent type
        const defaultTools = this.getDefaultToolsForAgent(agent.name);
        agentConfig.tools = defaultTools;
      }
      
      agentConfigs[agent.name] = agentConfig;
    }
    
    return {
      "$schema": "https://opencode.ai/config.json",
      agent: agentConfigs,
      permission: {
        edit: "ask",
        bash: "ask",
        webfetch: "allow"
      }
    };
  }

  private getDefaultToolsForAgent(agentName: string): Record<string, boolean> {
    switch (agentName) {
      case "code-analyzer":
        return {
          read: true,
          grep: true,
          glob: true,
          write: false,
          edit: false,
          bash: false
        };
      case "file-analyzer":
        return {
          read: true,
          write: false,
          edit: false,
          bash: false
        };
      case "test-runner":
        return {
          bash: true,
          read: true,
          grep: true,
          write: false,
          edit: false
        };
      case "parallel-worker":
        return {
          bash: true,
          read: true,
          write: true,
          edit: true,
          grep: true,
          glob: true
        };
      default:
        return {
          read: true,
          write: false,
          edit: false,
          bash: false
        };
    }
  }

  private createOpencodeConfigFile() {
    return class OpencodeConfigFile extends ToolFile {
      constructor({ fileContent }: { fileContent: string }) {
        super({
          baseDir: ".",
          relativeDirPath: ".opencode",
          relativeFilePath: "opencode.json",
          fileContent: fileContent,
          validate: false
        });
      }

      getFileContent(): string {
        return super.getFileContent();
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
