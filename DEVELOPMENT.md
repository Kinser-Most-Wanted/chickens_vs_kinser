# Chickens vs Kinser

This project is a small web game built with TypeScript and deployed to AWS using GitHub Actions and CloudFormation.

This document is the main starting point for anyone working on the project locally.

## What this project uses

- TypeScript for application code
- pnpm for package management
- ESLint for linting
- Playwright for end-to-end testing
- GitHub Actions for CI/CD
- CloudFormation for AWS infrastructure
- S3 + CloudFront for hosting

## What you need installed

To work on this project locally, make sure you have:

- Git
- Node.js (required for project tooling such as pnpm, Playwright, ESLint, and local scripts)
- pnpm
- a web browser
- a code editor or IDE of your choice

This project is editor-agnostic. You can use any editor or IDE you prefer as long as you can:
- edit TypeScript, HTML, and CSS files
- run terminal commands
- work with Git

## Project structure

Important directories and files:

- `src/` — application source files
- `tests/` — Playwright tests
- `deploy/` — deployment and teardown scripts plus CloudFormation templates
- `.github/workflows/` — CI/CD workflows
- `package.json` — scripts and project dependencies
- `tsconfig.json` — TypeScript configuration
- `eslint.config.js` — ESLint configuration
- `playwright.config.ts` — Playwright configuration

## Local setup

Install dependencies:

```bash
pnpm install
```

Install the Playwright browser used for testing:

```bash
pnpm exec playwright install chromium
```

## Common development commands

Run linting:

```bash
pnpm run lint
```

Run end-to-end tests:

```bash
pnpm run test:e2e
```

Serve the app locally:

```bash
pnpm run serve
```

## Recommended local workflow

A typical workflow for making changes is:

1. Pull the latest changes
2. Create or switch to your branch
3. Run `pnpm install` if dependencies changed
4. Run the app locally with `pnpm run serve`
5. Make your changes
6. Refresh the browser to verify them locally
7. Run `pnpm run lint`
8. Run `pnpm run test:e2e`
9. Commit and open a pull request

## Testing

This project uses Playwright for browser-based testing.

Playwright is used to verify that the app loads and that important user-facing behavior works correctly.

Write tests in:

- `tests/`

Run tests locally with:

```bash
pnpm run test:e2e
```

Reference:
- https://playwright.dev/docs/writing-tests

## Linting

This project uses ESLint to check source code quality.

Linting currently targets the TypeScript source files in `src/`.

Run linting with:

```bash
pnpm run lint
```

Linting helps catch:
- invalid code patterns
- unused variables
- common mistakes before runtime

## Branch and deployment behavior

The project uses different stack names depending on where deployment comes from:

- `main` -> `chickens-vs-kinser`
- `stage` -> `chickens-vs-kinser-stage`
- PRs -> `chickens-vs-kinser-pr-<pr-number>`

This allows pull requests to get their own preview environment without affecting shared environments.

## CI/CD overview

Deployments are handled through GitHub Actions and CloudFormation.

Behavior:

- PR opened, updated, or reopened -> lint, test, and deploy PR preview stack
- PR closed or merged -> destroy PR preview stack
- Push to `main` -> deploy production stack
- Push to `stage` -> deploy stage stack

## Infrastructure overview

AWS infrastructure is managed through CloudFormation.

The deployment stack creates:

- an S3 bucket for the site
- a CloudFront distribution
- CloudFront Origin Access Control
- a bucket policy allowing CloudFront to access the bucket

Teardown is also handled through scripts in `deploy/`, including cleanup of versioned bucket contents before stack deletion.

## Additional documentation

More detailed project docs are available in the `docs/` folder.
