import { PartialType } from '@nestjs/swagger';
import { CreateUserAccountDto } from './CreateUserAccountDto';

export class UpdateUserAccountDto extends PartialType(CreateUserAccountDto) {}
