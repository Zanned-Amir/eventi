import { PartialType } from '@nestjs/mapped-types';
import { CreateConcertMemberDto } from '../Create/CreateConcertMemberDto';

export class UpdateConcertMemberDto extends PartialType(
  CreateConcertMemberDto,
) {}
