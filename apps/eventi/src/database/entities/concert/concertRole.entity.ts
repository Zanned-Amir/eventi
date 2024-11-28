import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Concert } from './concert.entity';
import { Role } from './role.entity';
import { ConcertMember } from './concertMember.entity';

@Entity()
@Unique('UQ_CONCERT_ROLE', ['concert_member_id', 'concert_id', 'role_id'])
export class ConcertRole {
  @PrimaryGeneratedColumn()
  concert_role_id: number;

  @Column()
  concert_member_id: number;

  @Column({ type: 'uuid' })
  access_code: string;

  @Column()
  concert_id: number;

  @Column()
  role_id: number;

  @ManyToOne(() => Concert, (concert) => concert.concertRoles)
  @JoinColumn({ name: 'concert_id' })
  concert: Concert;

  @ManyToOne(() => Role, (role) => role.concertRoles)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => ConcertMember, (concertMember) => concertMember.concertRoles)
  @JoinColumn({ name: 'concert_member_id' })
  concertMember: ConcertMember;
}
