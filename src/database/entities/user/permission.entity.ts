import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './userRole.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  permission_id: number;
  @Column({
    type: 'varchar',
  })
  permission_description: string;
  @ManyToMany(() => UserRole, (role) => role.permissions)
  roles: UserRole[];
}
