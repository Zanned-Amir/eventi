import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from '../Create/CreateGenreDto';

export class UpdateGenreDto extends PartialType(CreateGenreDto) {}
