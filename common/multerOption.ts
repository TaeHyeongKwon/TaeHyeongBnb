import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { BadRequestException } from '@nestjs/common';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as AWSMock from 'mock-aws-s3';

const accessKeyId = process.env.KTH_ACCESKEYID;
const secretAccessKey = process.env.KTH_SECRETKEYID;
let bucket = process.env.KTH_S3_BUCKET_NAME;

const s3 = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const fileFilter = (req, file, callback) => {
  const fileTypes = file.mimetype.split('/')[0];
  if (fileTypes === 'image') callback(null, true);
  else callback(new BadRequestException('이미지 형식 아님'), false);
};

const storage = () => {
  if (process.env.NODE_ENV === 'test') {
    //   return multer.memoryStorage();
    AWSMock.config.basePath = './testS3';
    const params = { Bucket: 'testBucket' };
    const mockS3 = new AWSMock.S3({ params });

    mockS3.createBucket(params, function (err) {
      if (err) {
        console.error(err);
      }
    });

    bucket = params.Bucket;

    return multerS3({
      s3: mockS3 as unknown as S3Client & AWSMock.S3,
      bucket,
      acl: 'public-read',
      key(req, file, callback) {
        callback(null, `nest-project/${Date.now() + file.originalname}`);
      },
    });
  }

  return multerS3({
    s3,
    bucket,
    acl: 'public-read',
    key(req, file, callback) {
      callback(null, `nest-project/${Date.now() + file.originalname}`);
    },
  });
};

export const multerOptions = multer({
  storage: storage(),
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

//@aws-sdk/client-s3의 file제거 참조 페이지
//https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deleteobjectcommand.html
export const deleteImageInS3 = async (toBeDeletedImage) => {
  const cutOutUrl = toBeDeletedImage.url.split('/');
  const fileName = cutOutUrl[cutOutUrl.length - 1];
  const folderName = cutOutUrl[cutOutUrl.length - 2];
  const key = folderName.concat('/', fileName);

  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });

  await s3.send(command);
};
