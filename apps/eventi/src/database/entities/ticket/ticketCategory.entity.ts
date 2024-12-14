import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { Concert } from '../concert';
import { Ticket } from './ticket.entity';
import { OrderTicketCategory } from '../order/orderTicketCategory.entity';

@Entity()
export class TicketCategory {
  @PrimaryGeneratedColumn()
  ticket_category_id: number;

  @Column()
  concert_id: number;

  @Column()
  ticket_category_name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  ticket_category_description: string;

  @Column({
    default: true,
  })
  hide: boolean;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  price: number;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({
    type: 'varchar',
    unique: false,
  })
  area: string;
  @Column({
    type: 'int',
    nullable: true,
  })
  quantity: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  default_quantity: number;

  @VersionColumn()
  version: number;

  @OneToMany(() => Ticket, (ticket) => ticket.ticketCategory)
  tickets: Ticket[];

  @ManyToOne(() => Concert, (concert) => concert.ticketCategories)
  @JoinColumn({ name: 'concert_id' })
  concert: Concert;

  @OneToMany(
    () => OrderTicketCategory,
    (orderTicketCategory) => orderTicketCategory.ticketCategory,
  )
  orderTicketCategories: OrderTicketCategory[];

  @BeforeInsert()
  @BeforeUpdate()
  formatCategoryName() {
    this.ticket_category_name = this.ticket_category_name.toUpperCase();
  }
}
