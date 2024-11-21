import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Concert } from '../concert';
import { Order } from './Order.entity';
import { RegistrationRule } from '../concert/RegistrationRule.entity';

@Entity()
// unique constraint to prevent duplicate registration
@Unique('UQ_REGISTER_BY_EMAIL_CONCERT_ID', ['concert_id', 'email'])
export class Register {
  @PrimaryGeneratedColumn()
  register_id: number;

  @Column()
  concert_id: number;

  @Column({
    nullable: true,
  })
  register_rule_id: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  register_code: string;

  @Column()
  full_name: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_used: boolean;

  @Column()
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  city: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  region: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Concert, (concert) => concert.registers)
  @JoinColumn({ name: 'concert_id' })
  concert: Concert;

  @OneToOne(() => Order, (order) => order.register)
  order: Order;

  @ManyToOne(
    () => RegistrationRule,
    (registrationRule) => registrationRule.registers,
  )
  @JoinColumn({ name: 'register_rule_id' })
  registrationRule: RegistrationRule;
}
