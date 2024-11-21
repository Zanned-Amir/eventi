import { PartialType } from '@nestjs/mapped-types';
import { CreateArtistDto } from '../Create/CreateArtistDto';

export class UpdateArtistDto extends PartialType(CreateArtistDto) {}
