import { Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;
}
