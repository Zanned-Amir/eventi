import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserAccount } from './userAccount.entity';

enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

@Entity()
export class UserTokens {
  @PrimaryGeneratedColumn()
  token_id: number;
  @Column()
  user_id: number;
  @Column()
  token: string;
  @Column({
    type: 'enum',
    enum: TokenType,
  })
  type: string;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.tokens)
  user: UserAccount;
}
