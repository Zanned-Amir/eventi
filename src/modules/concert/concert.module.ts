import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from 'src/database/entities/concert/artist.entity';
import { Concert } from 'src/database/entities/concert/concert.entity';
import { ConcertGroup } from 'src/database/entities/concert/concertGroup.entity';
import { ConcertMember } from 'src/database/entities/concert/concertMember.entity';
import { ConcertRole } from 'src/database/entities/concert/concertRole.entity';
import { Genre } from 'src/database/entities/concert/genre.entity';
import { Role } from 'src/database/entities/concert/role.entity';
import { Venue } from 'src/database/entities/concert/venue.entity';
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
