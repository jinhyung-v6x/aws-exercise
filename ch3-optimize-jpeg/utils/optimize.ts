import * as tar from "tar";
import * as fs from "fs";

const JPEG_OPTIM_PATH = "/tmp/bin/jpegoptim";
const JPEG_OPTIM_PACK_FILE = "jpegoptim.tar.gz";

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
