import { S3Client } from '@aws-sdk/client-s3';
import { BadRequestException } from '@nestjs/common';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';

const accessKeyId = String(process.env.KTH_ACCESKEYID);
const secretAccessKey = String(process.env.KTH_SECRETKEYID);
const bucket = String(process.env.KTH_S3_BUCKET_NAME);

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

export const multerOptions = multer({
  storage: multerS3({
    s3,
    bucket,
    acl: 'public-read',
    key(req, file, callback) {
      // const imageType = file.mimetype.split('/')[1];
      callback(null, `nest-project/${Date.now() + file.originalname}`);
    },
  }),
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});
