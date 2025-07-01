import { RulesyncTargetsSchema, ToolTargetSchema } from "../schemas/mcp.js";
import type { RulesyncMcpServer } from "../types/mcp.js";
import type { ToolTarget } from "../types/rules.js";

export function shouldIncludeServer(server: RulesyncMcpServer, targetTool: ToolTarget): boolean {
  // If no rulesyncTargets specified, include in all tools
  if (!server.rulesyncTargets || server.rulesyncTargets.length === 0) {
    return true;
  }

  // Parse and validate rulesyncTargets
  const parsedTargets = RulesyncTargetsSchema.parse(server.rulesyncTargets);

  // Check if it's ["*"]
  if (parsedTargets.length === 1 && parsedTargets[0] === "*") {
    return true;
  }

  // Validate that targetTool is a valid ToolTarget
  const validatedTool = ToolTargetSchema.parse(targetTool);

  // Now check if it's included
  for (const target of parsedTargets) {
    if (target === validatedTool) {
      return true;
    }
  }

  return false;
}
