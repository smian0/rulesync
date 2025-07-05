import { z } from "zod/v4";
import { RulesyncTargetsSchema } from "./tool-targets.js";

export const McpTransportTypeSchema = z.enum(["stdio", "sse", "http"]);

export const McpServerBaseSchema = z.object({
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  url: z.string().optional(),
  httpUrl: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  disabled: z.boolean().optional(),
  networkTimeout: z.number().optional(),
  timeout: z.number().optional(),
  trust: z.boolean().optional(),
  cwd: z.string().optional(),
  transport: McpTransportTypeSchema.optional(),
  type: z.enum(["sse", "streamable-http"]).optional(),
  alwaysAllow: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
});

export const RulesyncMcpServerSchema = McpServerBaseSchema.extend({
  targets: RulesyncTargetsSchema.optional(),
});

export const McpConfigSchema = z.object({
  mcpServers: z.record(z.string(), McpServerBaseSchema),
});

export const RulesyncMcpConfigSchema = z.object({
  mcpServers: z.record(z.string(), RulesyncMcpServerSchema),
});

export type McpTransportType = z.infer<typeof McpTransportTypeSchema>;
export type McpServerBase = z.infer<typeof McpServerBaseSchema>;
export type RulesyncMcpServer = z.infer<typeof RulesyncMcpServerSchema>;
export type McpConfig = z.infer<typeof McpConfigSchema>;
export type RulesyncMcpConfig = z.infer<typeof RulesyncMcpConfigSchema>;
export type ParsedRulesyncTargets = z.infer<typeof RulesyncTargetsSchema>;
export type ParsedRulesyncMcpServer = z.infer<typeof RulesyncMcpServerSchema>;
