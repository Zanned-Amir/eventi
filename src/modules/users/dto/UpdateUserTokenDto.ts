import { PartialType } from '@nestjs/mapped-types';
import { CreateUserTokenDto } from './CreateUserTokenDto';

export class UpdateUserTokenDto extends PartialType(CreateUserTokenDto) {}
