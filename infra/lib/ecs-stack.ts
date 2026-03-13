import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class EcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─── VPC ────────────────────────────────────────────────────────────────
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    // ─── ECR Repository ─────────────────────────────────────────────────────
    const repository = new ecr.Repository(this, 'ApiRepository', {
      repositoryName: 'technical-test-api',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // ─── Secrets Manager ────────────────────────────────────────────────────
    const jwtSecret = new secretsmanager.Secret(this, 'JwtSecret', {
      secretName: 'technical-test/jwt-secret',
      description: 'JWT secret for the NestJS API',
      generateSecretString: {
        excludePunctuation: true,
        passwordLength: 64,
      },
    });

    const mongodbUri = new secretsmanager.Secret(this, 'MongodbUri', {
      secretName: 'technical-test/mongodb-uri',
      description: 'MongoDB Atlas connection string',
    });

    // ─── CloudWatch Log Group ────────────────────────────────────────────────
    const logGroup = new logs.LogGroup(this, 'ApiLogGroup', {
      logGroupName: '/technical-test/api',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ─── ECS Cluster ─────────────────────────────────────────────────────────
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      clusterName: 'technical-test-cluster',
    });

    // ─── Task Definition ─────────────────────────────────────────────────────
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    // Grant task role to read secrets
    jwtSecret.grantRead(taskDefinition.taskRole);
    mongodbUri.grantRead(taskDefinition.taskRole);

    // ─── Container ───────────────────────────────────────────────────────────
    const container = taskDefinition.addContainer('ApiContainer', {
      image: ecs.ContainerImage.fromEcrRepository(repository),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'api',
        logGroup,
      }),
      environment: {
        NODE_ENV: 'production',
        API_PORT: '3000',
      },
      secrets: {
        JWT_SECRET: ecs.Secret.fromSecretsManager(jwtSecret),
        MONGODB_URI: ecs.Secret.fromSecretsManager(mongodbUri),
      },
      healthCheck: {
        command: [
          'CMD-SHELL',
          'wget -qO- http://localhost:3000/health || exit 1',
        ],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    container.addPortMappings({ containerPort: 3000 });

    // ─── Security Groups ──────────────────────────────────────────────────────
    const albSg = new ec2.SecurityGroup(this, 'AlbSg', {
      vpc,
      description: 'ALB security group',
      allowAllOutbound: true,
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');

    const serviceSg = new ec2.SecurityGroup(this, 'ServiceSg', {
      vpc,
      description: 'ECS service security group',
      allowAllOutbound: true,
    });
    serviceSg.addIngressRule(albSg, ec2.Port.tcp(3000), 'From ALB');

    // ─── ALB ─────────────────────────────────────────────────────────────────
    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
      loadBalancerName: 'technical-test-alb',
    });

    const listener = alb.addListener('HttpListener', { port: 80, open: true });

    // ─── ECS Service ──────────────────────────────────────────────────────────
    const service = new ecs.FargateService(this, 'ApiService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
      securityGroups: [serviceSg],
      serviceName: 'technical-test-api',
    });

    listener.addTargets('ApiTarget', {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.seconds(30),
        healthyHttpCodes: '200',
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    // ─── Outputs ──────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `http://${alb.loadBalancerDnsName}`,
      description: 'API URL',
    });

    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: repository.repositoryUri,
      description: 'ECR Repository URI',
    });

    new cdk.CfnOutput(this, 'EcsClusterName', {
      value: cluster.clusterName,
      description: 'ECS Cluster name',
    });

    new cdk.CfnOutput(this, 'EcsServiceName', {
      value: service.serviceName,
      description: 'ECS Service name',
    });
  }
}
