# Repository Workflow Standards

Use this file as the repository standard for issues, pull requests, labels, and GitHub Projects.

## Purpose

This repository follows a two-layer model:

- Repository labels describe what the work is.
- GitHub Project fields describe workflow state, planning, and sequencing.

Do not use labels as a substitute for normal workflow columns.

## Scope

This standard applies to:

- Issues
- Pull requests
- GitHub Project items associated with issues and pull requests

## Required Labeling Rules

Apply labels using these rules:

1. Exactly one type label is required on every issue and pull request.
2. One or more area labels should be added when the affected surface is clear.
3. Priority labels are primarily for issues; add them to pull requests only when urgency is important for review or release.
4. Size labels are primarily for pull requests to communicate review complexity.
5. Risk labels are required when compatibility, migration, security, or performance risk is present.
6. Release labels are required when changelog or versioning impact exists.

## Label Families

Use these standard label families:

- type:feature, type:bug, type:docs, type:refactor, type:chore, type:test, type:ci, type:deps, type:release, type:security
- area:frontend, area:backend, area:api, area:data, area:infra, area:auth, area:ui, area:docs, area:cli, area:ai
- priority:p0, priority:p1, priority:p2, priority:p3
- size:xs, size:s, size:m, size:l, size:xl
- risk:breaking, risk:migration, risk:security, risk:performance, risk:experimental
- release:major, release:minor, release:patch, release:blocker, release:skip-notes
- status:needs-triage, status:needs-info, status:blocked, status:ready, status:wontfix
- good-first-issue, help-wanted, question, duplicate, invalid

## Project Field Standards

Use GitHub Projects fields for planning and workflow state.

### Status

Allowed values:

- Backlog
- Ready
- In Progress
- In Review
- Blocked
- Done
- Icebox

### Priority

Allowed values:

- P0 Critical
- P1 High
- P2 Normal
- P3 Low

### Size

Allowed values:

- XS
- S
- M
- L
- XL

### Risk

Allowed values:

- None
- Breaking
- Migration
- Security
- Performance
- Experimental

### Release Impact

Allowed values:

- None
- Patch
- Minor
- Major
- Blocker
- Skip Notes

## PR Workflow Standard

Apply this flow for pull requests:

1. Open PR with exactly one type label and appropriate area labels.
2. Add size label and risk label as soon as review scope is clear.
3. Set Project Status to In Review when PR is open and under review.
4. Keep status labels limited to exceptional states only.
5. Use release labels only when release notes or versioning impact is expected.
6. Merge only after required review and checks pass.
7. Move Project Status to Done on merge.

## Issue Triage Standard

Apply this flow for issues:

1. Start with type and area labels.
2. Set Project Status to Backlog or Ready.
3. Add priority label for planning.
4. Add risk or release labels only when relevant.
5. Move to In Progress only when active implementation begins.

## Prohibited Patterns

Do not use labels like todo, in progress, or done for routine workflow state.
Do not apply multiple type labels.
Do not leave pull requests without a size label once scope is known.
Do not use project status and label status to represent the same normal state.

## Monorepo Guidance

Prefer broad area labels for long-lived surfaces.
Add package-specific labels only when package boundaries are stable and frequently used for filtering.

## Enforcement Recommendations

- Validate label taxonomy and Project field config before sync.
- Run dry-run before destructive changes.
- Use upsert mode by default.
- Use prune or replace only after migration confidence is high.

## Copy Guidance

This file is intended to be copied into adopting repositories as:

- CONTRIBUTING section
- docs/workflow-standards.md
- .github repository policy reference

For a compact CONTRIBUTING drop-in, use [repo-docs/contributing-workflow-standards.md](repo-docs/contributing-workflow-standards.md).

## Related File

- [repo-docs/contributing-workflow-standards.md](repo-docs/contributing-workflow-standards.md): Short copy-paste section for existing CONTRIBUTING files.
