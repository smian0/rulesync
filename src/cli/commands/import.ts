import { importConfiguration } from "../../core/importer.js";
import type { ToolTarget } from "../../types/index.js";

export interface ImportOptions {
  claudecode?: boolean;
  cursor?: boolean;
  copilot?: boolean;
  cline?: boolean;
  roo?: boolean;
  geminicli?: boolean;
  verbose?: boolean;
}

export async function importCommand(options: ImportOptions = {}): Promise<void> {
  const tools: ToolTarget[] = [];

  // Collect selected tools
  if (options.claudecode) tools.push("claudecode");
  if (options.cursor) tools.push("cursor");
  if (options.copilot) tools.push("copilot");
  if (options.cline) tools.push("cline");
  if (options.roo) tools.push("roo");
  if (options.geminicli) tools.push("geminicli");

  // Validate that at least one tool is selected
  if (tools.length === 0) {
    console.error(
      "❌ Please specify at least one tool to import from (--claudecode, --cursor, --copilot, --cline, --roo, --geminicli)"
    );
    process.exit(1);
  }

  console.log("Importing configuration files...");

  let totalRulesCreated = 0;
  const allErrors: string[] = [];

  // Import from each selected tool
  for (const tool of tools) {
    if (options.verbose) {
      console.log(`\nImporting from ${tool}...`);
    }

    try {
      const result = await importConfiguration({
        tool,
        verbose: options.verbose ?? false,
      });

      if (result.success) {
        console.log(`✅ Imported ${result.rulesCreated} rule(s) from ${tool}`);
        totalRulesCreated += result.rulesCreated;
      } else if (result.errors.length > 0) {
        console.warn(`⚠️  Failed to import from ${tool}: ${result.errors[0]}`);
        if (options.verbose) {
          allErrors.push(...result.errors);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error importing from ${tool}: ${errorMessage}`);
      allErrors.push(`${tool}: ${errorMessage}`);
    }
  }

  // Show summary
  if (totalRulesCreated > 0) {
    console.log(`\n🎉 Successfully imported ${totalRulesCreated} rule(s) total!`);
    console.log("You can now run 'rulesync generate' to create tool-specific configurations.");
  } else {
    console.warn(
      "\n⚠️  No rules were imported. Please check that configuration files exist for the selected tools."
    );
  }

  // Show detailed errors if verbose
  if (options.verbose && allErrors.length > 0) {
    console.log("\nDetailed errors:");
    for (const error of allErrors) {
      console.log(`  - ${error}`);
    }
  }
}
