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
import { RegistrationRule } from '../../database/entities/order';
import { ArtistController } from './artist.controller';
import { ConcertGroupController } from './concertGroup.controller';
import { ConcertMemberController } from './ConcertMember.controller';
import { GenreController } from './genre.controller';
import { RegistrationRuleController } from './registerationRule.controller';
import { RoleController } from './role.controller';
import { VenueController } from './venue.controller';
import { ConcertPositionController } from './concertPosition.controller';
import { AUTH_STAFF_NOTIFICATION_QUEUE } from '@app/common/constants/service';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AUTH_STAFF_SERVICE } from '../../../../../libs/common/src/constants/service';
import { FileModule } from '../file/file.module';

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
      RegistrationRule,
    ]),
    FileModule,
  ],
  providers: [
    ConcertService,
    {
      provide: AUTH_STAFF_SERVICE,
      useFactory: (configService: ConfigService) => {
        const RMQ_URL_DEV = configService.get('RMQ_URL_DEV');

        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [RMQ_URL_DEV],
            queue: AUTH_STAFF_NOTIFICATION_QUEUE,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [
    ConcertController,
    ArtistController,
    ConcertGroupController,
    ConcertMemberController,
    ConcertPositionController,
    GenreController,
    RegistrationRuleController,
    RoleController,
    VenueController,
  ],
})
export class ConcertModule {}
