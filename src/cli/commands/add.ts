import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getDefaultConfig } from "../../utils/config.js";

/**
 * ファイル名から.md拡張子を除去
 */
function sanitizeFilename(filename: string): string {
  return filename.endsWith(".md") ? filename.slice(0, -3) : filename;
}

/**
 * デフォルトのルールファイルテンプレートを生成
 */
function generateRuleTemplate(filename: string): string {
  return `---
root: false
targets: ["*"]
description: "Rules for ${filename}"
globs: []
---

# ${filename.charAt(0).toUpperCase() + filename.slice(1)} Rules

Add your rules here.
`;
}

/**
 * addコマンドの実装
 */
export async function addCommand(filename: string): Promise<void> {
  try {
    const config = getDefaultConfig();
    const sanitizedFilename = sanitizeFilename(filename);
    const rulesDir = config.aiRulesDir;
    const filePath = path.join(rulesDir, `${sanitizedFilename}.md`);

    // .rulesyncディレクトリが存在しない場合は作成
    await mkdir(rulesDir, { recursive: true });

    // テンプレート内容を生成
    const template = generateRuleTemplate(sanitizedFilename);

    // ファイルを作成
    await writeFile(filePath, template, "utf8");

    console.log(`✅ Created rule file: ${filePath}`);
    console.log(`📝 Edit the file to customize your rules.`);
  } catch (error) {
    console.error(
      `❌ Failed to create rule file: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(3); // ファイルI/Oエラー
  }
}
