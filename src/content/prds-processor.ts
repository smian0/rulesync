import { GenericContentProcessor } from "./generic-content-processor.js";
import { ToolTarget } from "../types/tool-targets.js";

/**
 * Processor for .claude/prds/ directory
 * Handles Product Requirements Documents and specifications
 */
export class PRDsProcessor extends GenericContentProcessor {
  constructor({ baseDir = ".", toolTarget }: { baseDir?: string; toolTarget: ToolTarget }) {
    super({ baseDir, toolTarget, contentType: "prds" });
  }

  static getToolTargets({ includeSimulated = true } = {}): ToolTarget[] {
    return GenericContentProcessor.getToolTargets({ includeSimulated });
  }
}