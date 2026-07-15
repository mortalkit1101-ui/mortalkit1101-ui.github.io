# Source/Main Blog Publishing Design

## Goal

Make the Hexo blog reliably publishable from one instruction while preserving source history, generated-site history, and the existing GitHub Pages custom domain.

## Current State

- The local source branch contains Hexo configuration, Markdown posts, theme files, assets, and build tooling.
- Remote `main` contains the generated static site used by GitHub Pages.
- These histories are intentionally unrelated, so pull requests between them cannot be created.
- The Python basics series exists in the source history but is not present on the live site.

## Branch Architecture

- `source` is the default development branch and stores all editable blog source.
- `main` stores only generated static output and remains the GitHub Pages publishing branch.
- The existing source history is preserved by pushing the current commit graph to `source`.
- The existing generated-site history on `main` is preserved; no unrelated-history merge or force push is used.

## Publishing Flow

1. Inspect the source worktree and confirm that all changes are intended blog updates.
2. Run `npm.cmd run generate` and stop if Hexo reports an error.
3. Commit and push source changes to `source` with the `mortalkit` GitHub account.
4. Run the repository publishing script to synchronize the generated `public/` tree into a checked-out copy of `main`, commit, and push normally.
5. Verify the live domain `https://041101.xyz` in desktop and mobile viewports.

The default meaning of “上线更新的笔记” is the complete flow above, including online verification.

## Deployment Configuration

- Add `tools/publish-blog.js` as the only generated-site publishing entry point.
- The script fetches the existing `main`, copies `public/` into the ignored `.deploy_pages/` checkout, commits only when the generated tree changed, and pushes without force.
- Keep `source/CNAME` and `source/.nojekyll` in the generated output so the custom domain and GitHub Pages behavior remain stable.
- Add `npm run publish` to clean, generate, and invoke the publishing script using Windows-compatible npm invocation when run from PowerShell.

## Failure Handling

- Never merge the unrelated `source` and `main` histories.
- Never force-push `main` or `source` during routine publication.
- Do not deploy if the source worktree includes unrelated or sensitive files.
- Do not deploy when the Hexo build fails.
- If GitHub deployment succeeds but online verification fails, preserve the deployed commit, report the exact failing URL or asset, and fix forward from `source`.

## Verification

- Hexo generation completes without errors.
- The six Python routes return live pages with the expected titles.
- The homepage includes the Python series and the Python category.
- Chinese text renders without mojibake.
- Images load without broken-image state.
- Desktop and 390-pixel mobile layouts have no page-level horizontal overflow.
- Browser console contains no site-breaking errors.

## Rejected Alternatives

- Merging unrelated histories would mix editable source with generated output and make future diffs unsafe.
- Replacing `main` with the source history would break the current branch-based GitHub Pages setup until repository settings were migrated.
- Migrating immediately to GitHub Actions would add repository-settings and workflow complexity without improving this first publication.
- `hexo-deployer-git` was rejected after verification because it force-updates the deployment branch instead of preserving ordinary deployment history.
