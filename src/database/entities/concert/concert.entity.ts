import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artist } from './artist.entity';
import { Venue } from './venue.entity';
import { ConcertGroup } from './concertGroup.entity';
import { OneToMany } from 'typeorm';
import { ConcertRole } from './concertRole.entity';

@Entity()
export class Concert {
  @PrimaryGeneratedColumn()
  concert_id: number;

  @Column()
  venue_id: number;

  @Column({
    nullable: true,
  })
  concert_group_id: number;

  @Column({
    type: 'date',
  })
  concert_date: Date;

  @Column()
  concert_name: string;

  @ManyToMany(() => Artist, (artist) => artist.concerts, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'concert_artist',
    joinColumn: {
      name: 'concert_id',
      referencedColumnName: 'concert_id',
    },
    inverseJoinColumn: {
      name: 'artist_id',
      referencedColumnName: 'artist_id',
    },
  })
  artists: Artist[];
  @ManyToOne(() => ConcertGroup, (concertGroup) => concertGroup.concerts)
  @JoinColumn({ name: 'concert_group_id' })
  concertGroup: ConcertGroup;

  @ManyToOne(() => Venue, (venue) => venue.concerts)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @OneToMany(() => ConcertRole, (concertRole) => concertRole.concert)
  concertRoles: ConcertRole[];
}
