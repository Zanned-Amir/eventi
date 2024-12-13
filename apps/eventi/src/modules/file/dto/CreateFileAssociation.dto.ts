// createFileAssociation.dto.ts
import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateFileAssociationDto {
  @IsInt()
  file_id: number;

  @IsInt()
  entity_id: number;

  @IsString()
  entity_type: string;

  @IsString()
  @IsOptional()
  association_type: string;
}
