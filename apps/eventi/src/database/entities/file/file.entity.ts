import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { FileAssociation } from './fileAssociation.entity';

@Entity('file')
export class File {
  @PrimaryGeneratedColumn()
  file_id: number;

  @Column({ length: 255 })
  filename: string;

  @Column({ length: 500 })
  file_path: string;

  @Column({ length: 50, nullable: true })
  file_extension?: string;

  @Column({ length: 100, nullable: true })
  mime_type?: string;

  @UpdateDateColumn({ type: 'timestamp' })
  upload_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_accessed?: Date;

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @Column({ length: 50, nullable: true })
  storage_type?: string;

  @Column({ length: 64, nullable: true })
  file_hash?: string;

  @Column({ type: 'integer', nullable: true })
  uploaded_by?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @DeleteDateColumn()
  deleted_at?: Date;

  @Index('idx_files_mime_type')
  @Column({ length: 100, nullable: true })
  indexed_mime_type?: string;

  @Index('idx_files_uploaded_by')
  @Column({ type: 'integer', nullable: true })
  indexed_uploaded_by?: number;

  // One-to-many relationship with FileAssociation
  @OneToMany(() => FileAssociation, (fileAssociation) => fileAssociation.file)
  fileAssociations: FileAssociation[];
}
