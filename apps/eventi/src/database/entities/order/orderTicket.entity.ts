import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './Order.entity';
import { Ticket } from '../ticket/ticket.entity';

@Entity()
export class OrderTicket {
  @PrimaryGeneratedColumn()
  order_ticket_id: number;

  @Column()
  order_id: number;

  @Column()
  ticket_id: number;

  @ManyToOne(() => Order, (order) => order.orderTickets)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Ticket, (ticket) => ticket.orderTickets)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;
}
