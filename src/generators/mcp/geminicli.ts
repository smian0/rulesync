import type { RulesyncMcpConfig, RulesyncMcpServer } from "../../types/mcp.js";
import type { BaseMcpServer } from "../../types/mcp-config.js";
import {
  configWrappers,
  generateMcpConfig,
  generateMcpConfigurationFiles,
  type McpServerMapping,
} from "./shared-factory.js";

type GeminiServer = BaseMcpServer & {
  // Allow additional properties that might be present in the server config
  [key: string]: unknown;
};

export function generateGeminiCliMcp(config: RulesyncMcpConfig): string {
  return generateMcpConfig(config, {
    target: "geminicli",
    configPaths: [".gemini/settings.json"],
    serverTransform: (server: RulesyncMcpServer): McpServerMapping => {
      const geminiServer: GeminiServer = {};

      if (server.command) {
        geminiServer.command = server.command;
        if (server.args) geminiServer.args = server.args;
      } else if (server.url || server.httpUrl) {
        if (server.httpUrl) {
          geminiServer.httpUrl = server.httpUrl;
        } else if (server.url) {
          geminiServer.url = server.url;
        }
      }

      if (server.env) {
        geminiServer.env = server.env;
      }

      if (server.timeout !== undefined) {
        geminiServer.timeout = server.timeout;
      }

      if (server.trust !== undefined) {
        geminiServer.trust = server.trust;
      }

      return geminiServer;
    },
    configWrapper: configWrappers.mcpServers,
  });
}

export function generateGeminiCliMcpConfiguration(
  mcpServers: Record<string, RulesyncMcpServer>,
  baseDir: string = "",
): Array<{ filepath: string; content: string }> {
  return generateMcpConfigurationFiles(
    mcpServers,
    {
      target: "geminicli",
      configPaths: [".gemini/settings.json"],
      serverTransform: (server: RulesyncMcpServer): McpServerMapping => {
        const { targets: _, ...serverConfig } = server;
        const geminiServer: GeminiServer = { ...serverConfig };

        // Preserve environment variables as-is for Gemini CLI
        if (server.env) {
          geminiServer.env = server.env;
        }

        return geminiServer;
      },
      configWrapper: configWrappers.mcpServers,
    },
    baseDir,
  );
}
