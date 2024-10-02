import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserLoginData {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
