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
import { Concert } from '../concert';
import { TicketCategory } from './ticketCategory.entity';
import { OrderTicket } from '../order/orderTicket.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  ticket_id: number;

  @Column()
  concert_id: number;

  @Column()
  ticket_category_id: number;

  @Column({ type: 'uuid', nullable: true })
  serial_code: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  ticket_code: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_used: boolean;

  @Column({
    type: 'date',
    nullable: true,
  })
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Concert, (concert) => concert.tickets)
  @JoinColumn({ name: 'concert_id' })
  concert: Concert;

  @ManyToOne(() => TicketCategory, (ticketCategory) => ticketCategory.tickets)
  @JoinColumn({ name: 'ticket_category_id' })
  ticketCategory: TicketCategory;

  @OneToMany(() => OrderTicket, (orderTicket) => orderTicket.ticket)
  orderTickets: OrderTicket[];
}
