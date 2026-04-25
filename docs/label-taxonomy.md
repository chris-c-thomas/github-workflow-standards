# Label Taxonomy

## Convention

Use lowercase, prefix-based labels:

```txt
type:feature
area:frontend
priority:p1
size:m
risk:breaking
release:minor
status:blocked
```

## Usage rules

1. Apply exactly one `type:*` label to every issue or PR.
2. Apply one or more `area:*` labels when the affected surface is clear.
3. Apply `priority:*` primarily to issues; use it on PRs only when the PR itself is urgent.
4. Apply `size:*` primarily to PRs, but it can also estimate issue complexity.
5. Apply `risk:*` only when the change has operational, compatibility, data, performance, or security implications.
6. Apply `release:*` only when the work affects versioning, changelogs, migration notes, or release planning.
7. Avoid labels such as `todo`, `in-progress`, and `done`; those belong in GitHub Projects.
8. Use `status:*` labels only for exceptional states that should be visible across list views.

## Type labels

| Label | Meaning |
|---|---|
| `type:feature` | New user-facing or developer-facing capability. |
| `type:bug` | Incorrect behavior, regression, runtime failure, or broken expectation. |
| `type:docs` | Documentation, guides, READMEs, examples, or comments. |
| `type:refactor` | Internal restructuring without intended behavior change. |
| `type:chore` | Maintenance that does not fit another type. |
| `type:test` | Unit, integration, e2e, fixture, or test infrastructure work. |
| `type:ci` | CI/CD, GitHub Actions, release automation, or build pipeline work. |
| `type:deps` | Dependency updates, lockfile changes, package manager maintenance. |
| `type:release` | Versioning, changelog, publishing, packaging, or release preparation. |
| `type:security` | Security fix, hardening, vulnerability remediation, or auth-related control. |

## Area labels

| Label | Meaning |
|---|---|
| `area:frontend` | Browser UI, React, Next.js, routing, client state, or frontend behavior. |
| `area:backend` | Server runtime, services, workers, controllers, or server-side business logic. |
| `area:api` | Public or internal API contracts, OpenAPI specs, clients, schemas, or endpoints. |
| `area:data` | Data models, databases, migrations, indexing, search, ETL, or persistence. |
| `area:infra` | Hosting, deployment, containers, networking, IaC, observability, or ops. |
| `area:auth` | Authentication, authorization, sessions, tokens, permissions, or identity. |
| `area:ui` | Styling, design system, accessibility, layout, components, or visual polish. |
| `area:docs` | Documentation site, generated docs, examples, API docs, or reference content. |
| `area:cli` | CLI commands, terminal UX, command parsing, local scripts, or developer tooling. |
| `area:ai` | LLMs, agents, RAG, evals, prompts, MCP, embeddings, or AI integrations. |

## Priority labels

| Label | Meaning |
|---|---|
| `priority:p0` | Critical; blocks production, release, security, or core usage. |
| `priority:p1` | High priority; important and should be addressed soon. |
| `priority:p2` | Normal priority; valuable but not urgent. |
| `priority:p3` | Low priority; nice-to-have, cleanup, or opportunistic work. |

## Size labels

| Label | Meaning |
|---|---|
| `size:xs` | Trivial change; usually under 30 minutes or very small diff. |
| `size:s` | Small change; narrow scope and low review complexity. |
| `size:m` | Medium change; moderate scope, normal review effort. |
| `size:l` | Large change; broad scope, multiple files, or higher review burden. |
| `size:xl` | Very large change; should likely be split before merge. |

## Risk labels

| Label | Meaning |
|---|---|
| `risk:breaking` | Breaking API, schema, behavior, CLI, config, or compatibility change. |
| `risk:migration` | Requires migration, backfill, deployment sequencing, or manual operator action. |
| `risk:security` | Affects security posture, secrets, permissions, auth, or sensitive data. |
| `risk:performance` | Meaningfully affects latency, throughput, memory, bundle size, or cost. |
| `risk:experimental` | Prototype, exploratory, unstable, or intentionally subject to change. |

## Release labels

| Label | Meaning |
|---|---|
| `release:major` | Candidate for a major version bump or breaking release notes. |
| `release:minor` | Candidate for a minor version bump or feature release notes. |
| `release:patch` | Candidate for a patch release, hotfix, or bugfix release notes. |
| `release:blocker` | Must be resolved before the next release can ship. |
| `release:skip-notes` | Does not need changelog or release note coverage. |

## Status labels

Status labels are intentionally limited because GitHub Projects should handle routine workflow state.

| Label | Meaning |
|---|---|
| `status:needs-triage` | Needs initial classification, priority, owner, or reproduction details. |
| `status:needs-info` | Waiting on more information before the work can proceed. |
| `status:blocked` | Blocked by dependency, decision, access, upstream issue, or external constraint. |
| `status:ready` | Ready to implement or review; no known blocker. |
| `status:wontfix` | Intentionally not planned or not appropriate for this repository. |

## Community and backlog labels

| Label | Meaning |
|---|---|
| `good-first-issue` | Small, well-contained task suitable for onboarding or a low-risk contribution. |
| `help-wanted` | External input, review, design feedback, or contribution would be useful. |
| `question` | Question, clarification, investigation, or open design discussion. |
| `duplicate` | Duplicate of another issue or PR. |
| `invalid` | Not reproducible, out of scope, malformed, or not actionable. |
