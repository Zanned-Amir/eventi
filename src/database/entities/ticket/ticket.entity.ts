import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Concert } from '../concert';
import { TicketCategory } from './ticketCategory.entity';

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

  @BeforeInsert()
  generateUIID() {
    this.serial_code = uuidv4();
  }
}
