import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Concert } from './concert.entity';
import { Role } from './role.entity';
import { ConcertMember } from './concertMember.entity';

@Entity()
export class ConcertRole {
  @PrimaryColumn()
  concert_member_id: number;

  @Column({
    type: 'uuid',
  })
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