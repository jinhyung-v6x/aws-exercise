import { AWS } from "@serverless/typescript";
import resources from "./s3-cloudfront";

const config: AWS = {
  service: "photo-optimizer-api-try",
  frameworkVersion: "3",
  provider: {
    iam: {
      role: {
        statements: [
          {
            Action: ["s3:PutObject", "s3:GetObject"],
            Effect: "Allow",
            Resource: `arn:aws:s3:::${process.env.BUCKET_NAME}/*`,
          },
        ],
      },
    },
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    environment: {
      BUCKET_NAME: process.env.BUCKET_NAME!,
      ROOT_DOMAIN: process.env.ROOT_DOMAIN!,
      SUB_DOMAIN: process.env.SUB_DOMAIN!,
    },
  },
  functions: {
    optimizeAndUpload: {
      handler: "handler.optimizeAndUpload",
      events: [
        {
          httpApi: {
            path: "/optimizeAndUpload",
            method: "put",
          },
        },
      ],
    },
  },
  plugins: ["serverless-plugin-scripts", "serverless-webpack"],
  custom: {
    scripts: {
      hooks: {
        "webpack:package:packageModules":
          "cp jpegoptim.tar.gz .webpack/service",
      },
    },
  },
  resources,
};

export = config;
