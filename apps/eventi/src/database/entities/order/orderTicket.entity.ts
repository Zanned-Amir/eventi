import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Order } from './Order.entity';
import { Ticket } from '../ticket/ticket.entity';

@Entity()
export class OrderTicket {
  @PrimaryColumn()
  order_id: number;

  @PrimaryColumn()
  ticket_id: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_free: boolean;

  @ManyToOne(() => Order, (order) => order.orderTickets)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Ticket, (ticket) => ticket.orderTickets)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;
}
