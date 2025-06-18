import { generateConfigurations, parseRulesFromDirectory } from "../../core/index.js";
import type { ToolTarget } from "../../types/index.js";
import { fileExists, getDefaultConfig, writeFileContent } from "../../utils/index.js";

export interface GenerateOptions {
  tools?: ToolTarget[];
  verbose?: boolean;
}

export async function generateCommand(options: GenerateOptions = {}): Promise<void> {
  const config = getDefaultConfig();

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
    }

    // Generate configurations
    const outputs = await generateConfigurations(rules, config, options.tools);

    if (outputs.length === 0) {
      console.warn("⚠️  No configurations generated");
      return;
    }

    // Write output files
    for (const output of outputs) {
      await writeFileContent(output.filepath, output.content);
      console.log(`✅ Generated ${output.tool} configuration: ${output.filepath}`);
    }

    console.log(`\n🎉 Successfully generated ${outputs.length} configuration file(s)!`);
  } catch (error) {
    console.error("❌ Failed to generate configurations:", error);
    process.exit(1);
  }
}
