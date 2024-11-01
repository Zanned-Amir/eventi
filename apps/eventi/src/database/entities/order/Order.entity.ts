import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAccount } from '../user';
import { OrderTicket } from './orderTicket.entity';
import { OrderTicketCategory } from './orderTicketCategory.entity';
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  delivery_address: string;

  @Column()
  delivery_email_address: string;

  @Column({
    type: 'enum',
    nullable: true,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash'],
  })
  payment_method: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'cancelled', 'failed'],
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  cancel_reason: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  total_price: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  discount: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  discount_percent: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  payment_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => UserAccount, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: UserAccount;

  @OneToMany(() => OrderTicket, (orderTicket) => orderTicket.order)
  orderTickets: OrderTicket[];

  @OneToMany(
    () => OrderTicketCategory,
    (orderTicketCategory) => orderTicketCategory.order,
  )
  orderTicketCategories: OrderTicketCategory[];
}
