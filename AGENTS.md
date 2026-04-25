# Agent Instructions

## Project Shape

This repository is a dependency-free Node.js 20+ toolkit for standardizing GitHub repository labels and GitHub Projects v2 fields. Start with [README.md](README.md) for usage and command examples.

Key boundaries:

- [config/labels.json](config/labels.json) and [config/project-fields.json](config/project-fields.json) are the source-of-truth data files.
- [schemas/](schemas/) contains the JSON schemas for those config files.
- [scripts/sync-github-workflow.mjs](scripts/sync-github-workflow.mjs) is the CLI entry point and should stay dependency-free unless the project direction changes explicitly.
- [docs/](docs/) and [examples/](examples/) contain user-facing guidance; link to them instead of duplicating long taxonomy details.

## Commands

- Run `npm run validate` after changing files under [config/](config/) or [schemas/](schemas/).
- Run `npm run check` after changing [scripts/sync-github-workflow.mjs](scripts/sync-github-workflow.mjs) or CLI behavior.
- The sync script prefers `GH_TOKEN` or `GITHUB_TOKEN` for GitHub mutations, falls back to `gh auth token` for local usage, and does not require a token for `--validate-only`.

## Conventions

- Keep the repo dependency-free and use Node.js built-ins and ES modules, matching the existing script style.
- Preserve the core model: repository labels describe the work item; GitHub Projects fields describe planning, ordering, and workflow state.
- Treat [docs/label-taxonomy.md](docs/label-taxonomy.md), [docs/project-fields.md](docs/project-fields.md), [docs/monorepo-guidance.md](docs/monorepo-guidance.md), and [docs/migration-notes.md](docs/migration-notes.md) as the detailed references.
- For monorepos, prefer broad `area:*` labels and only add `pkg:*` labels when the package set is small, stable, and frequently filtered.

## Safety Notes

- Be careful with `--prune` and `--replace`; both delete labels and should be previewed with `--dry-run` first.
- Do not add ordinary workflow labels such as `todo`, `in progress`, or `done`; use Project field values for that state.
- When editing label config, keep label colors as six-character hex strings and descriptions within GitHub's 1-100 character limit.
- When editing Project field config, use only GitHub Projects single-select colors already accepted by the script.