import * as crypto from "crypto";
import * as fs from "fs";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import "source-map-support/register";
import { optimize, unpackJpegOptim } from "./utils/optimize";

export const optimizeAndUpload: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body || !event.isBase64Encoded) {
    return {
      statusCode: 400,
    };
  }
  // decode requested binary data
  const buffer = Buffer.from(event.body, "base64");
  // write file to /tmp
  const hash = crypto.createHash("md5").update(buffer).digest("hex");
  const filePath = `/tmp/${hash}.jpg`;
  fs.writeFileSync(filePath, buffer);
  try {
    await unpackJpegOptim();
    await optimize(filePath);
    return { cdnUrl: "CDN_URL" };
  } finally {
    fs.unlinkSync(filePath);
  }
};
