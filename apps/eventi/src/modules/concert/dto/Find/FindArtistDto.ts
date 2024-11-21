import { BaseFindDto } from 'apps/eventi/src/common/dto/BaseFindDto';
import { IsOptional, IsInt, IsString, MaxLength } from 'class-validator';

export class FindArtistDto extends BaseFindDto {
  @IsOptional()
  @IsInt()
  artist_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  artist_name?: string;

  @IsOptional()
  @IsInt()
  genre_id?: number;
}
