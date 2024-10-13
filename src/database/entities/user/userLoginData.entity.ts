import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAccount } from './userAccount.entity';

@Entity()
export class UserLoginData {
  @PrimaryColumn()
  user_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  username: string;
  @Column({
    type: 'text',
    nullable: false,
    select: false,
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: true,
    select: false,
  })
  confirmation_token?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  token_generation_timestamp?: number;

  @Column({
    type: 'varchar',
    nullable: true,
    select: false,
  })
  recovery_token?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  recovery_token_timestamp?: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_confirmed: boolean;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED'],
    default: 'ACTIVE',
  })
  account_status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => UserAccount, (userAccount) => userAccount.userLoginData, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  userAccount: UserAccount;
}
