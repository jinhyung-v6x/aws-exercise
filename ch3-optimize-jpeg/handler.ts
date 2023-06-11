import * as crypto from "crypto";
import * as fs from "fs";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import "source-map-support/register";
import {
  getCdnDomainName,
  optimize,
  s3Exists,
  unpackJpegOptim,
  uploadJpeg,
} from "./utils";

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
  const fileName = `${hash}.jpeg`;
  const filePath = `/tmp/${hash}.jpg`;
  try {
    const domainName = getCdnDomainName();
    const cdnUrl = `${domainName}/${fileName}`;
    if (await s3Exists(process.env.BUCKET_NAME, fileName)) {
      return { cdnUrl };
    }

    fs.writeFileSync(filePath, buffer);
    // optimize
    await unpackJpegOptim();
    await optimize(filePath);
    //upload
    await uploadJpeg(filePath, fileName);

    return { cdnUrl };
  } finally {
    await new Promise((res) => fs.unlink(filePath, res)).catch(console.error);
  }
};
