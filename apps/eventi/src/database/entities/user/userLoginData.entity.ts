import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAccount } from './userAccount.entity';

@Entity()
export class UserLoginData {
  @PrimaryColumn()
  user_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  username: string;
  @Column({
    type: 'text',
    nullable: false,
    select: true,
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  confirmation_token?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  token_generation_timestamp?: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  recovery_token?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  recovery_token_timestamp?: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  enabled_m2fa: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  m2fa_secret_otp?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  m2fa_secret_otp_timestamp?: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  m2fa_token?: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_confirmed: boolean;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'DEACTIVATED'],
    default: 'ACTIVE',
  })
  account_status: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  last_login_timestamp: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  last_activity_timestamp: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => UserAccount, (userAccount) => userAccount.userLoginData, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  userAccount: UserAccount;

  @BeforeInsert()
  @BeforeUpdate()
  async fromatName() {
    this.username = this.username.toLowerCase();
    this.email = this.email.toLowerCase();
  }

  isRecoveredTokenExpired(): boolean {
    if (!this.recovery_token_timestamp) {
      console.log('No recovery token timestamp found');
      return true;
    }

    // Convert timestamps to UTC for consistent comparison
    const tokenGenerationDate = new Date(this.recovery_token_timestamp);
    const currentDate = new Date();

    // Expiration set to 10 minutes from the recovery token timestamp
    const tokenExpirationDate = new Date(tokenGenerationDate);
    tokenExpirationDate.setMinutes(tokenGenerationDate.getMinutes() + 240);

    // Log to help identify issues
    console.log('Current Date (UTC):', currentDate.toISOString());
    console.log(
      'Token Generation Date (UTC):',
      tokenGenerationDate.toISOString(),
    );
    console.log(
      'Token Expiration Date (UTC):',
      tokenExpirationDate.toISOString(),
    );

    return currentDate > tokenExpirationDate;
  }

  isConfirmationTokenExpired(): boolean {
    if (!this.token_generation_timestamp) return true;

    const tokenGenerationDate = new Date(this.token_generation_timestamp);
    const currentDate = new Date();

    const tokenExpirationDate = new Date(tokenGenerationDate);
    tokenExpirationDate.setMinutes(tokenGenerationDate.getMinutes() + 10);

    console.log('Current Date (UTC):', currentDate.toISOString());
    console.log(
      'Token Generation Date (UTC):',
      tokenGenerationDate.toISOString(),
    );
    console.log(
      'Token Expiration Date (UTC):',
      tokenExpirationDate.toISOString(),
    );

    return currentDate > tokenExpirationDate;
  }

  updateLastLoginTimestamp() {
    this.last_login_timestamp = new Date();
  }

  updateLastActivityTimestamp() {
    this.last_activity_timestamp = new Date();
  }
}
