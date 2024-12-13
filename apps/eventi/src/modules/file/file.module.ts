import { TypeOrmModule } from '@nestjs/typeorm';
import { File, FileAssociation } from '../../database/entities/file';
import { FileService } from './file.service';
import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { S3Service } from './s3.service';
import { UserAccount } from '../../database/entities/user';

@Module({
  imports: [TypeOrmModule.forFeature([File, FileAssociation, UserAccount])],
  providers: [FileService, S3Service],
  controllers: [FileController],
  exports: [FileService], // Ensure FileService is exported
})
export class FileModule {}
