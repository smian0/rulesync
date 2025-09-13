import { GenericContentProcessor } from "./generic-content-processor.js";
import { ToolTarget } from "../types/tool-targets.js";

/**
 * Processor for .claude/technical-design/ directory
 * Handles technical design documents and architecture specifications
 */
export class TechnicalDesignProcessor extends GenericContentProcessor {
  constructor({ baseDir = ".", toolTarget }: { baseDir?: string; toolTarget: ToolTarget }) {
    super({ baseDir, toolTarget, contentType: "technical-design" });
  }

  static getToolTargets({ includeSimulated = true } = {}): ToolTarget[] {
    return GenericContentProcessor.getToolTargets({ includeSimulated });
  }
}