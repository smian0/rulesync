import { RulesyncMcpConfig } from "../../types/mcp.js";

interface CursorConfig {
  mcpServers: Record<string, CursorServer>;
}

interface CursorServer {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  cwd?: string;
  type?: "sse" | "streamable-http";
}

export function generateCursorMcp(
  config: RulesyncMcpConfig,
  target: "global" | "project"
): string {
  const cursorConfig: CursorConfig = {
    mcpServers: {}
  };

  const shouldInclude = (serverName: string): boolean => {
    const toolConfig = config.tools?.cursor;
    if (!toolConfig) return true;
    
    if (target === "global" && toolConfig.global === false) return false;
    if (target === "project" && toolConfig.project === false) return false;
    
    return true;
  };

  for (const [serverName, server] of Object.entries(config.servers)) {
    if (!shouldInclude(serverName)) continue;
    
    const cursorServer: CursorServer = {};
    
    if (server.command) {
      cursorServer.command = server.command;
      if (server.args) cursorServer.args = server.args;
    } else if (server.url || server.httpUrl) {
      const url = server.httpUrl || server.url;
      if (url) {
        cursorServer.url = url;
      }
      if (server.httpUrl || server.transport === "http") {
        cursorServer.type = "streamable-http";
      } else if (server.transport === "sse" || server.type === "sse") {
        cursorServer.type = "sse";
      }
    }
    
    if (server.env) {
      cursorServer.env = server.env;
    }
    
    if (server.cwd) {
      cursorServer.cwd = server.cwd;
    }
    
    cursorConfig.mcpServers[serverName] = cursorServer;
  }
  
  return JSON.stringify(cursorConfig, null, 2);
}