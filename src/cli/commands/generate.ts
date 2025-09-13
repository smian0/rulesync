import { intersection } from "es-toolkit";
import { CommandsProcessor } from "../../commands/commands-processor.js";
import { ConfigResolver, type ConfigResolverResolveParams } from "../../config/config-resolver.js";
import { IgnoreProcessor } from "../../ignore/ignore-processor.js";
import { McpProcessor, type McpProcessorToolTarget } from "../../mcp/mcp-processor.js";
import { RulesProcessor } from "../../rules/rules-processor.js";
import { SubagentsProcessor } from "../../subagents/subagents-processor.js";
import { ContextProcessor } from "../../content/context-processor.js";
import { EpicsProcessor } from "../../content/epics-processor.js";
import { PRDsProcessor } from "../../content/prds-processor.js";
import { TechnicalDesignProcessor } from "../../content/technical-design-processor.js";
import { AdditionalRulesProcessor } from "../../content/additional-rules-processor.js";
import { UniversalClaudeProcessor } from "../../content/universal-claude-processor.js";
import { fileExists } from "../../utils/file.js";
import { logger } from "../../utils/logger.js";

export type GenerateOptions = ConfigResolverResolveParams;

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const config = await ConfigResolver.resolve(options);

  // Set logger verbosity based on config
  logger.setVerbose(config.getVerbose());

  logger.info("Generating files...");

  // Check if .rulesync directory exists
  if (!(await fileExists(".rulesync"))) {
    logger.error("❌ .rulesync directory not found. Run 'rulesync init' first.");
    process.exit(1);
  }

  logger.info(`Base directories: ${config.getBaseDirs().join(", ")}`);
  // Generate rule files (rules feature)
  let totalRulesOutputs = 0;
  if (config.getFeatures().includes("rules")) {
    logger.info("Generating rule files...");
    for (const baseDir of config.getBaseDirs()) {
      for (const toolTarget of intersection(config.getTargets(), RulesProcessor.getToolTargets())) {
        const processor = new RulesProcessor({
          baseDir: baseDir,
          toolTarget: toolTarget,
          simulateCommands: config.getExperimentalSimulateCommands(),
          simulateSubagents: config.getExperimentalSimulateSubagents(),
        });

        if (config.getDelete()) {
          const oldToolFiles = await processor.loadToolFiles();
          await processor.removeAiFiles(oldToolFiles);
        }

        let rulesyncFiles = await processor.loadRulesyncFiles();
        if (rulesyncFiles.length === 0) {
          rulesyncFiles = await processor.loadRulesyncFilesLegacy();
        }

        const toolFiles = await processor.convertRulesyncFilesToToolFiles(rulesyncFiles);
        const writtenCount = await processor.writeAiFiles(toolFiles);
        totalRulesOutputs += writtenCount;
        logger.success(`Generated ${writtenCount} ${toolTarget} rule(s) in ${baseDir}`);
      }
    }
  } else {
    logger.info("Skipping rule generation (not in --features)");
  }

  // Generate MCP configurations (mcp feature)
  let totalMcpOutputs = 0;
  if (config.getFeatures().includes("mcp")) {
    logger.info("Generating MCP files...");

    // Check which targets support MCP
    const supportedMcpTargets: McpProcessorToolTarget[] = [
      "amazonqcli",
      "claudecode",
      "cline",
      "copilot",
      "cursor",
      "roo",
    ];
    const mcpSupportedTargets = config
      .getTargets()
      .filter((target): target is McpProcessorToolTarget => {
        return supportedMcpTargets.some((supportedTarget) => supportedTarget === target);
      });

    for (const baseDir of config.getBaseDirs()) {
      for (const toolTarget of intersection(mcpSupportedTargets, McpProcessor.getToolTargets())) {
        const processor = new McpProcessor({
          baseDir: baseDir,
          toolTarget: toolTarget,
        });

        if (config.getDelete()) {
          const oldToolFiles = await processor.loadToolFiles();
          await processor.removeAiFiles(oldToolFiles);
        }

        const rulesyncFiles = await processor.loadRulesyncFiles();
        const toolFiles = await processor.convertRulesyncFilesToToolFiles(rulesyncFiles);
        const writtenCount = await processor.writeAiFiles(toolFiles);
        totalMcpOutputs += writtenCount;
        logger.success(
          `Generated ${writtenCount} ${toolTarget} MCP configuration(s) in ${baseDir}`,
        );
      }
    }
  } else {
    logger.info("Skipping MCP configuration generation (not in --features)");
  }

  // Generate command files (commands feature)
  let totalCommandOutputs = 0;
  if (config.getFeatures().includes("commands")) {
    logger.info("Generating command files...");

    for (const baseDir of config.getBaseDirs()) {
      for (const toolTarget of intersection(
        config.getTargets(),
        CommandsProcessor.getToolTargets({
          includeSimulated: config.getExperimentalSimulateCommands(),
        }),
      )) {
        const processor = new CommandsProcessor({
          baseDir: baseDir,
          toolTarget: toolTarget,
        });

        if (config.getDelete()) {
          const oldToolFiles = await processor.loadToolFiles();
          await processor.removeAiFiles(oldToolFiles);
        }

        const rulesyncFiles = await processor.loadRulesyncFiles();
        const toolFiles = await processor.convertRulesyncFilesToToolFiles(rulesyncFiles);
        const writtenCount = await processor.writeAiFiles(toolFiles);
        totalCommandOutputs += writtenCount;
        logger.success(`Generated ${writtenCount} ${toolTarget} command(s) in ${baseDir}`);
      }
    }
  } else {
    logger.info("Skipping command file generation (not in --features)");
  }

  // Generate ignore files (ignore feature)
  let totalIgnoreOutputs = 0;
  if (config.getFeatures().includes("ignore")) {
    logger.info("Generating ignore files...");

    for (const toolTarget of intersection(config.getTargets(), IgnoreProcessor.getToolTargets())) {
      for (const baseDir of config.getBaseDirs()) {
        try {
          const processor = new IgnoreProcessor({
            baseDir: baseDir === process.cwd() ? "." : baseDir,
            toolTarget,
          });

          if (config.getDelete()) {
            const oldToolFiles = await processor.loadToolFiles();
            await processor.removeAiFiles(oldToolFiles);
          }

          const rulesyncFiles = await processor.loadRulesyncFiles();
          if (rulesyncFiles.length > 0) {
            const toolFiles = await processor.convertRulesyncFilesToToolFiles(rulesyncFiles);
            const writtenCount = await processor.writeAiFiles(toolFiles);
            totalIgnoreOutputs += writtenCount;
            logger.success(`Generated ${writtenCount} ${toolTarget} ignore file(s) in ${baseDir}`);
          }
        } catch (error) {
          logger.warn(
            `Failed to generate ${toolTarget} ignore files for ${baseDir}:`,
            error instanceof Error ? error.message : String(error),
          );
          continue;
        }
      }
    }
  }

  // Generate subagent files (subagents feature)
  let totalSubagentOutputs = 0;
  if (config.getFeatures().includes("subagents")) {
    logger.info("Generating subagent files...");
    for (const baseDir of config.getBaseDirs()) {
      for (const toolTarget of intersection(
        config.getTargets(),
        SubagentsProcessor.getToolTargets({
          includeSimulated: config.getExperimentalSimulateSubagents(),
        }),
      )) {
        const processor = new SubagentsProcessor({
          baseDir: baseDir,
          toolTarget: toolTarget,
        });

        if (config.getDelete()) {
          const oldToolFiles = await processor.loadToolFiles();
          await processor.removeAiFiles(oldToolFiles);
        }

        const rulesyncFiles = await processor.loadRulesyncFiles();
        const toolFiles = await processor.convertRulesyncFilesToToolFiles(rulesyncFiles);
        const writtenCount = await processor.writeAiFiles(toolFiles);
        totalSubagentOutputs += writtenCount;
        logger.success(`Generated ${writtenCount} ${toolTarget} subagent(s) in ${baseDir}`);
      }
    }
  }

  // Generate context files
  let totalContextOutputs = 0;
  if (config.getFeatures().includes("context")) {
    logger.info("Generating context files...");

    for (const baseDir of config.getBaseDirs()) {
      for (const toolTarget of intersection(config.getTargets(), ContextProcessor.getToolTargets())) {
        const processor = new ContextProcessor({
          baseDir: baseDir,
          toolTarget: toolTarget,
        });

        if (config.getDelete()) {
          const oldToolFiles = await processor.loadToolFiles();
          await processor.removeAiFiles(oldToolFiles);
        }

        const rulesyncFiles = await processor.loadRulesyncFiles();
        const toolFiles = await processor.convertRulesyncFilesToToolFiles(rulesyncFiles);
        const writtenCount = await processor.writeAiFiles(toolFiles);
        totalContextOutputs += writtenCount;
        logger.success(`Generated ${writtenCount} ${toolTarget} context file(s) in ${baseDir}`);
      }
    }
  }

  // Generate epics files
  let totalEpicsOutputs = 0;
  if (config.getFeatures().includes("epics")) {
    logger.info("Generating epics files...");

    for (const baseDir of config.getBaseDirs()) {
      for (const toolTarget of intersection(config.getTargets(), EpicsProcessor.getToolTargets())) {
        const processor = new EpicsProcessor({
          baseDir: baseDir,
          toolTarget: toolTarget,
        });

        if (config.getDelete()) {
          const oldToolFiles = await processor.loadToolFiles();
          await processor.removeAiFiles(oldToolFiles);
        }

        const rulesyncFiles = await processor.loadRulesyncFiles();
        const toolFiles = await processor.convertRulesyncFilesToToolFiles(rulesyncFiles);
        const writtenCount = await processor.writeAiFiles(toolFiles);
        totalEpicsOutputs += writtenCount;
        logger.success(`Generated ${writtenCount} ${toolTarget} epics file(s) in ${baseDir}`);
      }
    }
  }

  // Generate PRD files
  let totalPRDOutputs = 0;
  if (config.getFeatures().includes("prds")) {
    logger.info("Generating PRD files...");

    for (const baseDir of config.getBaseDirs()) {
      for (const toolTarget of intersection(config.getTargets(), PRDsProcessor.getToolTargets())) {
        const processor = new PRDsProcessor({
          baseDir: baseDir,
          toolTarget: toolTarget,
        });

        if (config.getDelete()) {
          const oldToolFiles = await processor.loadToolFiles();
          await processor.removeAiFiles(oldToolFiles);
        }

        const rulesyncFiles = await processor.loadRulesyncFiles();
        const toolFiles = await processor.convertRulesyncFilesToToolFiles(rulesyncFiles);
        const writtenCount = await processor.writeAiFiles(toolFiles);
        totalPRDOutputs += writtenCount;
        logger.success(`Generated ${writtenCount} ${toolTarget} PRD file(s) in ${baseDir}`);
      }
    }
  }

  // Generate technical-design files
  let totalTechnicalDesignOutputs = 0;
  if (config.getFeatures().includes("technical-design")) {
    logger.info("Generating technical-design files...");

    for (const baseDir of config.getBaseDirs()) {
      for (const toolTarget of intersection(config.getTargets(), TechnicalDesignProcessor.getToolTargets())) {
        const processor = new TechnicalDesignProcessor({
          baseDir: baseDir,
          toolTarget: toolTarget,
        });

        if (config.getDelete()) {
          const oldToolFiles = await processor.loadToolFiles();
          await processor.removeAiFiles(oldToolFiles);
        }

        const rulesyncFiles = await processor.loadRulesyncFiles();
        const toolFiles = await processor.convertRulesyncFilesToToolFiles(rulesyncFiles);
        const writtenCount = await processor.writeAiFiles(toolFiles);
        totalTechnicalDesignOutputs += writtenCount;
        logger.success(`Generated ${writtenCount} ${toolTarget} technical-design file(s) in ${baseDir}`);
      }
    }
  }

  // Generate additional-rules files
  let totalAdditionalRulesOutputs = 0;
  if (config.getFeatures().includes("additional-rules")) {
    logger.info("Generating additional-rules files...");

    for (const baseDir of config.getBaseDirs()) {
      for (const toolTarget of intersection(config.getTargets(), AdditionalRulesProcessor.getToolTargets())) {
        const processor = new AdditionalRulesProcessor({
          baseDir: baseDir,
          toolTarget: toolTarget,
        });

        if (config.getDelete()) {
          const oldToolFiles = await processor.loadToolFiles();
          await processor.removeAiFiles(oldToolFiles);
        }

        const rulesyncFiles = await processor.loadRulesyncFiles();
        const toolFiles = await processor.convertRulesyncFilesToToolFiles(rulesyncFiles);
        const writtenCount = await processor.writeAiFiles(toolFiles);
        totalAdditionalRulesOutputs += writtenCount;
        logger.success(`Generated ${writtenCount} ${toolTarget} additional-rules file(s) in ${baseDir}`);
      }
    }
  }

  // Universal Claude Processing - handles ALL .claude content automatically
  let totalUniversalOutputs = 0;
  if (config.getFeatures().includes("universal") || config.getFeatures().includes("all-content")) {
    logger.info("Universal processing: syncing ALL .claude content...");

    for (const baseDir of config.getBaseDirs()) {
      for (const toolTarget of intersection(config.getTargets(), UniversalClaudeProcessor.getToolTargets())) {
        const processor = new UniversalClaudeProcessor({
          baseDir: baseDir,
          toolTarget: toolTarget,
        });

        if (config.getDelete()) {
          // Clear existing files before universal sync
          logger.info("Clearing existing generated files for universal sync...");
        }

        // Two-phase processing: read from preserved .rulesync/content structure
        const rulesyncFiles = await processor.loadRulesyncFiles();
        const toolFiles = await processor.convertRulesyncFilesToToolFiles(rulesyncFiles);
        const writtenCount = await processor.writeAiFiles(toolFiles);
        totalUniversalOutputs += writtenCount;
        logger.success(`Universal sync: Generated ${writtenCount} ${toolTarget} files from ALL .claude content in ${baseDir}`);
      }
    }
  }

  // Check if any features generated content
  const totalGenerated =
    totalRulesOutputs +
    totalMcpOutputs +
    totalCommandOutputs +
    totalIgnoreOutputs +
    totalSubagentOutputs +
    totalContextOutputs +
    totalEpicsOutputs +
    totalPRDOutputs +
    totalTechnicalDesignOutputs +
    totalAdditionalRulesOutputs +
    totalUniversalOutputs;
  if (totalGenerated === 0) {
    const enabledFeatures = config.getFeatures().join(", ");
    logger.warn(`⚠️  No files generated for enabled features: ${enabledFeatures}`);
    return;
  }

  // Final success message
  if (totalGenerated > 0) {
    const parts = [];
    if (totalRulesOutputs > 0) parts.push(`${totalRulesOutputs} rules`);
    if (totalIgnoreOutputs > 0) parts.push(`${totalIgnoreOutputs} ignore files`);
    if (totalMcpOutputs > 0) parts.push(`${totalMcpOutputs} MCP files`);
    if (totalCommandOutputs > 0) parts.push(`${totalCommandOutputs} commands`);
    if (totalSubagentOutputs > 0) parts.push(`${totalSubagentOutputs} subagents`);
    if (totalContextOutputs > 0) parts.push(`${totalContextOutputs} context files`);
    if (totalEpicsOutputs > 0) parts.push(`${totalEpicsOutputs} epics files`);
    if (totalPRDOutputs > 0) parts.push(`${totalPRDOutputs} PRD files`);
    if (totalTechnicalDesignOutputs > 0) parts.push(`${totalTechnicalDesignOutputs} technical-design files`);
    if (totalAdditionalRulesOutputs > 0) parts.push(`${totalAdditionalRulesOutputs} additional-rules files`);
    if (totalUniversalOutputs > 0) parts.push(`${totalUniversalOutputs} universal files`);

    logger.success(`🎉 All done! Generated ${totalGenerated} file(s) total (${parts.join(" + ")})`);
  }
}
