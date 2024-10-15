import { PartialType } from '@nestjs/mapped-types';
import { CreateConcertGroupDto } from './CreateConcertGroupDto';

export class UpdateConcertGroupDto extends PartialType(CreateConcertGroupDto) {}
