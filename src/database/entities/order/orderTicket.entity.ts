import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OrderTicket {
  @PrimaryGeneratedColumn()
  order_ticket_id: number;
}
