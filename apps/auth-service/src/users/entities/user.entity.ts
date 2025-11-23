import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  TENANT_ADMIN: 'tenant_admin',
  TENANT_MANAGER: 'tenant_manager',
  TENANT_SUPPORT: 'tenant_support',
  CUSTOMER: 'customer',
  GUEST: 'guest',
};

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column({ nullable: true })
  @Exclude() // No incluir en respuestas JSON
  passwordHash?: string;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: Object.values(UserRole),
    default: UserRole.CUSTOMER,
  })
  role!: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified!: boolean;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  // OAuth fields
  @Column({ name: 'oauth_provider', nullable: true })
  oauthProvider?: string;

  @Column({ name: 'oauth_id', nullable: true })
  oauthId?: string;

  // 2FA fields
  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled!: boolean;

  @Column({ name: 'two_factor_secret', nullable: true })
  @Exclude()
  twoFactorSecret?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  // Relaciones
  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens!: RefreshToken[];

  // Helper para obtener nombre completo
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}