# Repository Label Policy Snippet

Copy this into `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, or a repo ops document.

```md
## Labels

Use the standard repository label taxonomy:

- One `type:*` label is required.
- Add one or more `area:*` labels when applicable.
- Add `priority:*` for issue planning or urgent PRs.
- Add `size:*` for PR review complexity.
- Add `risk:*` when the change affects compatibility, migrations, security, performance, or stability.
- Add `release:*` when the change affects versioning, changelogs, or release readiness.
- Avoid status labels for ordinary workflow state; use GitHub Projects `Status` instead.

For monorepos, prefer `area:*` for stable surfaces and use issue/PR titles or Project metadata for package-level details unless one package dominates the repo long-term.
```
