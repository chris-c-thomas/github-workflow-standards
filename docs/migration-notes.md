# Migration Notes

## Safe migration path

1. Validate the config.
2. Run the script in `--dry-run` mode.
3. Use default upsert mode first.
4. Wait a few days and see whether the taxonomy feels natural.
5. Use `--prune` or `--replace` only after you are comfortable losing old ad-hoc label assignments.

## Recommended commands

Validate:

```bash
npm run check
```

Dry run:

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO \
  --dry-run
```

Dry run from inside the target repository:

```bash
node scripts/sync-github-workflow.mjs \
  --current-repo \
  --dry-run
```

Safe upsert:

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO
```

Prune only non-standard labels:

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO \
  --prune
```

Replace everything:

```bash
GH_TOKEN="$(gh auth token)" node scripts/sync-github-workflow.mjs \
  --repo OWNER/REPO \
  --replace
```

## Destructive behavior

`--replace` deletes every existing repository label. That includes GitHub's defaults and any custom ad-hoc labels.

Deleting a repository label also removes that label from existing issues and pull requests. It does not delete the issues or pull requests, but it does remove historical label metadata.

## Rollback strategy

There is no automatic rollback for deleted label assignments. To reduce risk:

- Export labels before destructive changes.
- Run against a low-risk repository first.
- Use `--dry-run` before `--replace` or `--prune`.
- Consider using default upsert mode for active repositories with meaningful issue history.

A quick export command:

```bash
gh api repos/OWNER/REPO/labels --paginate > labels.backup.json
```
