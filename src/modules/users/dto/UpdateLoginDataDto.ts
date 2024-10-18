import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserLoginDataDto } from './CreateUserLoginDataDto';

export class UpdateUserLoginDataDto extends PartialType(
  OmitType(CreateUserLoginDataDto, ['password'] as const),
) {}
