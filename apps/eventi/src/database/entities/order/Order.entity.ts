import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Check,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { UserAccount } from '../user';
import { OrderTicket } from './orderTicket.entity';
import { OrderTicketCategory } from './orderTicketCategory.entity';
import { Register } from './register.entity';
// constraint to check if either user_id or register_id is provided
@Check('UQ_CHECK_OWNER', `'user_id' IS NOT NULL OR 'register_id' IS NOT NULL`)
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column({
    nullable: true,
  })
  user_id: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  register_id: number;

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
    enum: ['pending', 'completed', 'cancelled', 'failed', 'free'],
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
    default: 0,
  })
  tax: number;

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

  @OneToMany(() => OrderTicket, (orderTicket) => orderTicket.order, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  orderTickets: OrderTicket[];

  @OneToMany(
    () => OrderTicketCategory,
    (orderTicketCategory) => orderTicketCategory.order,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  orderTicketCategories: OrderTicketCategory[];

  @OneToOne(() => Register, (register) => register.order)
  @JoinColumn({ name: 'register_id' })
  register: Register;

  @BeforeInsert()
  @BeforeUpdate()
  checkUserOrRegister() {
    if (!this.user_id && !this.register_id) {
      throw new Error('Either user_id or register_id must be provided.');
    }
  }
}
