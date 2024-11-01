import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './Order.entity';
import { TicketCategory } from '../ticket/ticketCategory.entity';
@Entity()
export class OrderTicketCategory {
  @PrimaryGeneratedColumn()
  order_ticketCategory_id: number;

  @Column()
  order_id: number;

  @Column()
  ticket_category_id: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Order, (order) => order.orderTicketCategories)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(
    () => TicketCategory,
    (ticketCategory) => ticketCategory.orderTicketCategories,
  )
  @JoinColumn({ name: 'ticket_category_id' })
  ticketCategory: TicketCategory;
}
