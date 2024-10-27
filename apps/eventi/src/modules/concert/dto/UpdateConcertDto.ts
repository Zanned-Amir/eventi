// updateConcertDto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateConcertDto } from './CreateConcertDto';

export class UpdateConcertDto extends PartialType(CreateConcertDto) {}
