import { PartialType } from '@nestjs/mapped-types';
import { CreateVenueDto } from '../Create/CreateVenueDto';

export class UpdateVenueDto extends PartialType(CreateVenueDto) {}
