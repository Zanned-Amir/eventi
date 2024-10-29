import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artist } from './artist.entity';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  genre_id: number;
  @Column({
    unique: true,
  })
  genre_name: string;
  @ManyToMany(() => Artist, (artist) => artist.genres)
  artists: Artist[];

  @BeforeInsert()
  @BeforeUpdate()
  formatGenreName() {
    this.genre_name = this.genre_name.toUpperCase();
  }
}
