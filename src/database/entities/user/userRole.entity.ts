import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAccount } from './userAccount.entity';
import { Permission } from './permission.entity';

@Entity()
export class UserRole {
  @PrimaryGeneratedColumn()
  role_id: number;

  @Column({
    type: 'varchar',
    unique: true,
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
    name: 'granted_permissions',
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
}
