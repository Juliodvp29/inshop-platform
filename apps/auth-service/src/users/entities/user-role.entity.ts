import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User, UserRole } from './user.entity';

/**
 * Esta tabla maneja roles específicos por tienda
 * Un usuario puede ser CUSTOMER globalmente,
 * pero TENANT_ADMIN en su propia tienda
 */
@Entity('user_roles')
@Index(['userId', 'tenantId'], { unique: true }) // Un usuario solo puede tener un rol por tienda
export class UserRoleMapping {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  @Column({ name: 'tenant_id', nullable: true })
  @Index()
  tenantId!: string | null; // null = rol global

  @Column({
    type: 'enum',
    enum: Object.values(UserRole),
  })
  role!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relación con User
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}