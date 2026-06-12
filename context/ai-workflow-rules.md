# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. The context files — `project-overview.md`, `architecture.md`, `ui-context.md`, and `code-standards.md` — define what to build, how to build it, and the constraints it must respect. Always implement against these specs. Do not infer or invent behavior, tools, routes, or UI that are not described in them. When something is unclear, resolve it in the spec first, then implement.

## Scoping Rules

- Work on one feature unit at a time — typically one tool, or one piece of shared shell (registry, navbar, palette, theme system).
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step (e.g. the canvas pipeline and the command palette are separate units).
- Build foundations before consumers: the tool registry and theme/token system come before the landing page, which comes before individual tool pages.

## When to Split Work

Split an implementation step if it combines:

- Shared infrastructure changes (registry, canvas pipeline, theme tokens) with feature UI in the same step.
- Multiple unrelated tools or routes at once.
- Behavior not clearly defined in the context files.
- Both light/dark theme system work and a new tool's logic together.

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files (no new tools, no shareable links, no backend, no accounts).
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing — do not guess.
- If a request would violate an invariant in `architecture.md` (e.g. uploading an image to a server), stop and flag it rather than implementing it.

## Protected Files

Do not modify the following unless explicitly instructed:

- `src/components/ui/*` — shadcn/ui generated components; extend via composition, regenerate via the CLI, don't hand-edit.
- Any third-party library internals, including the `@imgly/background-removal` model files.
- Lockfiles and generated build output.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries → `architecture.md`
- Storage model decisions (localStorage keys/shapes) → `architecture.md`
- Color/spacing/type/sizing tokens or layout patterns → `ui-context.md`
- Code conventions or standards → `code-standards.md`
- Feature scope, tools, or routes → `project-overview.md`
- Whenever a new tool is added, update the registry AND `project-overview.md`'s feature list in the same step.

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope, in both light and dark themes.
2. No invariant defined in `architecture.md` was violated (no server calls, no image leaves the browser, registry is the single source of truth).
3. The UI matches the scales in `ui-context.md` — tokens only, no hardcoded values.
4. `progress-tracker.md` reflects the completed work and any new open questions.
5. `npm run build` passes with no type errors.
