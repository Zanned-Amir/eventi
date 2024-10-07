import { PartialType } from '@nestjs/swagger';
import { CreateUserLoginDataDto } from './CreateUserLoginDataDto';

export class UpdateUserLoginDataDto extends PartialType(
  CreateUserLoginDataDto,
) {}
