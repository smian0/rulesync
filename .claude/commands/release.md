NEW_VERSION = $ARGUMENTS

1. Confirm that you are currently on the main branch. If not on main branch, abort this operation.
2. Run `git pull`.
3. Update the version in `src/cli/index.ts`. Then, execute `git add` and `git commit`.
4. Update the version with `pnpm version NEW_VERSION`.
5. Since `package.json` will be modified, execute `git tag -a {version} -m '{version}'` and `git push`.
6. Compare code changes between the previous version tag and current commit to prepare the Release description.
  - Write in English.
  - Do not include confidential information.
  - Sections, `What's Changed`, `Contributors` and `Full Changelog` are needed.
  - `./tmp/release-notes.md` will be used as the release notes.
7. As a precaution, verify that the release content does not contain any information that should remain private.
8. Use the `gh release create {version} --repo dyoshikawa/rulesync --title {version} --notes-file ./tmp/release-notes.md ...` command to create a Release on the `github.com/dyoshikawa/rulesync` repository with both title and tag set to NEW_VERSION, using the content from step 4 as the description.
