# rulesyncへの貢献

rulesyncへの貢献を歓迎します！このドキュメントでは、貢献のプロセスと始め方について説明します。

[English](./CONTRIBUTING.md) | **日本語**

## 始める

1. リポジトリをフォーク
2. フォークをクローン: `git clone https://github.com/your-username/rulesync.git`
3. 依存関係をインストール: `pnpm install`
4. 新しいブランチを作成: `git checkout -b feature/your-feature-name`

## 開発環境の設定

### 前提条件

- Node.js 20.0.0 以上（推奨: 24.0.0+）
- pnpm 10.12.2+（推奨）またはnpm/yarn

### 開発コマンド

```bash
# 依存関係をインストール
pnpm install

# ホットリロードで開発モードで実行
pnpm dev

# プロジェクトをビルド
pnpm build

# テストを実行
pnpm test

# ウォッチモードでテストを実行
pnpm test:watch

# カバレッジ付きでテストを実行
pnpm test:coverage

# コードをリント
pnpm lint

# コードをフォーマット
pnpm format

# フォーマットをチェック
pnpm format:check

# リントとフォーマットの両方を実行
pnpm check

# リントとフォーマット問題を修正
pnpm fix

# シークレットをチェック
pnpm secretlint

# 型チェック
pnpm typecheck
```

## プロジェクトアーキテクチャ

### コア構造

```
rulesync/
├── src/
│   ├── cli/
│   │   ├── commands/        # CLIコマンドの実装
│   │   │   ├── init.ts      # プロジェクト初期化
│   │   │   ├── add.ts       # 新しいルールファイルの追加
│   │   │   ├── generate.ts  # 設定生成
│   │   │   ├── import.ts    # 既存設定のインポート
│   │   │   ├── watch.ts     # ファイル監視
│   │   │   ├── status.ts    # プロジェクト状態
│   │   │   ├── validate.ts  # ルール検証
│   │   │   └── gitignore.ts # .gitignore管理
│   │   └── index.ts        # CLIエントリーポイント (Commander.js)
│   ├── core/
│   │   ├── parser.ts       # .rulesync/*.mdファイルのパース
│   │   ├── generator.ts    # 生成のオーケストレーション
│   │   ├── importer.ts     # 既存設定のインポート
│   │   └── validator.ts    # ルール構造の検証
│   ├── generators/         # ツール固有のジェネレーター
│   │   ├── copilot.ts     # GitHub Copilot Custom Instructions
│   │   ├── cursor.ts      # Cursor Project Rules (MDCフォーマット)
│   │   ├── cline.ts       # Cline Rules
│   │   ├── claudecode.ts  # Claude Code Memory (CLAUDE.md + memories)
│   │   ├── geminicli.ts   # Gemini CLI設定 (GEMINI.md + memories)
│   │   └── roo.ts         # Roo Code Rules
│   ├── parsers/           # インポート機能用ツール固有パーサー
│   │   ├── copilot.ts     # GitHub Copilot設定のパース (.github/copilot-instructions.md)
│   │   ├── cursor.ts      # Cursor設定のパース (.cursorrules, .cursor/rules/*.mdc)
│   │   ├── cline.ts       # Cline設定のパース (.cline/instructions.md)
│   │   ├── claudecode.ts  # Claude Code設定のパース (CLAUDE.md, .claude/memories/*.md)
│   │   ├── geminicli.ts   # Gemini CLI設定のパース (GEMINI.md, .gemini/memories/*.md)
│   │   └── roo.ts         # Roo Code設定のパース (.roo/instructions.md)
│   ├── types/              # TypeScript型定義
│   │   ├── config.ts      # 設定型
│   │   └── rules.ts       # ルールとフロントマター型
│   └── utils/
│       ├── file.ts         # ファイル操作 (read/write/delete)
│       └── config.ts       # 設定管理
├── dist/                   # ビルド出力 (CJS + ESM)
└── tests/                  # テストファイル (*.test.ts)
```

### 主要な依存関係

- **Commander.js v14.0.0**: コマンドラインインターフェース用のCLIフレームワーク
- **gray-matter v4.0.3**: Markdownファイルのフロントマターパーシング（YAML、TOML、JSON対応）
- **marked v15.0.12**: Markdownのパーシングとレンダリング
- **chokidar v4.0.3**: 高性能な`watch`コマンド用のファイル監視
- **tsup v8.5.0**: ビルドシステム（CJSとESMの両方を出力）
- **tsx v4.20.3**: 開発用TypeScript実行
- **Biome v2.0.0**: 統合リンターとフォーマッター（ESLint + Prettierの代替）
- **Vitest v3.2.4**: カバレッジ付きテストフレームワーク

### ビルドシステム

- **ターゲット**: Node.js 20.0.0+（推奨: 24.0.0+）
- **TypeScript**: `@tsconfig/node24`を使用した厳密モード
- **出力**: CommonJS（`dist/index.js`）とESM（`dist/index.mjs`）の両方
- **バイナリ**: `dist/index.js`（実行可能エントリーポイント）
- **型**: ビルド出力に含まれる

## 貢献方法

### 問題の報告

1. 重複を避けるため既存のissueを確認
2. 利用可能な場合はissueテンプレートを使用
3. 以下を含める:
   - 問題の明確な説明
   - 再現手順
   - 期待される動作 vs 実際の動作
   - 環境（Node.jsバージョン、OS等）

### 機能リクエスト

1. 類似のリクエストがないか既存のissueを検索
2. 機能とその使用例を説明
3. 設計提案やモックアップの提供を検討

### プルリクエスト

1. **大きな機能の作業を開始する前に、まずissueを開いて議論してください**
2. 変更がテストでカバーされていることを確認
3. 既存のコードスタイルに従う（Biomeによって強制）
4. 明確なコミットメッセージを書く
5. 必要に応じてドキュメントを更新

#### プルリクエストプロセス

1. フォークして機能ブランチを作成
2. コードとテストを書く
3. 完全なテストスイートを実行: `pnpm test`
4. コード品質チェックを実行: `pnpm check`
5. シークレットをチェック: `pnpm secretlint`
6. 明確なメッセージで変更をコミット
7. フォークにプッシュしてプルリクエストを作成

#### コミットメッセージフォーマット

conventional commit メッセージを使用します:

```
type(scope): description

[optional body]

[optional footer]
```

タイプ:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードスタイル変更（フォーマット等）
- `refactor`: コードリファクタリング
- `test`: テストの追加または更新
- `chore`: メンテナンスタスク

例:
- `feat(generators): 新しいAIツールのサポートを追加`
- `fix(parser): 不足しているフロントマターを適切に処理`
- `docs(readme): インストール手順を更新`

## コードスタイル

リントとフォーマットに[Biome](https://biomejs.dev/)を使用しています:

- インデントは2スペース
- セミコロン必須
- 文字列は二重引用符
- 複数行オブジェクト/配列で末尾カンマ

スタイルはCIパイプラインとpre-commitフックによって自動的に強制されます。

## テスト

プロジェクトは包括的なカバレッジ（現在: 21テストファイルで157テスト、目標: 80%+カバレッジ）でVitestを使用してテストしています:

### テスト構造

- **単体テスト**: 個々の関数のテスト
- **統合テスト**: コマンドとジェネレーターのテスト
- **モック**: Vitestの組み込みモック機能を使用
- **カバレッジ目標**: 80%+

### テストの書き方

- 新機能とバグ修正のテストを書く
- 説明的なテスト名を使用
- 成功とエラーの両方のケースをテスト
- テストを集中的かつ独立に保つ
- パターンに従う: `src/module.ts` → `src/module.test.ts`

### テストの実行

```bash
# すべてのテスト（21テストファイルで157テスト）
pnpm test

# 開発用ウォッチモード
pnpm test:watch

# カバレッジレポートを生成
pnpm test:coverage

# 特定のテストファイルを実行
pnpm test src/generators/copilot.test.ts

# 特定機能のテストを実行
pnpm test src/cli/commands/import.test.ts  # インポート機能のテスト
pnpm test src/parsers/                     # すべてのパーサーのテスト
```

### モジュール別テストカバレッジ

- **cli/commands**: 85.41%（良好なカバレッジ、新しいimportコマンドのテストが必要）
- **core**: 62.97%（改善が必要、新しいimporterモジュールのテストが必要）
- **generators**: すべてのモジュールで高カバレッジ
- **utils**: すべてのモジュールで高カバレッジ
- **types**: すべてのモジュールで高カバレッジ

注意: 新しいインポート機能のテスト実装が必要なため、カバレッジが一時的に低下しています。

## 新しいAIツールの追加

新しいAIツールのサポートを追加するには（最近追加された`geminicli`を参考として）:

1. **ジェネレーターを作成**: `src/generators/newtool.ts`を追加
2. **パーサーを作成**: インポート機能用に`src/parsers/newtool.ts`を追加
3. **インターフェースを実装**: パターンに従って非同期関数をエクスポート
4. **コアに追加**: `src/core/generator.ts`と`src/core/importer.ts`を更新
5. **CLIオプションを追加**: generateとimportコマンドの両方で`src/cli/index.ts`を更新
6. **型を更新**: `src/types/rules.ts`の`ToolTarget`に追加
7. **設定を更新**: `src/utils/config.ts`で出力パスを追加
8. **テストを追加**: `src/generators/newtool.test.ts`と`src/parsers/newtool.test.ts`を作成
9. **ドキュメントを更新**: README.mdとREADME.ja.mdに追加

### ジェネレーターインターフェースパターン

```typescript
export async function generateNewToolConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];
  
  for (const rule of rules) {
    const content = generateNewToolMarkdown(rule);
    const outputDir = baseDir ? join(baseDir, config.outputPaths.newtool) : config.outputPaths.newtool;
    const filepath = join(outputDir, `${rule.filename}.ext`);
    
    outputs.push({
      tool: "newtool",
      filepath,
      content,
    });
  }
  
  return outputs;
}
```

### パーサーインターフェースパターン

```typescript
export async function parseNewToolConfiguration(
  baseDir: string = process.cwd()
): Promise<{ rules: ParsedRule[]; errors: string[] }> {
  const rules: ParsedRule[] = [];
  const errors: string[] = [];
  
  // 設定ファイルを確認
  const configFiles = await findNewToolConfigFiles(baseDir);
  
  if (configFiles.length === 0) {
    errors.push("NewTool設定ファイルが見つかりません");
    return { rules, errors };
  }
  
  // 各設定ファイルをパース
  for (const configFile of configFiles) {
    try {
      const content = await readFile(configFile, "utf-8");
      const parsed = await parseNewToolFormat(content);
      rules.push({
        ...parsed,
        filename: generateUniqueFilename("newtool", parsed),
      });
    } catch (error) {
      errors.push(`${configFile}のパースに失敗: ${error.message}`);
    }
  }
  
  return { rules, errors };
}
```

## ドキュメント

- ユーザー向けの変更についてはREADME.mdを更新
- 新しい関数/クラスにJSDocコメントを追加
- API変更についてはREADME.mdを更新
- ドキュメントに例を含める

## セキュリティ

- シークレット、APIキー、個人情報をコミットしない
- `pnpm secretlint`を使用して潜在的なシークレットをチェック
- セキュリティ問題はメンテナーに非公開で報告

## 質問？

お気軽に:
- 貢献に関する質問はissueを開く
- より広範なトピックについてはディスカッションを開始
- ガイダンスについてはメンテナーに連絡

rulesyncへの貢献をありがとうございます！