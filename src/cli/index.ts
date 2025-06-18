#!/usr/bin/env node

import { Command } from "commander";
import type { ToolTarget } from "../types/index.js";
import {
  generateCommand,
  initCommand,
  statusCommand,
  validateCommand,
  watchCommand,
} from "./commands/index.js";

const program = new Command();

program.name("rulesync").description("Unified AI rules management CLI tool").version("0.1.0");

program.command("init").description("Initialize rulesync in current directory").action(initCommand);

program
  .command("generate")
  .description("Generate configuration files for AI tools")
  .option("--copilot", "Generate only for GitHub Copilot")
  .option("--cursor", "Generate only for Cursor")
  .option("--cline", "Generate only for Cline")
  .option("-v, --verbose", "Verbose output")
  .action(async (options) => {
    const tools: ToolTarget[] = [];
    if (options.copilot) tools.push("copilot");
    if (options.cursor) tools.push("cursor");
    if (options.cline) tools.push("cline");

    const generateOptions: { verbose?: boolean; tools?: ToolTarget[] } = {
      verbose: options.verbose,
    };

    if (tools.length > 0) {
      generateOptions.tools = tools;
    }

    await generateCommand(generateOptions);
  });

program.command("validate").description("Validate rulesync configuration").action(validateCommand);

program.command("status").description("Show current status of rulesync").action(statusCommand);

program
  .command("watch")
  .description("Watch for changes and auto-generate configurations")
  .action(watchCommand);

program.parse();
