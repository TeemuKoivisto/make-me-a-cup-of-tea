# Npm deployment with pnpm and changeset

Purely for testing purposes

## The flow

1. Make features, create PRs, merge them
2. Run `pnpm changeset` to decide what to publish
3. Commit the created Markdown files, merge to master
4. This should create a PR which can include multiple changesets
5. When ready for publishing, merge the PR
6. Action should automatically deploy the packages to NPM