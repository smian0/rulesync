import { join } from "node:path";
import matter from "gray-matter";
import type { ParsedRule, ToolTarget } from "../types/index.js";
import {
  parseClaudeConfiguration,
  parseCursorConfiguration,
  parseCopilotConfiguration,
  parseClineConfiguration,
  parseRooConfiguration,
} from "../parsers/index.js";
import { fileExists, writeFileContent } from "../utils/index.js";

export interface ImportOptions {
  tool: ToolTarget;
  baseDir?: string;
  rulesDir?: string;
  verbose?: boolean;
}

export interface ImportResult {
  success: boolean;
  rulesCreated: number;
  errors: string[];
}

export async function importConfiguration(options: ImportOptions): Promise<ImportResult> {
  const { tool, baseDir = process.cwd(), rulesDir = ".rulesync", verbose = false } = options;
  const errors: string[] = [];
  let rules: ParsedRule[] = [];

  if (verbose) {
    console.log(`Importing ${tool} configuration from ${baseDir}...`);
  }

  // Parse configuration based on tool
  try {
    switch (tool) {
      case "claude":
        const claudeResult = await parseClaudeConfiguration(baseDir);
        rules = claudeResult.rules;
        errors.push(...claudeResult.errors);
        break;
      case "cursor":
        const cursorResult = await parseCursorConfiguration(baseDir);
        rules = cursorResult.rules;
        errors.push(...cursorResult.errors);
        break;
      case "copilot":
        const copilotResult = await parseCopilotConfiguration(baseDir);
        rules = copilotResult.rules;
        errors.push(...copilotResult.errors);
        break;
      case "cline":
        const clineResult = await parseClineConfiguration(baseDir);
        rules = clineResult.rules;
        errors.push(...clineResult.errors);
        break;
      case "roo":
        const rooResult = await parseRooConfiguration(baseDir);
        rules = rooResult.rules;
        errors.push(...rooResult.errors);
        break;
      default:
        errors.push(`Unsupported tool: ${tool}`);
        return { success: false, rulesCreated: 0, errors };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Failed to parse ${tool} configuration: ${errorMessage}`);
    return { success: false, rulesCreated: 0, errors };
  }

  if (rules.length === 0) {
    return { success: false, rulesCreated: 0, errors };
  }

  // Ensure .rulesync directory exists
  const rulesDirPath = join(baseDir, rulesDir);
  try {
    const { mkdir } = await import("node:fs/promises");
    await mkdir(rulesDirPath, { recursive: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Failed to create rules directory: ${errorMessage}`);
    return { success: false, rulesCreated: 0, errors };
  }

  // Write rule files
  let rulesCreated = 0;
  for (const rule of rules) {
    try {
      const filename = await generateUniqueFilename(rulesDirPath, rule.filename);
      const filePath = join(rulesDirPath, `${filename}.md`);
      const content = generateRuleFileContent(rule);
      
      await writeFileContent(filePath, content);
      rulesCreated++;
      
      if (verbose) {
        console.log(`✅ Created rule file: ${filePath}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to create rule file for ${rule.filename}: ${errorMessage}`);
    }
  }

  return {
    success: rulesCreated > 0,
    rulesCreated,
    errors
  };
}

function generateRuleFileContent(rule: ParsedRule): string {
  const frontmatter = matter.stringify("", rule.frontmatter);
  const frontmatterOnly = frontmatter.split("---\n")[1] + "---\n";
  return frontmatterOnly + rule.content;
}

async function generateUniqueFilename(rulesDir: string, baseFilename: string): Promise<string> {
  let filename = baseFilename;
  let counter = 1;
  
  while (await fileExists(join(rulesDir, `${filename}.md`))) {
    filename = `${baseFilename}-${counter}`;
    counter++;
  }
  
  return filename;
}