import type { RulesyncMcpConfig, RulesyncMcpServer } from "../../types/mcp.js";
import type { BaseMcpServer } from "../../types/mcp-config.js";
import {
  configWrappers,
  generateMcpConfig,
  generateMcpConfigurationFiles,
  type McpServerMapping,
} from "./shared-factory.js";

type CursorServer = BaseMcpServer & {
  type?: "sse" | "streamable-http";
  [key: string]: unknown;
};

export function generateCursorMcp(config: RulesyncMcpConfig): string {
  return generateMcpConfig(config, {
    target: "cursor",
    configPaths: [".cursor/mcp.json"],
    serverTransform: (server: RulesyncMcpServer): McpServerMapping => {
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

      return cursorServer;
    },
    configWrapper: configWrappers.mcpServers,
  });
}

export function generateCursorMcpConfiguration(
  mcpServers: Record<string, RulesyncMcpServer>,
  baseDir: string = "",
): Array<{ filepath: string; content: string }> {
  return generateMcpConfigurationFiles(
    mcpServers,
    {
      target: "cursor",
      configPaths: [".cursor/mcp.json"],
      serverTransform: (server: RulesyncMcpServer): McpServerMapping => {
        const { targets: _, transport, type, ...serverConfig } = server;
        const cursorServer: CursorServer = { ...serverConfig };

        // Handle httpUrl by converting to url
        if (serverConfig.httpUrl !== undefined) {
          cursorServer.url = serverConfig.httpUrl;
          delete cursorServer.httpUrl;
        }

        // Set appropriate type based on transport or existing type
        if (serverConfig.httpUrl || transport === "http") {
          cursorServer.type = "streamable-http";
        } else if (transport === "sse" || type === "sse") {
          cursorServer.type = "sse";
        }

        return cursorServer;
      },
      configWrapper: configWrappers.mcpServers,
    },
    baseDir,
  );
}
