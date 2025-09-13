import { GenericContentProcessor } from "./generic-content-processor.js";
import { ToolTarget } from "../types/tool-targets.js";

/**
 * Processor for additional .claude/rules/ directory content
 * Handles specialized rules that aren't covered by the main RulesProcessor
 */
export class AdditionalRulesProcessor extends GenericContentProcessor {
  constructor({ baseDir = ".", toolTarget }: { baseDir?: string; toolTarget: ToolTarget }) {
    super({ baseDir, toolTarget, contentType: "rules" });
  }

  static getToolTargets({ includeSimulated = true } = {}): ToolTarget[] {
    return GenericContentProcessor.getToolTargets({ includeSimulated });
  }
}