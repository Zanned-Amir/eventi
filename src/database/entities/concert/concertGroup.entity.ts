import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Concert } from './concert.entity';

@Entity()
export class ConcertGroup {
  @PrimaryGeneratedColumn()
  concert_group_id: number;

  @Column({
    type: 'varchar',
    unique: true,
  })
  concert_group_name: string;

  @OneToMany(() => Concert, (concert) => concert.concertGroup)
  concerts: Concert[];
}
