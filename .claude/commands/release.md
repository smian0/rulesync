NEW_VERSION = $ARGUMENT


1. 現在がmainブランチであることを確認してください。mainブランチでない場合はこの作業を中止してください。
2. `git pull` してください。
3. `pnpm version NEW_VERSION` でバージョンを更新してください。
4. `package.json` が変更されるので、 `git commit` `git push` を実行してください。
5. 前回のバージョンタグと現在のコミットのコードの変更を比較して、Releaseの本文を考えてください.
  - 英語にすること。
  - 機密情報を含めないこと。
6. `gh` コマンドで `github.com/dyoshikawa/rulesync` リポジトリにタイトル・タグ共に NEW_VERSION を入力、本文は4の内容を使ってReleaseを作成してください。
