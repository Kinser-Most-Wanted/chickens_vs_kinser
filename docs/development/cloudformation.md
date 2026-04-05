# CloudFormation and AWS Deployment

This project uses CloudFormation to manage AWS infrastructure for the site.

## What CloudFormation creates

The deployment stack creates:

- an S3 bucket for site files
- a CloudFront Origin Access Control (OAC)
- an S3 bucket policy allowing CloudFront to read from the bucket
- a CloudFront distribution in front of the bucket

## Why CloudFormation is used

CloudFormation gives us:

- repeatable infrastructure
- version-controlled infrastructure
- easy environment creation
- easy teardown of preview environments

Instead of manually creating AWS resources, the project defines them in a template and deploys them as a stack.

## Stack naming

The stack name identifies the environment:

- `chickens-vs-kinser`
- `chickens-vs-kinser-stage`
- `chickens-vs-kinser-pr-<pr-number>`

That stack name is also used to derive the S3 bucket name and related resource names.

## Deployment flow

The deploy script does the following:

1. Deploys or updates the CloudFormation stack
2. Reads stack outputs
3. Uploads the site files to S3
4. Creates a CloudFront invalidation so new content is served

## Teardown flow

The destroy script does the following:

1. Looks up the bucket from the stack outputs
2. Deletes all objects, versions, and delete markers from the versioned bucket
3. Deletes the CloudFormation stack
4. Waits for stack deletion to complete

## Why the bucket must be emptied first

The S3 bucket is versioned.

Because of that, deleting current objects is not enough. All versions and delete markers must also be removed before the stack can be deleted successfully.

The destroy script handles that automatically.

## Security model

The site is public through CloudFront, but the S3 bucket itself is not public.

CloudFront accesses the bucket using Origin Access Control (OAC), which keeps direct bucket access restricted.
