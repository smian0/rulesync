import { parseRulesFromDirectory } from "../../core/index.js";
import { getDefaultConfig, fileExists } from "../../utils/index.js";

export async function statusCommand(): Promise<void> {
  const config = getDefaultConfig();
  
  console.log("ai-rules Status");
  console.log("===============");
  
  // Check if .ai-rules directory exists
  const aiRulesExists = await fileExists(config.aiRulesDir);
  console.log(`\n📁 .ai-rules directory: ${aiRulesExists ? "✅ Found" : "❌ Not found"}`);
  
  if (!aiRulesExists) {
    console.log("\n💡 Run 'ai-rules init' to get started");
    return;
  }
  
  try {
    // Parse and count rules
    const rules = await parseRulesFromDirectory(config.aiRulesDir);
    console.log(`\n📋 Rules: ${rules.length} total`);
    
    if (rules.length > 0) {
      // Count by priority
      const highPriority = rules.filter(r => r.frontmatter.priority === "high").length;
      const lowPriority = rules.filter(r => r.frontmatter.priority === "low").length;
      
      console.log(`   - High priority: ${highPriority}`);
      console.log(`   - Low priority: ${lowPriority}`);
      
      // Count by target tools
      const targetCounts = { copilot: 0, cursor: 0, cline: 0 };
      
      for (const rule of rules) {
        const targets = rule.frontmatter.targets.includes("*") 
          ? config.defaultTargets 
          : rule.frontmatter.targets as Array<keyof typeof targetCounts>;
          
        for (const target of targets) {
          if (target in targetCounts) {
            targetCounts[target]++;
          }
        }
      }
      
      console.log("\n🎯 Target tool coverage:");
      console.log(`   - Copilot: ${targetCounts.copilot} rules`);
      console.log(`   - Cursor: ${targetCounts.cursor} rules`);
      console.log(`   - Cline: ${targetCounts.cline} rules`);
    }
    
    // Check output files
    console.log("\n📤 Generated files:");
    for (const [tool, outputPath] of Object.entries(config.outputPaths)) {
      const outputExists = await fileExists(outputPath);
      console.log(`   - ${tool}: ${outputExists ? "✅ Generated" : "❌ Not found"}`);
    }
    
    if (rules.length > 0) {
      console.log("\n💡 Run 'ai-rules generate' to update configuration files");
    }
    
  } catch (error) {
    console.error("\n❌ Failed to get status:", error);
  }
}