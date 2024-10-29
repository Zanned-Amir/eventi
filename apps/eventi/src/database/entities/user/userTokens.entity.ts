import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAccount } from './userAccount.entity';
import { Transform } from 'class-transformer';

enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
}

@Entity({
  name: 'user_token',
})
export class UserTokens {
  @PrimaryGeneratedColumn()
  token_id: number;
  @Column()
  user_id: number;
  @Column()
  token: string;
  @Transform(({ value }) => value.toUpperCase())
  @Column({
    type: 'enum',
    enum: TokenType,
  })
  type: string;

  @Column({
    nullable: true,
    default: 'unknown',
  })
  device_info: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_in_blacklist: boolean;

  @Column({
    type: 'bigint',
  })
  expires_at: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.tokens)
  @JoinColumn({
    name: 'user_id',
  })
  user: UserAccount;
}
