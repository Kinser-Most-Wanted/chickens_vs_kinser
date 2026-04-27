# AGENTS.md

## Purpose

This file gives AI coding agents project-specific guidance for working in `chickens_vs_kinser`. Use it to avoid generic assumptions and to stay aligned with this repo's code, workflow, and team expectations.

## Project Summary

- `chickens_vs_kinser` is a static browser game project.
- The app is served directly from `src/` and deployed as static assets.
- Frontend logic should be written in TypeScript.
- Quality checks use ESLint and Playwright.
- Deployment uses GitHub Actions, CloudFormation, S3, and CloudFront.

## Current Repo Reality

- The implementation is still early-stage.
- `src/index.html` is currently minimal.
- `src/ts/tmp.ts` is currently empty.
- Several repo docs describe intended process and future functionality beyond what is already implemented.

Treat docs as intent, but verify actual behavior from the code before making claims or refactors.

## Product Direction

Use `docs/game_features.md` as the main product-direction reference. The intended game direction is a lane-based defense game in the style of Plants vs. Zombies, including concepts such as:

- enemy waves
- lane-based combat
- multiple unit types
- resource and currency systems
- restart, pause, and fast-forward controls
- unlocks, progression, and save behavior

Unless the user requests otherwise, keep new work aligned with that direction.

## Important Paths

- `src/` - static app source
- `src/index.html` - entry HTML
- `src/ts/` - TypeScript source files
- `tests/` - Playwright tests
- `deploy/` - infrastructure template and deploy/destroy scripts
- `docs/` - team standards and process documentation
- `pbis/` - sprint planning and backlog artifacts
- `package.json` - project commands and dev dependencies
- `playwright.config.ts` - Playwright server/test setup

## Tooling And Commands

Package manager: `pnpm`

Primary commands:

```bash
pnpm install
pnpm run serve
pnpm run lint
pnpm run test:e2e
pnpm run test:e2e:ui
pnpm exec playwright install chromium
```

Notes:

- `pnpm run serve` serves `src/` on port `3000`.
- Playwright uses `http://127.0.0.1:3000`.
- `playwright.config.ts` starts the local server automatically during tests.
- Linting currently targets `src/**/*.ts`.

## Coding Standards

These standards are derived from `docs/coding_standards.md`, adjusted to match the actual repo state.

### General Principles

- Prefer simple solutions over complex ones unless complexity is justified.
- Keep changes readable, consistent, and limited in scope.
- Favor modular code where it helps comprehension and maintenance.

### Language Standards

- Write application logic in TypeScript.
- Avoid introducing new plain JavaScript for app logic unless there is a clear reason.
- Use types and interfaces when they improve clarity.
- Avoid `any` unless there is no practical alternative.

### Naming

- Use descriptive variable names such as `playerPosition`, `currentWave`, or `enemySpawnTimer`.
- Use function names that describe behavior such as `spawnEnemy`, `updateScore`, or `handleTouchInput`.
- Use clear type and interface names such as `PlayerState`, `EnemyConfig`, or `GameSettings`.
- Avoid vague names like `x`, `stuff`, `tempValue`, or `thing`.

### Conditionals And Functions

- Use strict equality operators: `===` and `!==`.
- Prefer readable conditionals over deeply nested logic.
- Prefer early returns when they simplify control flow.
- Keep functions focused on one job.
- Keep functions reasonably small with clear inputs and outputs.
- Avoid unnecessary side effects.

### Separation Of Concerns

- Keep rendering, input handling, state updates, and storage logic separate where practical.
- If new gameplay systems are added, avoid mixing DOM manipulation, game rules, and persistence in one large function.

### Comments

- Comment to explain why a decision exists, not what obvious code is doing.
- Good comments explain intent, edge cases, workarounds, or tradeoffs.
- Do not leave outdated comments behind.

### File Organization

- Keep source files under `src/`.
- Keep tests under `tests/`.
- If new structure is introduced, stay compatible with a static-hosted browser app.

### Formatting And Linting

- The docs mention Prettier, but the current root project does not include a Prettier setup.
- Do not assume Prettier is available unless the task adds it explicitly.
- ESLint is the active enforced code-quality tool today.
- Code should pass linting before review.
- Do not disable lint rules casually.

## Testing Standards

These expectations come from the current repo and the testing docs.

- Run `pnpm run lint` for code changes affecting `src/**/*.ts`.
- Run `pnpm run test:e2e` for changes affecting visible behavior, navigation, or gameplay flow.
- Playwright is used as smoke/end-to-end validation against the local served app.
- Prefer tests that verify user-visible behavior rather than implementation details.

If you cannot run tests, say so explicitly in the handoff and explain why.

## Definition Of Done

This section is based on `docs/definition_of_done.md`.

A feature is considered done only when all of the following are true:

- it accomplishes the intended goal
- automated testing passes
- it receives two peer reviews on the feature branch
- it is tested in an actual environment
- it is reviewed again in `stage` before going to `main`

Expanded meaning:

- "Accomplishes the goal" means the implementation matches the agreed requirement and is not partially complete in a way that misses core behavior.
- "Automated testing passes" means existing project checks are passing; do not bypass them just to merge.
- "Two peer reviews" means two humans have reviewed the feature branch and feedback has been addressed.
- "Tested in an actual environment" means the behavior has been exercised in a real running app, not only reasoned about from code.
- "Reviewed again in `stage`" means the feature still behaves correctly after integration with other work.

What does not count as done:

- code exists but the feature is incomplete
- code works only on one machine
- code was reviewed only once
- local testing happened but automated checks fail
- the feature works in isolation but was not validated after integration

AI agents cannot satisfy the human review requirements. Always call out remaining human steps explicitly.

## Source Control Workflow

This section summarizes `docs/source_control.md`.

- `main` is the stable, release-ready branch.
- `stage` is the sprint integration branch.
- feature branches should be created from `stage`.
- feature branches should be squash merged back into `stage`.
- `stage` is squash merged into `main` for release.

Branch naming guidance:

- use lowercase
- use clear prefixes such as `feature/`, `bugfix/`, or `chore/`
- separate words with hyphens
- keep one branch focused on one logical change

Commit guidance:

- keep commits small and understandable
- keep each commit focused on one logical change
- use descriptive commit messages
- avoid commit messages like `update`, `changes`, or `fix things`

Pull request expectations:

- explain what changed
- explain why it changed
- explain how it was tested
- mention known limitations or follow-up work

Unless the user says otherwise, assume new feature work should target `stage`.

## Deployment Model

AWS infrastructure is defined in `deploy/deploy.yml`.

The stack creates:

- a versioned private S3 bucket
- a CloudFront distribution
- a CloudFront Origin Access Control
- a bucket policy allowing CloudFront to read from the bucket

Environment naming:

- `main` -> `chickens-vs-kinser`
- `stage` -> `chickens-vs-kinser-stage`
- PRs -> `chickens-vs-kinser-pr-<pr-number>`

Implications for code changes:

- do not hardcode environment-specific bucket names or URLs
- be careful when changing asset paths
- remember the site is delivered as static files behind CloudFront
- `403` and `404` responses are routed to `/index.html`, so static routing assumptions matter

If you change deployment or infrastructure files, explain the AWS impact clearly in your handoff.

## Documentation Hierarchy

When guidance conflicts, use this order:

1. Current user request
2. Actual code and configuration in the repo
3. `AGENTS.md`
4. Repo docs in `docs/`
5. Sprint/PBI artifacts in `pbis/`

## Known Inconsistencies

- `docs/coding_standards.md` references Prettier and Docker-based testing, but the current root project does not define those workflows.
- The documented feature set is much larger than the current implementation.
- `README.md` is currently only a placeholder.

Do not assume missing tooling or architecture exists. Add only what the task actually requires.

## Guidance For Future Agents

- Inspect the repo before making architectural claims.
- Prefer focused changes over speculative scaffolding.
- Keep new code compatible with a static browser-hosted app.
- If you add gameplay state, think through browser persistence carefully because save behavior is part of the planned product.
- If you add tests, validate visible behavior.
- If you touch deployment files, call out risk explicitly.
- If a task depends on docs rather than code, say when you are inferring intent from project documentation.

## Handoff Checklist

In your final response, include:

- what changed
- whether lint was run
- whether Playwright was run
- any remaining manual validation needed
- any remaining human review steps needed for Definition of Done
- any follow-up risks, especially for gameplay state or deployment changes
