import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Artist } from './artist.entity';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  genre_id: number;
  @Column()
  genre_name: string;
  @ManyToMany(() => Artist, (artist) => artist.genres)
  artists: Artist[];
}
