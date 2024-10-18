import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAccount } from './userAccount.entity';
import { Permission } from './permission.entity';

export enum Role {
  ADMIN = 'ADMIN',
  EVENT_ORGANIZER = 'EVENT_ORGANIZER',
  SUPPORT_STAFF = 'SUPPORT_STAFF',
  USER = 'USER',
  GUEST = 'GUEST',
}

@Entity()
export class UserRole {
  @PrimaryGeneratedColumn()
  role_id: number;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role_name: string;

  @Column({
    type: 'varchar',
  })
  role_description: string;
  @OneToMany(() => UserAccount, (userAccount) => userAccount.role)
  users: UserAccount[];

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({
    name: 'granted_permission',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'role_id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'permission_id',
    },
  })
  permissions?: Permission[];

  @BeforeInsert()
  @BeforeUpdate()
  formatRoleName() {
    this.role_name = this.role_name.toUpperCase();
  }
}
