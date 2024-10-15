import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from './CreateGenreDto';

export class UpdateGenreDto extends PartialType(CreateGenreDto) {}
