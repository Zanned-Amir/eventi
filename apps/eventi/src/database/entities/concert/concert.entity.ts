import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artist } from './artist.entity';
import { Venue } from './venue.entity';
import { ConcertGroup } from './concertGroup.entity';
import { ConcertRole } from './concertRole.entity';
import { Ticket } from '../ticket/ticket.entity';
import { TicketCategory } from '../ticket/ticketCategory.entity';
import { Register } from '../order';
import { RegistrationRule } from './RegistrationRule.entity';

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
    type: 'timestamp',
    nullable: true,
  })
  concert_available_from: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  concert_start_date: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  concert_end_date: Date;

  @Column()
  concert_name: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_active: boolean;

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

  @OneToMany(() => Ticket, (ticket) => ticket.concert)
  tickets: Ticket[];

  @OneToMany(() => TicketCategory, (ticketCategory) => ticketCategory.concert)
  ticketCategories: TicketCategory[];

  @OneToMany(() => Register, (register) => register.concert)
  registers: Register[];

  @OneToMany(
    () => RegistrationRule,
    (registrationRule) => registrationRule.concert,
  )
  registrationRules: RegistrationRule[];

  @BeforeInsert()
  @BeforeUpdate()
  formatName() {
    this.concert_name = this.concert_name.toLowerCase();
  }
}
