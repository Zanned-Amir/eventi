import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Concert } from '.';
import { Register } from '../order/register.entity';

@Entity()
export class RegistrationRule {
  @PrimaryGeneratedColumn()
  register_rule_id: number;

  @Column()
  concert_id: number;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  available_from: Date;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  valid_until: Date;

  @Column({
    type: 'boolean',
    default: true,
  })
  is_active: boolean;

  @ManyToOne(() => Concert, (concert) => concert.registrationRules)
  @JoinColumn({ name: 'concert_id' })
  concert: Concert;

  @OneToMany(() => Register, (register) => register.registrationRule)
  registers: Register[];
}
