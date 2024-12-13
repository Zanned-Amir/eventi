import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Service } from './s3.service';
import { v4 as uuid } from 'uuid';
import { CreateFileDto } from './dto/CreateFileDto';
import { File, FileAssociation } from '../../database/entities/file';
import {
  AssociationTypes,
  EntityTypes,
} from '../../database/entities/file/fileAssociation.entity';
import { CreateFileAssociationDto } from './dto/CreateFileAssociation.dto';
import { UserAccount } from '../../database/entities/user';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    @InjectRepository(UserAccount)
    private readonly userRepository: Repository<UserAccount>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(FileAssociation)
    private readonly fileAssociationRepository: Repository<FileAssociation>,
    private readonly s3Service: S3Service,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    createFileDto: CreateFileDto,
    entity_path: string,
  ) {
    const key = `${entity_path}-${uuid()}-${file.originalname}`;
    const result = await this.s3Service.uploadFile(key, file);

    if (!result) {
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const newFile = this.fileRepository.create({
      ...createFileDto,
    });
    await this.fileRepository.save(newFile);
    return newFile;
  }

  async uploadFiles(
    files: Express.Multer.File[],
    createFileDtos: CreateFileDto[],
  ) {
    const newFiles = files.map((file, index) => {
      const key = `${uuid()}-${file.originalname}`;
      this.s3Service.uploadFile(key, file);
      return this.fileRepository.create({
        ...createFileDtos[index],
      });
    });

    await this.fileRepository.save(newFiles);
    return newFiles;
  }

  async removeFile(file_id: number) {
    const file = await this.fileRepository.findOne({
      where: { file_id: file_id },
    });

    if (!file) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    await this.s3Service.deleteFile(file.file_path);
    await this.fileRepository.delete(file_id);
  }

  async getFile(file_id: number) {
    const file = await this.fileRepository.findOne({
      where: { file_id: file_id },
    });

    if (!file) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    const url = await this.s3Service.getSignedFile(file.file_path);

    return url;
  }

  async getFileByKey(key: string) {
    const url = await this.s3Service.getSignedFile(key);
    return url;
  }

  async assignFileToEntity(createFileAssociationDto: CreateFileAssociationDto) {
    const newFileAssociation = this.fileAssociationRepository.create({
      ...createFileAssociationDto,
    });

    return await this.fileAssociationRepository.save(newFileAssociation);
  }

  async uploadAndAssignImage(
    files: Express.Multer.File[] | Express.Multer.File,
    entityId: number,
    entityType: EntityTypes,
    associationType: AssociationTypes,
    maxImages: number,
    overwrite: boolean = false,
    uploaded_by?: number | null,
  ) {
    // Ensure files array
    const filesArray = Array.isArray(files) ? files : [files];

    // Validate maximum image constraint
    const existingAssociations = await this.fileAssociationRepository.find({
      where: {
        entity_id: entityId,
        entity_type: entityType,
        association_type: associationType,
      },
    });

    if (existingAssociations.length + filesArray.length > maxImages) {
      throw new HttpException(
        `Maximum allowed images (${maxImages}) exceeded for ${associationType}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Handle overwrite scenario
    if (overwrite && existingAssociations.length > 0) {
      for (const association of existingAssociations) {
        await this.s3Service.deleteFile(association.file.file_path);
        await this.fileRepository.delete(association.file_id);
        await this.fileAssociationRepository.delete({
          file_id: association.file_id,
          entity_id: entityId,
        });
      }
    }

    // Upload and create associations
    const uploadedFiles: File[] = [];
    for (const file of filesArray) {
      const key = `${entityType}/${associationType}/${uuid()}-${file.originalname}`;
      const uploadSuccess = await this.s3Service.uploadFile(key, file);
      if (!uploadSuccess) {
        throw new HttpException(
          'Failed to upload file to S3',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const newFile = this.fileRepository.create({
        filename: file.originalname,
        file_path: key,
        file_extension: file.originalname.split('.').pop(),
        mime_type: file.mimetype,
        uploaded_by: uploaded_by,
        storage_type: 's3',
      });
      const savedFile = await this.fileRepository.save(newFile);

      const fileAssociation = this.fileAssociationRepository.create({
        file_id: savedFile.file_id,
        entity_id: entityId,
        entity_type: entityType,
        association_type: associationType,
      });

      await this.fileAssociationRepository.save(fileAssociation);
      uploadedFiles.push(savedFile);
    }

    return uploadedFiles;
  }

  async removeImage(
    entityId: number,
    entityType: EntityTypes,
    associationType: string,
  ) {
    // Fetch the file association
    const association = await this.fileAssociationRepository.findOne({
      where: {
        entity_id: entityId,
        entity_type: entityType,
        association_type: associationType,
      },
      relations: ['file'],
    });

    console.log('association', association);

    if (!association) {
      throw new HttpException(
        'Image not found for this entity.',
        HttpStatus.NOT_FOUND,
      );
    }

    // Delete file from S3 and database
    await this.s3Service.deleteFile(association.file.file_path);
    await this.fileRepository.delete(association.file_id);

    return true;
  }

  async getImagesForEntity(entityId: number, entityType: string) {
    const whereCondition: any = {
      entity_id: entityId,
      entity_type: entityType,
    };

    // Fetch the file associations with the related files
    const associations = await this.fileAssociationRepository.find({
      where: whereCondition,
      relations: ['file'],
    });

    console.log('associations', associations);

    // Ensure to await for each file's signed URL
    const imageUrls = await Promise.all(
      associations.map(async (association) => {
        const url = await this.s3Service.getSignedFile(
          association.file.file_path,
        );
        return {
          url,
          file_id: association.file.file_id,
          entity_type: entityType,
        };
      }),
    );

    return imageUrls;
  }

  async uploadConcertImages(
    files: Express.Multer.File[],
    concertId: number,
    uploadedBy?: number | null,
  ) {
    const maxImages = 4;

    // Validate maximum image constraint
    const existingAssociations = await this.fileAssociationRepository.find({
      where: {
        entity_id: concertId,
        entity_type: EntityTypes.CONCERT,
        association_type: AssociationTypes.CONCERT_PICTURE,
      },
    });

    if (existingAssociations.length + files.length > maxImages) {
      throw new HttpException(
        `You can only upload a maximum of ${maxImages} images for a concert.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const uploadedFiles: File[] = [];
    for (const file of files) {
      const key = `concert/${concertId}/${uuid()}-${file.originalname}`;
      const uploadSuccess = await this.s3Service.uploadFile(key, file);
      if (!uploadSuccess) {
        throw new HttpException(
          'Failed to upload file to S3',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const newFile = this.fileRepository.create({
        filename: file.originalname,
        file_path: key,
        file_extension: file.originalname.split('.').pop(),
        mime_type: file.mimetype,
        uploaded_by: uploadedBy,
        storage_type: 's3',
      });

      const savedFile = await this.fileRepository.save(newFile);

      const fileAssociation = this.fileAssociationRepository.create({
        file_id: savedFile.file_id,
        entity_id: concertId,
        entity_type: EntityTypes.CONCERT,
        association_type: AssociationTypes.CONCERT_PICTURE,
      });

      await this.fileAssociationRepository.save(fileAssociation);
      uploadedFiles.push(savedFile);
    }

    return uploadedFiles;
  }

  async removeConcertImages(concertId: number, fileIds: number[]) {
    const results = [];

    for (const fileId of fileIds) {
      try {
        // Fetch file association
        const association = await this.fileAssociationRepository.findOne({
          where: {
            entity_id: concertId,
            entity_type: EntityTypes.CONCERT,
            association_type: AssociationTypes.CONCERT_PICTURE,
            file_id: fileId,
          },
          relations: ['file'],
        });

        if (!association) {
          throw new HttpException(
            `Image with ID ${fileId} not found for this concert.`,
            HttpStatus.NOT_FOUND,
          );
        }

        // Delete file from S3
        await this.s3Service.deleteFile(association.file.file_path);

        // Delete file record and association
        await this.fileRepository.delete(association.file_id);
        await this.fileAssociationRepository.delete(association.file_id);

        results.push({ fileId, status: 'deleted' });
      } catch (error) {
        this.logger.error(`Failed to delete image with ID: ${fileId}`, error);
        results.push({ fileId, status: 'failed', error: error.message });
      }
    }

    return results;
  }
}
