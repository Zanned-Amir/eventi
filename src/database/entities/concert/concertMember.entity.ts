import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConcertRole } from './concertRole.entity';

@Entity()
export class ConcertMember {
  @PrimaryGeneratedColumn()
  concert_member_id: number;

  @Column()
  full_name: string;

  @Column({
    nullable: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  phone_number: string;
  @OneToMany(() => ConcertRole, (concertRole) => concertRole.concertMember)
  concertRoles: ConcertRole[];

  @BeforeInsert()
  @BeforeUpdate()
  formatName() {
    this.full_name = this.full_name.toLowerCase();
  }
}
