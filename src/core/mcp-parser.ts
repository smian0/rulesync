import fs from "fs";
import path from "path";
import type { RulesyncMcpConfig } from "../types/mcp.js";

export function parseMcpConfig(projectRoot: string): RulesyncMcpConfig | null {
  const mcpPath = path.join(projectRoot, ".rulesync", ".mcp.json");

  if (!fs.existsSync(mcpPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(mcpPath, "utf-8");
    const rawConfig = JSON.parse(content) as any;

    // Handle legacy 'servers' field and migrate to 'mcpServers'
    if (rawConfig.servers && !rawConfig.mcpServers) {
      rawConfig.mcpServers = rawConfig.servers;
      delete rawConfig.servers;
    }

    if (!rawConfig.mcpServers || typeof rawConfig.mcpServers !== "object") {
      throw new Error("Invalid mcp.json: 'mcpServers' field must be an object");
    }

    // Remove deprecated 'tools' field if present
    if (rawConfig.tools) {
      delete rawConfig.tools;
    }

    return rawConfig as RulesyncMcpConfig;
  } catch (error) {
    throw new Error(
      `Failed to parse mcp.json: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
