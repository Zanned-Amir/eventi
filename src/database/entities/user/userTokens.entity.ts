import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserAccount } from './userAccount.entity';

@Entity()
export class UserTokens {
  @PrimaryGeneratedColumn()
  token_id: number;
  @Column()
  user_id: number;
  @Column()
  token: string;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.tokens)
  user: UserAccount;
}
