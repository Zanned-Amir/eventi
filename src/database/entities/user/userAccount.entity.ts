import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './userRole.entity';
import { UserLoginData } from './userLoginData.entity';
import { UserLoginDataExternal } from './userLoginDataExternal.entity';
import { UserTokens } from './userTokens.entity';
import { Permission } from './permission.entity';

@Entity()
export class UserAccount {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  role_id: number;

  @Column({
    type: 'varchar',
  })
  first_name: string;

  @Column({
    type: 'varchar',
  })
  last_name: string;

  @Column({
    type: 'enum',
    enum: ['M', 'F'],
  })
  gender: string;

  @Column({
    type: 'date',
  })
  birth_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => UserRole, (userRole) => userRole.users, {})
  @JoinColumn({
    name: 'role_id',
  })
  role: UserRole;

  @OneToOne(() => UserLoginData, (userLoginData) => userLoginData.userAccount, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  userLoginData?: UserLoginData;

  @OneToMany(
    () => UserLoginDataExternal,
    (userLoginDataExternal) => userLoginDataExternal.userAccount,
  )
  userLoginDataExternals?: UserLoginDataExternal[];

  @OneToMany(() => UserTokens, (userTokens) => userTokens.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  tokens?: UserTokens[];

  @ManyToMany(() => Permission, (permission) => permission.users)
  @JoinTable({
    name: 'user_permission',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'user_id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'permission_id',
    },
  })
  permissions: Permission[];

  @BeforeInsert()
  @BeforeUpdate()
  formatNames() {
    this.first_name = this.first_name.toLowerCase();
    this.last_name = this.last_name.toLowerCase();
  }
}
