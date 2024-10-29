import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Artist,
  Concert,
  ConcertGroup,
  ConcertMember,
  ConcertRole,
  Genre,
  Role,
  Venue,
} from '../../database/entities/concert';
import { ConcertController } from './concert.controller';
import { ConcertService } from './concert.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Artist,
      Genre,
      ConcertGroup,
      Concert,
      ConcertMember,
      ConcertRole,
      Venue,
      Role,
    ]),
  ],
  providers: [ConcertService],
  controllers: [ConcertController],
})
export class ConcertModule {}
