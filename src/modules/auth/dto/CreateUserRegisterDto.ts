import {
  IsDate,
  IsEmail,
  IsIn,
  IsString,
  IsStrongPassword,
} from 'class-validator';

const gender = ['F', 'M'];

export class UserRegisterDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  username: string;

  @IsIn(gender)
  gender: string;

  @IsDate()
  birth_date: Date;

  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
