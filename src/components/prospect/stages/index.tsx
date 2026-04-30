'use client';

import type { ReactElement } from 'react';
import type { Vendor } from '@/lib/prospect/vendors';
import type { StageProps } from './types';
import { DatadogStage } from './datadog-stage';
import { SentryStage } from './sentry-stage';
import { FigmaStage } from './figma-stage';
import { SnykStage } from './snyk-stage';
import { SnowflakeStage } from './snowflake-stage';
import { GitHubStage } from './github-stage';
import { GitLabStage } from './gitlab-stage';
import { AwsStage } from './aws-stage';
import { DatabricksStage } from './databricks-stage';
import { JiraStage } from './jira-stage';
import { SlackStage } from './slack-stage';
import { OktaStage } from './okta-stage';
import { MongoDbStage } from './mongodb-stage';
import { ZscalerStage } from './zscaler-stage';
import { DefaultStage } from './default-stage';

const REGISTRY: Record<string, (props: StageProps) => ReactElement> = {
  datadog: DatadogStage,
  sentry: SentryStage,
  figma: FigmaStage,
  snyk: SnykStage,
  snowflake: SnowflakeStage,
  github: GitHubStage,
  gitlab: GitLabStage,
  aws: AwsStage,
  databricks: DatabricksStage,
  jira: JiraStage,
  slack: SlackStage,
  okta: OktaStage,
  mongodb: MongoDbStage,
  zscaler: ZscalerStage,
};

export function VendorStage({ vendor, ...rest }: StageProps & { vendor: Vendor }) {
  const Component = REGISTRY[vendor.id];
  if (!Component) {
    return <DefaultStage vendor={vendor} {...rest} />;
  }
  return <Component {...rest} />;
}
