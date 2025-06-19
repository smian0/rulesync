import { generateClaudeConfig } from "../generators/claude.js";
import { generateClineConfig } from "../generators/cline.js";
import { generateCopilotConfig } from "../generators/copilot.js";
import { generateCursorConfig } from "../generators/cursor.js";
import { generateRooConfig } from "../generators/roo.js";
import type { Config, GeneratedOutput, ParsedRule, ToolTarget } from "../types/index.js";
import { resolveTargets } from "../utils/index.js";

export async function generateConfigurations(
  rules: ParsedRule[],
  config: Config,
  targetTools?: ToolTarget[]
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];
  const toolsToGenerate = targetTools || config.defaultTargets;

  for (const tool of toolsToGenerate) {
    const relevantRules = filterRulesForTool(rules, tool, config);

    if (relevantRules.length === 0) {
      console.warn(`No rules found for tool: ${tool}`);
      continue;
    }

    const toolOutputs = await generateForTool(tool, relevantRules, config);
    if (toolOutputs) {
      outputs.push(...toolOutputs);
    }
  }

  return outputs;
}

function filterRulesForTool(rules: ParsedRule[], tool: ToolTarget, config: Config): ParsedRule[] {
  return rules.filter((rule) => {
    const targets = resolveTargets(rule.frontmatter.targets, config);
    return targets.includes(tool);
  });
}

async function generateForTool(
  tool: ToolTarget,
  rules: ParsedRule[],
  config: Config
): Promise<GeneratedOutput[] | null> {
  switch (tool) {
    case "copilot":
      return generateCopilotConfig(rules, config);
    case "cursor":
      return generateCursorConfig(rules, config);
    case "cline":
      return generateClineConfig(rules, config);
    case "claude":
      return await generateClaudeConfig(rules, config);
    case "roo":
      return generateRooConfig(rules, config);
    default:
      console.warn(`Unknown tool: ${tool}`);
      return null;
  }
}
