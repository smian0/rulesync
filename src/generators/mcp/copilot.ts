import { RulesyncMcpConfig, RulesyncMcpServer } from "../../types/mcp.js";

interface CopilotEditorConfig {
  servers: Record<string, CopilotServer>;
  inputs?: CopilotInput[];
}

interface CopilotCodingAgentConfig {
  mcpServers: Record<string, CopilotServer>;
}

interface CopilotServer {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  tools?: string[];
}

interface CopilotInput {
  id: string;
  type: "password";
  description: string;
}

export function generateCopilotMcp(
  config: RulesyncMcpConfig,
  target: "codingAgent" | "editor"
): string {
  const shouldInclude = (server: RulesyncMcpServer): boolean => {
    const targets = server.rulesyncTargets;
    
    // If no targets or empty array, include in all tools
    if (!targets || targets.length === 0) return true;
    
    // If targets is ['*'], include in all tools
    if (targets.length === 1 && targets[0] === '*') return true;
    
    // Otherwise check if 'copilot' is in the targets array
    return targets.includes('copilot');
  };

  const servers: Record<string, CopilotServer> = {};
  const inputs: CopilotInput[] = [];
  const inputMap = new Map<string, string>();

  for (const [serverName, server] of Object.entries(config.mcpServers)) {
    if (!shouldInclude(server)) continue;
    
    const copilotServer: CopilotServer = {};
    
    if (server.command) {
      copilotServer.command = server.command;
      if (server.args) copilotServer.args = server.args;
    } else if (server.url || server.httpUrl) {
      const url = server.httpUrl || server.url;
      if (url) {
        copilotServer.url = url;
      }
    }
    
    if (server.env) {
      copilotServer.env = {};
      for (const [key, value] of Object.entries(server.env)) {
        if (target === "editor" && value.includes("SECRET")) {
          const inputId = `${serverName}_${key}`;
          inputMap.set(inputId, value);
          copilotServer.env[key] = `\${input:${inputId}}`;
          inputs.push({
            id: inputId,
            type: "password",
            description: `${key} for ${serverName}`
          });
        } else {
          copilotServer.env[key] = value;
        }
      }
    }
    
    if (server.tools) {
      copilotServer.tools = server.tools;
    } else if (server.alwaysAllow) {
      copilotServer.tools = server.alwaysAllow;
    }
    
    servers[serverName] = copilotServer;
  }
  
  if (target === "codingAgent") {
    const config: CopilotCodingAgentConfig = { mcpServers: servers };
    return JSON.stringify(config, null, 2);
  } else {
    const config: CopilotEditorConfig = { servers };
    if (inputs.length > 0) {
      config.inputs = inputs;
    }
    return JSON.stringify(config, null, 2);
  }
}

export function generateCopilotMcpConfiguration(
  mcpServers: Record<string, any>,
  baseDir: string = ""
): Array<{ filepath: string; content: string }> {
  const configs: Array<{ filepath: string; content: string }> = [];
  
  // Filter servers for copilot
  const copilotServers: Record<string, any> = {};
  for (const [serverName, server] of Object.entries(mcpServers)) {
    const targets = server.rulesyncTargets;
    if (!targets || targets.includes("*") || targets.includes("copilot")) {
      const { rulesyncTargets, ...serverConfig } = server;
      copilotServers[serverName] = serverConfig;
    }
  }
  
  // Always generate configs even if empty
  
  // Generate .github/copilot/mcp.json
  const editorConfig = {
    servers: copilotServers
  };
  configs.push({
    filepath: baseDir ? `${baseDir}/.github/copilot/mcp.json` : ".github/copilot/mcp.json",
    content: JSON.stringify(editorConfig, null, 2) + "\n"
  });
  
  // Generate .github/copilot/copilot-codingagent-mcp.json
  const codingAgentConfig = {
    mcpServers: copilotServers
  };
  configs.push({
    filepath: baseDir ? `${baseDir}/.github/copilot/copilot-codingagent-mcp.json` : ".github/copilot/copilot-codingagent-mcp.json",
    content: JSON.stringify(codingAgentConfig, null, 2) + "\n"
  });
  
  return configs;
}