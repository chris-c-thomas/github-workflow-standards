# CONTRIBUTING Workflow Standards Snippet

Copy this section into an existing CONTRIBUTING.md when you want a compact policy.

```md
## Workflow Standards

This repository uses labels for work type and scope, and GitHub Project fields for workflow state.

### Labels

1. Apply exactly one type label to every issue and pull request.
2. Add one or more area labels when the affected surface is clear.
3. Add priority labels mainly on issues.
4. Add size labels on pull requests once scope is clear.
5. Add risk and release labels only when relevant.

### Project Fields

Use Project fields for workflow state and planning.

- Status: Backlog, Ready, In Progress, In Review, Blocked, Done, Icebox
- Priority: P0 Critical, P1 High, P2 Normal, P3 Low
- Size: XS, S, M, L, XL
- Risk: None, Breaking, Migration, Security, Performance, Experimental
- Release Impact: None, Patch, Minor, Major, Blocker, Skip Notes

### PR Expectations

1. PRs should have type, area, and size labels.
2. Set Project Status to In Review while review is active.
3. Use release labels when changelog or version impact exists.
4. Move Project Status to Done after merge.

### Do Not

- Do not use todo, in progress, or done labels for normal workflow state.
- Do not apply multiple type labels.
- Do not duplicate routine state in both labels and Project Status.
```
