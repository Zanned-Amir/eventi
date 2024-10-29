import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserAccount } from './userAccount.entity';
import { externalProvider } from './externalProvider.entity';

@Entity()
export class UserLoginDataExternal {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  external_provider_id: number;

  @Column()
  extrnal_provider_token: string;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount)
  @JoinColumn({ name: 'user_id' })
  userAccount: UserAccount;

  @ManyToOne(
    () => externalProvider,
    (externalProvider) => externalProvider.userLoginDataExternal,
  )
  @JoinColumn({ name: 'external_provider_id' })
  externalProvider: externalProvider;
}
