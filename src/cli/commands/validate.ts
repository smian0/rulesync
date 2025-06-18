import { parseRulesFromDirectory, validateRules } from "../../core/index.js";
import { fileExists, getDefaultConfig } from "../../utils/index.js";

export async function validateCommand(): Promise<void> {
  const config = getDefaultConfig();

  console.log("Validating rulesync configuration...");

  // Check if .rulesync directory exists
  if (!(await fileExists(config.aiRulesDir))) {
    console.error("❌ .rulesync directory not found. Run 'rulesync init' first.");
    process.exit(1);
  }

  try {
    // Parse rules
    const rules = await parseRulesFromDirectory(config.aiRulesDir);

    if (rules.length === 0) {
      console.warn("⚠️  No rules found in .rulesync directory");
      return;
    }

    console.log(`Found ${rules.length} rule(s), validating...`);

    // Validate rules
    const validation = await validateRules(rules);

    // Display results
    if (validation.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      for (const warning of validation.warnings) {
        console.log(`  - ${warning}`);
      }
    }

    if (validation.errors.length > 0) {
      console.log("\n❌ Errors:");
      for (const error of validation.errors) {
        console.log(`  - ${error}`);
      }
    }

    if (validation.isValid) {
      console.log("\n✅ All rules are valid!");
    } else {
      console.log(`\n❌ Validation failed with ${validation.errors.length} error(s)`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Failed to validate rules:", error);
    process.exit(1);
  }
}
