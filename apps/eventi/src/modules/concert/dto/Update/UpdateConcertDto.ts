// updateConcertDto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateConcertDto } from '../Create/CreateConcertDto';

export class UpdateConcertDto extends PartialType(CreateConcertDto) {}
