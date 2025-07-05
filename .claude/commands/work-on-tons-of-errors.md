```bash
pnpm fix | tail -n 100
pnpm typecheck | tail -n 100
pnpm test | tail -n 100
```

Execute these commands and modify the source code to reduce the errors that appear from these commands.

The `tail` command is a preventive measure because you might get confused if you see a large number of errors at once. Therefore, removing `tail -n 100` is prohibited.

We will eventually resolve all errors, but we'll proceed gradually. When errors are reduced by 3 files, run `git commit --no-verify` and `push`, then finish. After that, the user will give further instructions.
