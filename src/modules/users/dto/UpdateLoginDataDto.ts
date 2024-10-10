import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserLoginDataDto } from './CreateUserLoginDataDto';

export class UpdateUserLoginDataDto extends PartialType(
  OmitType(CreateUserLoginDataDto, ['password'] as const),
) {}
