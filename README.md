# Npm deployment with pnpm and changeset

Purely for testing purposes

## The flow

1. Make changes, run `pnpm cs` to create changeset files, create a PR, merge it
2. This should create a PR which can include multiple changesets that can be deployed at once
3. When ready for publishing, merge the PR
4. Action should automatically deploy the packages to NPM