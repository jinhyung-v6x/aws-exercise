import * as tar from "tar";
import * as fs from "fs";
import * as childProcess from "child_process";
import * as AWS from "aws-sdk";
import { error } from "console";

const JPEG_OPTIM_PATH = "/tmp/bin/jpegoptim";
const JPEG_OPTIM_PACK_FILE = "jpegoptim.tar.gz";
const s3 = new AWS.S3();

export const unpackJpegOptim = async () => {
  return new Promise<void>((resolve, reject) => {
    if (fs.existsSync(JPEG_OPTIM_PATH)) {
      return resolve();
    }

    fs.createReadStream(JPEG_OPTIM_PACK_FILE)
      .pipe(
        tar
          .x({
            strip: 1,
            C: "/tmp",
          })
          .on("error", reject)
          .on("close", resolve)
      )
      .on("error", reject);
  });
};

export const optimize = async (filePath: string) => {
  childProcess.execSync(`${JPEG_OPTIM_PATH} -o -s -m80 ${filePath}`);
};

export const uploadJpeg = async (filePath: string, fileName: string) => {
  return s3
    .upload({
      Bucket: process.env.BUCKET_NAME!,
      Key: fileName,
      Body: fs.createReadStream(filePath),
      ContentType: "image/jpeg",
    })
    .promise();
};

export const getCdnDomainName = () =>
  `https://${process.env.SUB_DOMAIN}.${process.env.ROOT_DOMAIN}`;

export const s3Exists = async (bucketName: string | undefined, key: string) => {
  if (bucketName === undefined) {
    return false;
  }
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
