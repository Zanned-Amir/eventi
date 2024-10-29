import { CreateTicketCategoryDto } from './CreateTicketCategoryDto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTicketCategoryDto extends PartialType(
  CreateTicketCategoryDto,
) {}
