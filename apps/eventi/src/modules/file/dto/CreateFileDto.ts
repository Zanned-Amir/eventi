// createFile.dto.ts
import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateFileDto {
  @IsString()
  filename: string;

  @IsString()
  file_path: string;

  @IsString()
  @IsOptional()
  file_extension?: string;

  @IsString()
  @IsOptional()
  mime_type?: string;

  @IsInt()
  @IsOptional()
  uploaded_by?: number;
}
