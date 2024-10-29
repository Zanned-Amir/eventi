import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './CreateTicketDto';
export class UpdateTicketDto extends PartialType(CreateTicketDto) {}
