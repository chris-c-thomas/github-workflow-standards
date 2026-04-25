# Command Examples

## Install globally

```bash
npm link
```

Then call from any directory:

```bash
sync-github-workflow --current-repo --dry-run
```

## Validate locally

```bash
npm run check
```

## Dry run against a repo

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo chris-c-thomas/LexBuild \
  --dry-run
```

## Dry run against the current repo

From inside a GitHub repository with `origin` configured, the script can infer `OWNER/REPO` and use `gh auth token` if `GH_TOKEN` and `GITHUB_TOKEN` are unset:

```bash
node scripts/sync-github-workflow.mjs \
  --current-repo \
  --dry-run
```

## Upsert labels only

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo chris-c-thomas/LexBuild
```

## Replace labels with the standard set

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo chris-c-thomas/LexBuild \
  --replace
```

## Sync an existing Project

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo chris-c-thomas/LexBuild \
  --sync-project \
  --project-title "LexBuild"
```

## Create the Project if missing

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo chris-c-thomas/LexBuild \
  --sync-project \
  --project-title "LexBuild" \
  --create-project
```

## Update Project options

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo chris-c-thomas/LexBuild \
  --sync-project \
  --project-title "LexBuild" \
  --update-project-options
```

## Use a repo-specific label config

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo chris-c-thomas/LexBuild \
  --labels-file config/labels.lexbuild.json \
  --dry-run
```
