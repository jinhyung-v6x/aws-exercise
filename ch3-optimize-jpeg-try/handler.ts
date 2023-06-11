import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import * as crypto from "crypto";
import * as fs from "fs";
import * as tar from "tar";
import * as childProcess from "child_process";

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
  const filePath = `/tmp/${hash}.jpg`;
  fs.writeFileSync(filePath, buffer);
  try {
    // optimize and upload to S3
    childProcess.execSync(`${jpegoptimPath} -o -s -m80 ${filePath}`);
    return { cdnURL: "CDN-URL" };
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const jpegoptimPath = "/tmp/bin/jpegoptim";
const jpegoptimPackFile = "jpegoptim.tar.gz";

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
