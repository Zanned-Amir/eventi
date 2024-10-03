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
    unique: true,
  })
  username: string;
  @Column({
    type: 'varchar',
    nullable: false,
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
  })
  confirmation_token: string;

  @Column({
    type: 'date',
  })
  token_generation_date: Date;

  @Column({
    type: 'varchar',
  })
  recovery_token: string;

  @Column({
    type: 'date',
  })
  recovery_token_generation_date: Date;

  @Column({
    type: 'boolean',
  })
  is_confirmed: boolean;
  @OneToOne(() => UserAccount, (userAccount) => userAccount.userLoginData)
  @JoinColumn({ name: 'user_id' })
  userAccount: UserAccount;
}
