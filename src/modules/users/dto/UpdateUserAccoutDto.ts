import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAccountDto } from './CreateUserAccountDto';

export class UpdateUserAccountDto extends PartialType(CreateUserAccountDto) {}
