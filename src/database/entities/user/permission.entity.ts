import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './userRole.entity';
import { UserAccount } from './userAccount.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  permission_id: number;
  @Column({
    type: 'varchar',
  })
  permission_name: string;
  @Column({
    type: 'varchar',
    unique: true,
  })
  permission_description: string;
  @ManyToMany(() => UserRole, (role) => role.permissions)
  roles: UserRole[];

  @ManyToMany(() => UserAccount, (userAccount) => userAccount.permissions)
  users: UserAccount[];

  @BeforeInsert()
  @BeforeUpdate()
  formatPermissionName() {
    this.permission_name = this.permission_name.toUpperCase();
  }
}

export enum Permissions {
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_EVENTS = 'MANAGE_EVENTS',
  MANAGE_TICKETS = 'MANAGE_TICKETS',
  VIEW_REPORTS = 'VIEW_REPORTS',
  ISSUE_REFUNDS = 'ISSUE_REFUNDS',
  VIEW_ALL_RESERVATIONS = 'VIEW_ALL_RESERVATIONS',
  CREATE_EVENTS = 'CREATE_EVENTS',
  EDIT_EVENTS = 'EDIT_EVENTS',
  VIEW_EVENTS = 'VIEW_EVENTS',
  DELETE_EVENTS = 'DELETE_EVENTS',
  VIEW_EVENT_RESERVATIONS = 'VIEW_EVENT_RESERVATIONS',
  MANAGE_VENDOR_BOOTHS = 'MANAGE_VENDOR_BOOTHS',
  VIEW_VENDOR_SALES_REPORTS = 'VIEW_VENDOR_SALES_REPORTS',
}
