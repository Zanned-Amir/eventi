import { PartialType } from '@nestjs/mapped-types';
import { CreateConcertRoleDto } from '../Create/CreateConcertRoleDto';

export class UpdateConcertRoleDto extends PartialType(CreateConcertRoleDto) {}
