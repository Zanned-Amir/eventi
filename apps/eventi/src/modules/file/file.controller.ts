import { Controller } from '@nestjs/common';

import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  // use in case of using multer
  /*
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: File_UPLOAD_PATH,
        filename: fileNameEditor,
      }),
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
      fileFilter: imageFileFilter,
    }),
  )
  */
}
