import { generateConfigurations, parseRulesFromDirectory } from "../../core/index.js";
import type { ToolTarget } from "../../types/index.js";
import {
  fileExists,
  getDefaultConfig,
  removeClaudeGeneratedFiles,
  removeDirectory,
  writeFileContent,
} from "../../utils/index.js";

export interface GenerateOptions {
  tools?: ToolTarget[];
  verbose?: boolean;
  delete?: boolean;
  baseDirs?: string[];
}

export async function generateCommand(options: GenerateOptions = {}): Promise<void> {
  const config = getDefaultConfig();
  const baseDirs = options.baseDirs || [process.cwd()];

  console.log("Generating configuration files...");

  // Check if .rulesync directory exists
  if (!(await fileExists(config.aiRulesDir))) {
    console.error("❌ .rulesync directory not found. Run 'rulesync init' first.");
    process.exit(1);
  }

  try {
    // Parse rules
    if (options.verbose) {
      console.log(`Parsing rules from ${config.aiRulesDir}...`);
    }
    const rules = await parseRulesFromDirectory(config.aiRulesDir);

    if (rules.length === 0) {
      console.warn("⚠️  No rules found in .rulesync directory");
      return;
    }

    if (options.verbose) {
      console.log(`Found ${rules.length} rule(s)`);
      console.log(`Base directories: ${baseDirs.join(", ")}`);
    }

    // Delete existing output directories if --delete option is specified
    if (options.delete) {
      if (options.verbose) {
        console.log("Deleting existing output directories...");
      }

      const targetTools = options.tools || config.defaultTargets;
      const deleteTasks = [];

      for (const tool of targetTools) {
        switch (tool) {
          case "copilot":
            deleteTasks.push(removeDirectory(config.outputPaths.copilot));
            break;
          case "cursor":
            deleteTasks.push(removeDirectory(config.outputPaths.cursor));
            break;
          case "cline":
            deleteTasks.push(removeDirectory(config.outputPaths.cline));
            break;
          case "claudecode":
            // Use safe deletion for Claude Code files only
            deleteTasks.push(removeClaudeGeneratedFiles());
            break;
          case "roo":
            deleteTasks.push(removeDirectory(config.outputPaths.roo));
            break;
          case "geminicli":
            deleteTasks.push(removeDirectory(config.outputPaths.geminicli));
            break;
        }
      }

      await Promise.all(deleteTasks);

      if (options.verbose) {
        console.log("Deleted existing output directories");
      }
    }

    // Generate configurations for each base directory
    let totalOutputs = 0;
    for (const baseDir of baseDirs) {
      if (options.verbose) {
        console.log(`\nGenerating configurations for base directory: ${baseDir}`);
      }

      const outputs = await generateConfigurations(rules, config, options.tools, baseDir);

      if (outputs.length === 0) {
        if (options.verbose) {
          console.warn(`⚠️  No configurations generated for ${baseDir}`);
        }
        continue;
      }

      // Write output files
      for (const output of outputs) {
        await writeFileContent(output.filepath, output.content);
        console.log(`✅ Generated ${output.tool} configuration: ${output.filepath}`);
      }

      totalOutputs += outputs.length;
    }

    if (totalOutputs === 0) {
      console.warn("⚠️  No configurations generated");
      return;
    }

    console.log(`\n🎉 Successfully generated ${totalOutputs} configuration file(s)!`);
  } catch (error) {
    console.error("❌ Failed to generate configurations:", error);
    process.exit(1);
  }
}
