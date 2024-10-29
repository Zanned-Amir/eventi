import { PartialType } from '@nestjs/mapped-types';
import { CreateConcertRoleDto } from './CreateConcertRoleDto';

export class UpdateConcertRoleDto extends PartialType(CreateConcertRoleDto) {}
