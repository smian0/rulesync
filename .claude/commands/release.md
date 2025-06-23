NEW_VERSION = $ARGUMENT


1. Confirm that you are currently on the main branch. If not on main branch, abort this operation.
2. Run `git pull`.
3. Update the version with `pnpm version NEW_VERSION`.
4. Since `package.json` will be modified, execute `git push`.
5. Compare code changes between the previous version tag and current commit to prepare the Release description.
  - Write in English.
  - Do not include confidential information.
6. Use the `gh` command to create a Release on the `github.com/dyoshikawa/rulesync` repository with both title and tag set to NEW_VERSION, using the content from step 4 as the description.
