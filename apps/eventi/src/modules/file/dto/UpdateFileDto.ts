// createFile.dto.ts

import { CreateFileDto } from './CreateFileDto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateFileDto extends PartialType(CreateFileDto) {}
