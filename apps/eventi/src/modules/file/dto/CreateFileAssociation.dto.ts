// createFileAssociation.dto.ts
import { IsString, IsInt } from 'class-validator';

export class CreateFileAssociationDto {
  @IsInt()
  file_id: number;

  @IsInt()
  entity_id: number;

  @IsString()
  entity_type: string;

  @IsString()
  file_key: string;
}
