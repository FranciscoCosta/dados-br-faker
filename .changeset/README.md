# Changesets

This folder holds [changesets](https://github.com/changesets/changesets): small
markdown files describing a change and its semver impact.

When you make a user-facing change, run:

```bash
pnpm changeset
```

Pick the bump (`patch` / `minor` / `major`) and write a short summary. On merge to
`main`, the release workflow opens a "Version Packages" PR that applies the bumps
and updates the changelog; merging that PR publishes to npm.
