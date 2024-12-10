import { CreateFileAssociationDto } from './CreateFileAssociation.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateFileAssociationDto extends PartialType(
  CreateFileAssociationDto,
) {}
