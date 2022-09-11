# Npm deployment with pnpm and changeset

Purely for testing purposes

## Some notes

You can't use other organizations than the owner (in this case 'TeemuKoivisto') as your scope in your packages. So I can't publish @make-me-a-cup-of-tea packages to Github package registry. Which is balls.

I had to in the end `.gitignore` `.npmrc` because no matter how I tried, changesets kept commiting it to Git...

## The flow

1. Make changes, run `pnpm cs` to create changeset files, create a PR, merge it
2. This should create a PR which can include multiple changesets that can be deployed at once
3. When ready for publishing, merge the PR
4. Action should automatically deploy the packages to NPM
