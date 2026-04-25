# Monorepo Guidance

For monorepos, avoid creating a permanent label for every package unless the package set is small, stable, and frequently filtered.

Prefer universal surface labels first:

```txt
area:frontend
area:backend
area:api
area:data
area:infra
area:docs
area:cli
area:ai
```

Then add repo-specific `pkg:*` labels only when they materially improve filtering or release planning.

## Optional package labels

For a monorepo like LexBuild, optional package labels might look like this:

```txt
pkg:core
pkg:cli
pkg:usc
pkg:ecfr
pkg:web
pkg:docs
pkg:search
```

Keep these in a repo-specific config file instead of the universal baseline.

Example:

```bash
cp config/labels.json config/labels.lexbuild.json
```

Then append your package labels and run:

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo chris-c-thomas/LexBuild \
  --labels-file config/labels.lexbuild.json \
  --dry-run
```

## Labeling PRs in monorepos

A normal PR might use:

```txt
type:feature
area:api
area:data
size:m
risk:migration
release:minor
```

A docs-only change might use:

```txt
type:docs
area:docs
size:s
release:skip-notes
```

A build-system change might use:

```txt
type:ci
area:infra
size:m
risk:performance
```

## Avoid excessive specificity

Avoid labels such as:

```txt
file:package-json
folder:apps-web
component:button
runtime:node20
```

Those details usually belong in the PR title, PR body, changed files, Project fields, or release notes.
