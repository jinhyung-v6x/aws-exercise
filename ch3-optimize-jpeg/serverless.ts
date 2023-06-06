import { AWS } from "@serverless/typescript";
import resources from "./s3-cloudfront";

const NOT_EXISTING_ENV = "NOT_EXISTING_ENV";

const config: AWS = {
  service: "photo-optimizer-api",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
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
      environment: {
        BUCKET_NAME: process.env.BUCKET_NAME || NOT_EXISTING_ENV,
      },
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
