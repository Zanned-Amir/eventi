import { PartialType } from '@nestjs/mapped-types';
import { CreateArtistDto } from './CreateArtistDto';

export class UpdateArtistDto extends PartialType(CreateArtistDto) {}
