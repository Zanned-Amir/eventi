/*
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './userRole.entity';
import { Permission } from './permission.entity';

@Entity()
export class grantedPermission {
  @PrimaryGeneratedColumn()
  role_id: number;
  @Column()
  permission_id: number;

  @ManyToOne(() => UserRole, (role) => role.permissions)
  @JoinColumn({ name: 'role_id' })
  role: UserRole;
  @ManyToOne(() => Permission, (permission) => permission.permissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission[];
}
*/
