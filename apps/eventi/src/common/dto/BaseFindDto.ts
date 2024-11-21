import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { OrderByDirection } from '../validator/OrderByDirectionConstraint ';

export class BaseFindDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @OrderByDirection()
  orderBy?: { [key: string]: 'ASC' | 'DESC' };

  rawQuery: boolean = false;
}
