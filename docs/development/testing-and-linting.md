# Testing and Linting

This project uses ESLint for code quality checks and Playwright for end-to-end browser testing.

## ESLint

ESLint checks the code in `src/` for common mistakes and style issues.

Current linting scope:
- `src/**/*.ts`

Linting helps catch things like:
- unused variables
- invalid code patterns
- common mistakes before runtime

Run locally with:

```bash
pnpm run lint
```

## Playwright

Playwright runs real browser tests against the app.

It is used here as a smoke/end-to-end testing tool to make sure the site loads and important user flows work.

Examples of things Playwright can test:
- page loads successfully
- buttons work
- game starts correctly
- score updates
- restart works

Run locally with:

```bash
pnpm run test:e2e
```

Playwright uses a local web server defined in `playwright.config.ts`, so the app is started automatically when tests run.

For more information on playwright visit https://playwright.dev/docs/writing-tests

## Why we use both

ESLint and Playwright solve different problems.

### ESLint
Checks code structure before runtime.

### Playwright
Checks actual runtime behavior in a browser.

Using both gives us better confidence:
- lint catches code issues early
- tests verify the app still works from a user perspective

## Local workflow

A typical local workflow is:

```bash
pnpm install
pnpm run lint
pnpm run test:e2e
```

## CI workflow

In GitHub Actions:

1. Lint runs
2. Tests run
3. Deployment only happens if both pass
