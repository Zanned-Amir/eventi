import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  payment_id: number;

  @Column()
  order_id: number;

  @Column({
    nullable: true,
  })
  register_id: number;

  @Column()
  user_id: number;

  @Column()
  payment_intent: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  amount: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    default: 0,
  })
  tax: number;

  @Column({
    type: 'enum',
    nullable: true,
    enum: ['paid', 'refunded', 'failed', 'pending'],
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  payment_date: Date;

  @Column({
    type: 'jsonb',
  })
  session_object: any;

  @Column({
    type: 'enum',
    enum: ['credit_card', 'debit_card', 'paypal', 'cash'],
  })
  payment_method: string;
}
