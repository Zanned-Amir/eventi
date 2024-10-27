import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserLoginDataExternal } from './userLoginDataExternal.entity';

@Entity()
export class externalProvider {
  @PrimaryGeneratedColumn()
  extrnal_provider_id: string;
  @Column()
  provider_name: string;
  @Column()
  ws_end_point: string;

  @OneToMany(
    () => UserLoginDataExternal,
    (userLoginDataExternal) => userLoginDataExternal.externalProvider,
  )
  userLoginDataExternal: UserLoginDataExternal[];
}
