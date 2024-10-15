import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ConcertRole } from './concertRole.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  role_id: number;

  @Column({ unique: true })
  role_name: string;

  @Column({ nullable: true })
  role_description: string;

  @OneToMany(() => ConcertRole, (concertRole) => concertRole.role)
  concertRoles: ConcertRole[];
}
