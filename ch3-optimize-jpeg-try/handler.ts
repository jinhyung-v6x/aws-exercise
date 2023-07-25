import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import * as crypto from "crypto";
import * as fs from "fs";
import * as tar from "tar";
import * as childProcess from "child_process";
import * as AWS from "aws-sdk";

const s3 = new AWS.S3();
const jpegoptimPath = "/tmp/bin/jpegoptim";
const jpegoptimPackFile = "jpegoptim.tar.gz";

export const optimizeAndUpload: APIGatewayProxyHandlerV2 = async (event) => {
  // not normal request
  if (!event.body || !event.isBase64Encoded) {
    return {
      statusCode: 400,
    };
  }
  // decode uploaded binary
  const buffer = Buffer.from(event.body, "base64");
  // generate hash from binary to use as file name
  const hash = crypto.createHash("md5").update(buffer).digest("hex");
  const resultKey = `${hash}.jpg`;
  const cdnURL = `https:/${process.env.SUB_DOMAIN}.${process.env.ROOT_DOMAIN}/${resultKey}`;
  const filePath = `/tmp/${hash}.jpg`;
  try {
    if (await s3Exists(process.env.BUCKET_NAME!, resultKey)) {
      return { cdnURL };
    }
    fs.writeFileSync(filePath, buffer);
    // optimize and upload to S3
    await unpackJpegoptim();
    childProcess.execSync(`${jpegoptimPath} -o -s -m80 ${filePath}`);
    await s3
      .upload({
        Bucket: process.env.BUCKET_NAME!,
        Key: `${hash}.jpg`,
        Body: fs.createReadStream(filePath),
        ContentType: "image/jpeg",
      })
      .promise();
    return {
      cdnURL,
    };
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const unpackJpegoptim = async () => {
  return new Promise<void>((resolve, reject) => {
    if (fs.existsSync(jpegoptimPath)) {
      resolve();
      return;
    }
    fs.createReadStream(jpegoptimPackFile)
      .pipe(
        tar.x({ strip: 1, C: "/tmp" }).on("error", reject).on("close", resolve)
      )
      .on("error", reject);
  });
};

const s3Exists = async (bucketName: string, key: string) => {
  try {
    await s3
      .headObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();
    return true;
  } catch (error: any) {
    if (error.code === "Forbidden") {
      return false;
    }
    throw error;
  }
};
