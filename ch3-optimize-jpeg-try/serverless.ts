import { AWS } from "@serverless/typescript";

const config: AWS = {
  service: "photo-optimizer-api-try",
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
};

export = config;
