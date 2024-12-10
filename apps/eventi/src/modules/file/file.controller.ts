import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';

import { Public } from '../../common/decorators/public.decorator';
import { diskStorage } from 'multer';
import { fileNameEditor, imageFileFilter } from '../../utils/file.utils';
import { File_UPLOAD_PATH } from '../../common/constants/variable';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @Public()
  @Post('upload')
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
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    return {
      message: 'File uploaded successfully',
    };
  }
  @Public()
  @Get('test')
  async test() {
    return {
      message: 'test',
    };
  }
}
