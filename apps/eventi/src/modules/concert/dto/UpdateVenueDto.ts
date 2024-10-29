import { PartialType } from '@nestjs/mapped-types';
import { CreateVenueDto } from './CreateVenueDto';

export class UpdateVenueDto extends PartialType(CreateVenueDto) {}
