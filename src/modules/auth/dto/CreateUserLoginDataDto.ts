import { IsDate, IsIn, IsString } from 'class-validator';

const gender = ['F', 'M'];

export class UserLoginData {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsIn(gender)
  gender: string;

  @IsDate()
  birth_date: Date;
}
