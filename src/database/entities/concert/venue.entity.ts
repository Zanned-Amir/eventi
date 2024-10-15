import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Concert } from './concert.entity';

@Entity()
export class Venue {
  @PrimaryGeneratedColumn()
  venue_id: number;

  @Column()
  venue_name: string;

  @Column()
  location: string;

  @Column()
  capacity: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  type: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  contact: string;
  @OneToMany(() => Concert, (concert) => concert.venue)
  concerts: Concert[];
}
