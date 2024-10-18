import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Genre } from './genre.entity';
import { Concert } from './concert.entity';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  artist_id: number;
  @Column()
  artist_name: string;
  @ManyToMany(() => Genre, (genre) => genre.genre_id)
  @JoinTable({
    name: 'artist_genre',
    joinColumn: {
      name: 'artist_id',
      referencedColumnName: 'artist_id',
    },
    inverseJoinColumn: {
      name: 'genre_id',
      referencedColumnName: 'genre_id',
    },
  })
  genres: Genre[];

  @OneToMany(() => Concert, (concert) => concert.artists)
  concerts: Concert[];

  @BeforeInsert()
  @BeforeUpdate()
  formatArtistName() {
    this.artist_name = this.artist_name.toUpperCase();
  }
}
