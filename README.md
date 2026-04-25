# GitHub Workflow Standards

A small, dependency-free toolkit for keeping GitHub issue labels, PR labels, and GitHub Projects fields consistent across personal repos, solo projects, and monorepos.

The repository contains:

- A standard label taxonomy in `config/labels.json`.
- A standard GitHub Projects v2 field model in `config/project-fields.json`.
- A Node.js CLI script in `scripts/sync-github-workflow.mjs`.
- Documentation for label usage, Projects usage, monorepo adjustments, and migration strategy.
- Example policy snippets and command recipes.

## Design principle

Repository labels describe the work item. GitHub Projects fields describe planning, ordering, and workflow state.

That means labels like these are good:

```txt
type:feature
area:api
priority:p1
size:m
risk:migration
release:minor
```

But ordinary workflow statuses like `todo`, `in progress`, and `done` should usually be Project field values, not repository labels.

## Requirements

- Node.js 20 or newer.
- A GitHub token in `GH_TOKEN` or `GITHUB_TOKEN`, or an authenticated GitHub CLI for local usage.
- For repository label sync, the token needs repository label write access.
- For Project field sync, the token needs GitHub Projects access.

With GitHub CLI:

```bash
gh auth refresh -h github.com -s repo -s project
export GH_TOKEN="$(gh auth token)"
```

For local CLI usage, the sync script also falls back to `gh auth token` when `GH_TOKEN` and `GITHUB_TOKEN` are not set. CI should still use an explicit environment token.

## Install globally (optional)

To run the script as `sync-github-workflow` from any directory:

```bash
npm link
```

Then from inside any GitHub repository:

```bash
sync-github-workflow --current-repo --dry-run
```

To uninstall: `npm unlink -g github-workflow-standards`

## Validate the config

```bash
npm run validate
```

Or directly:

```bash
node scripts/sync-github-workflow.mjs --validate-only
```

## Preview label changes

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO \
  --dry-run
```

From inside the target repository, you can infer `OWNER/REPO` from `origin`:

```bash
node scripts/sync-github-workflow.mjs \
  --current-repo \
  --dry-run
```

## Upsert labels without deleting extras

This is the safest normal mode. It creates missing standard labels and updates existing standard labels, but it does not delete ad-hoc labels.

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO
```

Or, from inside the target repository with GitHub CLI auth:

```bash
node scripts/sync-github-workflow.mjs --current-repo
```

## Prune non-standard labels

This deletes labels that are not present in `config/labels.json`, then upserts the standard set.

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO \
  --prune
```

## Replace all labels

This deletes every existing repository label, including GitHub defaults, then creates the standard set.

Run `--dry-run` first.

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO \
  --replace \
  --dry-run
```

Then run it for real:

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO \
  --replace
```

Warning: deleting a label removes it from existing issues and pull requests. Do not use `--replace` on a repo with important historical issue triage unless that is intentional.

## Sync Project fields

GitHub Projects v2 fields are not repository labels. Issues and PRs retain repository labels when added to a Project, while the Project has its own fields such as `Status`, `Priority`, `Size`, `Risk`, and `Release Impact`.

To update an existing Project:

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO \
  --sync-project \
  --project-title "Project Name"
```

To create the Project if missing:

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO \
  --sync-project \
  --project-title "Project Name" \
  --create-project
```

To overwrite options on existing single-select fields:

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO \
  --sync-project \
  --project-title "Project Name" \
  --update-project-options
```

The script preserves existing Project option IDs when option names match. That helps prevent existing Project item values from being cleared when options are updated.

## Files

```txt
.
├── README.md
├── package.json
├── config/
│   ├── labels.json
│   └── project-fields.json
├── docs/
│   ├── label-taxonomy.md
│   ├── migration-notes.md
│   ├── monorepo-guidance.md
│   └── project-fields.md
├── examples/
│   ├── commands.md
│   └── repo-label-policy.md
├── schemas/
│   ├── labels.schema.json
│   └── project-fields.schema.json
└── scripts/
    └── sync-github-workflow.mjs
```

## Recommended rollout

1. Run `npm run validate`.
2. Run `--dry-run` against a low-risk repo.
3. Use default upsert mode on an active repo.
4. After you trust the taxonomy, use `--prune` or `--replace` on repos where you want a clean slate.
5. Keep repo-specific labels in a separate branch or fork if a project needs specialized taxonomy.

## License

No license file is included by default. Add the license you prefer before publishing this as a public repository.
