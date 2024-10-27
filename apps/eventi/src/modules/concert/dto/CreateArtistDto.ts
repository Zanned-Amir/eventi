import { IsString } from 'class-validator';

export class CreateArtistDto {
  @IsString()
  artist_name: string;
}
