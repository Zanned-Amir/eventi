import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConcertRole } from './concertRole.entity';
import { FileAssociation } from '../file';

@Entity()
export class ConcertMember {
  @PrimaryGeneratedColumn()
  concert_member_id: number;

  @Column({ nullable: true })
  photo_id?: number;

  @Column()
  full_name: string;

  @Column({
    nullable: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  phone_number: string;

  @OneToMany(() => ConcertRole, (concertRole) => concertRole.concertMember)
  concertRoles: ConcertRole[];

  @ManyToOne(() => FileAssociation, (FileAssociation) => FileAssociation.file)
  @JoinColumn({ name: 'photo_id', referencedColumnName: 'file_id' }) // Reference file_id
  photo?: FileAssociation;

  @BeforeInsert()
  @BeforeUpdate()
  formatName() {
    this.full_name = this.full_name.toLowerCase();
  }
}
