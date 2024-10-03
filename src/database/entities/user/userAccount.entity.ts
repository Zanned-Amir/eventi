import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './userRole.entity';
import { UserLoginData } from './userLoginData.entity';
import { UserLoginDataExternal } from './userLoginDataExternal.entity';
import { UserTokens } from './userTokens.entity';

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
    type: 'char',
  })
  gender: string;

  @Column({
    type: 'date',
  })
  birth_date: Date;

  @ManyToOne(() => UserRole, (userRole) => userRole.users, {})
  @JoinColumn({
    name: 'role_id',
  })
  role: UserRole;
  @OneToOne(() => UserLoginData, (userLoginData) => userLoginData.userAccount)
  @JoinColumn({
    name: 'user_id',
  })
  userLoginData: UserLoginData;

  @OneToMany(
    () => UserLoginDataExternal,
    (userLoginDataExternal) => userLoginDataExternal.userAccount,
  )
  userLoginDataExternal: UserLoginDataExternal[];

  @OneToMany(() => UserTokens, (userTokens) => userTokens.user)
  tokens: UserTokens[];
}
