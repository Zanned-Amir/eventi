import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
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
    type: 'varchar',
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
  })
  confirmation_token?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  token_generation_timestamp?: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  recovery_token?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  recovery_token_timestamp?: number;

  @Column({
    type: 'boolean',
  })
  is_confirmed: boolean;
  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED'],
    default: 'ACTIVE',
  })
  account_status: string;
  @OneToOne(() => UserAccount, (userAccount) => userAccount.userLoginData)
  @JoinColumn({ name: 'user_id' })
  userAccount: UserAccount;
}
