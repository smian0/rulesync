#!/usr/bin/env node

import { Command } from "commander";
import { initCommand, generateCommand, validateCommand, statusCommand, watchCommand } from "./commands/index.js";

const program = new Command();

program
  .name("ai-rules")
  .description("Unified AI rules management CLI tool")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize ai-rules in current directory")
  .action(initCommand);

program
  .command("generate")
  .description("Generate configuration files for AI tools")
  .option("--copilot", "Generate only for GitHub Copilot")
  .option("--cursor", "Generate only for Cursor")
  .option("--cline", "Generate only for Cline")
  .option("-v, --verbose", "Verbose output")
  .action(async (options) => {
    const tools = [];
    if (options.copilot) tools.push("copilot");
    if (options.cursor) tools.push("cursor");
    if (options.cline) tools.push("cline");
    
    await generateCommand({
      tools: tools.length > 0 ? tools : undefined,
      verbose: options.verbose,
    });
  });

program
  .command("validate")
  .description("Validate ai-rules configuration")
  .action(validateCommand);

program
  .command("status")
  .description("Show current status of ai-rules")
  .action(statusCommand);

program
  .command("watch")
  .description("Watch for changes and auto-generate configurations")
  .action(watchCommand);

program.parse();