import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { File } from './file.entity';
@Entity('file_association')
@Index('idx_file_associations_entity', ['entity_id', 'entity_type'])
@Unique('UQ_FILE_ASSOCIATION', ['file_id', 'entity_id', 'entity_type'])
export class FileAssociation {
  @PrimaryColumn({ type: 'integer' })
  file_id: number;

  @Column({ type: 'integer' })
  entity_id: number;

  @Column({ length: 50 })
  entity_type: string;

  @Column({})
  file_key: string;

  @Column({ length: 50, nullable: true })
  association_type?: string;

  @CreateDateColumn({ type: 'timestamp' })
  association_date: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @ManyToOne(() => File, (File) => File.fileAssociations)
  @JoinColumn({ name: 'photo_id', referencedColumnName: 'file_id' })
  file?: File;
}

export enum EntityTypes {
  CONCERT = 'concert',
  ARTIST = 'artist',
  USER_ACCOUNT = 'user_account',
  VENUE = 'venue',
  GENRE = 'genre',
  ROLE = 'role',
  CONCERT_MEMBER = 'concert_member',
  CONCERT_GROUP = 'concert_group',
  TICKET_CATEGORY = 'ticket_category',
}
