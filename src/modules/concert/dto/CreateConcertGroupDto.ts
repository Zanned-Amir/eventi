import { IsString } from 'class-validator';

export class CreateConcertGroupDto {
  @IsString()
  concert_group_name: string;
}
