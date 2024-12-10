import { TypeOrmModule } from '@nestjs/typeorm';
import { File, FileAssociation } from '../../database/entities/file';
import { FileService } from './file.service';
import { Module } from '@nestjs/common';
import { FileController } from './file.controller';

@Module({
  imports: [TypeOrmModule.forFeature([File, FileAssociation])],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
