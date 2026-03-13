#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EcsStack } from '../lib/ecs-stack';

const app = new cdk.App();

new EcsStack(app, 'TechnicalTestStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION ?? 'us-east-1',
  },
  description: 'Technical Test — NestJS API on ECS Fargate + Atlas MongoDB',
});
