import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
export const fileNameEditor = (
  req: Request,
  file: any,
  cb: (error: any, filename: string) => void,
) => {
  const newFileName = `${Date.now()}-${file.originalname}`;
  cb(null, newFileName);
};
export const imageFileFilter = (
  req: Request,
  file: any,
  cb: (error: any, acceptFile: boolean) => void,
) => {
  if (
    !file.originalname ||
    !file.originalname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)
  ) {
    return cb(
      new BadRequestException(
        'File must be of type jpg, jpeg, png, gif, svg, or webp',
      ),
      false,
    );
  }
  cb(null, true);
};
