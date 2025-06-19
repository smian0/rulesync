NEW_VERSION = $ARGUMENT

まず、現在がmainブランチであることを確認してください。mainブランチでない場合はこの作業を中止してください。

`pnpm version NEW_VERSION` でバージョンを更新してください。

`package.json` が変更されるので、 `git commit` `git push` を実行してください。

`gh` コマンドで `github.com/dyoshikawa/rulesync` リポジトリにタイトル、タグ共に NEW_VERSION を入力してReleaseを作成してください。
