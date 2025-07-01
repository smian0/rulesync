import fs from "fs";
import path from "path";
import { RulesyncMcpConfig } from "../types/mcp.js";

export function parseMcpConfig(projectRoot: string): RulesyncMcpConfig | null {
  const mcpPath = path.join(projectRoot, ".rulesync", ".mcp.json");
  
  if (!fs.existsSync(mcpPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(mcpPath, "utf-8");
    const config = JSON.parse(content) as RulesyncMcpConfig;
    
    if (!config.servers || typeof config.servers !== "object") {
      throw new Error("Invalid mcp.json: 'servers' field must be an object");
    }
    
    return config;
  } catch (error) {
    throw new Error(`Failed to parse mcp.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}