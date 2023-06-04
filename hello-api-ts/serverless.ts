import { AWS } from "@serverless/typescript";

const config: AWS = {
  service: "hello-api-ts",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "ap-northeast-2",
    httpApi: {
      metrics: true, // api gateway metrics
    },
  },
  functions: {
    hello: {
      handler: "handler.hello",
      events: [
        {
          httpApi: {
            path: "/hello",
            method: "get",
          },
        },
      ],
    },
  },
  plugins: ["serverless-webpack"],
};

export = config;
