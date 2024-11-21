import { PartialType } from '@nestjs/mapped-types';
import { CreateConcertGroupDto } from '../Create/CreateConcertGroupDto';

export class UpdateConcertGroupDto extends PartialType(CreateConcertGroupDto) {}
