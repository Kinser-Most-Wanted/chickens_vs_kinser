# GitHub Actions

This project uses GitHub Actions to automate linting, testing, deployment, and teardown.

## Workflows

### `ci-cd.yml`

This is the main workflow that coordinates the pipeline.

It runs on:
- pull requests: `opened`, `synchronize`, `reopened`, `closed`
- pushes to `main`
- pushes to `stage`

### `lint.yml`

Runs ESLint against the TypeScript source code in `src/`.

### `test.yml`

Runs Playwright end-to-end tests against the app.

### `deploy.yml`

Determines the correct AWS stack name and runs the deployment script.

### `destroy.yml`

Determines the PR stack name and destroys the preview stack when a PR is closed or merged.

## Pipeline behavior

### Pull requests

When a pull request is opened, updated, or reopened:

1. Lint runs
2. Tests run
3. If both pass, the PR preview stack is deployed

When a pull request is closed or merged:

1. The PR preview stack is destroyed

### Main branch

When code is pushed to `main`:

1. Lint runs
2. Tests run
3. Production stack is deployed

### Stage branch

When code is pushed to `stage`:

1. Lint runs
2. Tests run
3. Stage stack is deployed

## AWS authentication

GitHub Actions authenticates to AWS using OIDC and an IAM role.

This means:
- no long-lived AWS keys are stored in GitHub secrets
- GitHub requests a short-lived token
- AWS allows that token to assume the deploy role

The role ARN is stored in the repo variable:

- `DEPLOY_ROLE`

## Concurrency

Deploy and destroy jobs use concurrency control so multiple runs for the same PR or branch do not overlap.

This helps prevent:
- two deploys racing against the same stack
- deploy and destroy running at the same time for the same PR
