import { AWS } from "@serverless/typescript";

const config: AWS = {
  service: "photo-optimizer-api",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    // httpApi: {
    //   metrics: true, // api gateway metrics
    // },
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
  plugins: ["serverless-webpack"],
};

export = config;
