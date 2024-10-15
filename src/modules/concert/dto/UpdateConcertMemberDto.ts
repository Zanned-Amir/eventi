import { PartialType } from '@nestjs/mapped-types';
import { CreateConcertMemberDto } from './CreateConcertMemberDto';

export class UpdateConcertMemberDto extends PartialType(
  CreateConcertMemberDto,
) {}
