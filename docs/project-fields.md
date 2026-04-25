# GitHub Projects Field Model

GitHub repository labels and GitHub Projects fields are separate layers.

- Repository labels are attached to issues and pull requests.
- GitHub Projects fields are attached to Project items.
- Issues and PRs keep their repository labels when added to a Project.
- Project fields are better for planning state, sorting, and board views.

## Recommended fields

### Status

Use as the primary board column field.

| Option | Meaning |
|---|---|
| `Backlog` | Captured but not ready or not scheduled. |
| `Ready` | Clear enough to start. |
| `In Progress` | Actively being implemented. |
| `In Review` | PR is open or review is active. |
| `Blocked` | Cannot move forward without resolving a blocker. |
| `Done` | Completed, merged, closed, or intentionally resolved. |
| `Icebox` | Valid but intentionally deferred. |

### Priority

| Option | Meaning |
|---|---|
| `P0 Critical` | Production, security, release, or core functionality blocker. |
| `P1 High` | Important and should be addressed soon. |
| `P2 Normal` | Useful and planned but not urgent. |
| `P3 Low` | Cleanup, nice-to-have, or opportunistic work. |

### Size

| Option | Meaning |
|---|---|
| `XS` | Trivial. |
| `S` | Small. |
| `M` | Medium. |
| `L` | Large. |
| `XL` | Too large or should probably be split. |

### Risk

| Option | Meaning |
|---|---|
| `None` | No special risk identified. |
| `Breaking` | Compatibility or contract break. |
| `Migration` | Requires migration, backfill, or deployment sequencing. |
| `Security` | Security-sensitive change. |
| `Performance` | Performance, scaling, cost, or bundle-size impact. |
| `Experimental` | Prototype or unstable design. |

### Release Impact

| Option | Meaning |
|---|---|
| `None` | No release impact. |
| `Patch` | Patch release or bugfix note. |
| `Minor` | Minor release or feature note. |
| `Major` | Major release or breaking change note. |
| `Blocker` | Blocks the next release. |
| `Skip Notes` | Exclude from changelog/release notes. |

## Automation notes

The script can create missing single-select fields and optionally update options on existing single-select fields.

When updating existing single-select options, the script preserves option IDs for options with matching names. This matters because replacing option objects without preserving IDs can clear existing values on Project items.

## What this script does not do

It does not create Project views, board layouts, workflow automations, or per-item field values. Those can be added later, but this repository intentionally keeps the baseline small and safe.
