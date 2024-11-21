import { IsString } from 'class-validator';

export class CreateGenreDto {
  @IsString()
  genre_name: string;
}
