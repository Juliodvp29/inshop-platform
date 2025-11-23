import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class InviteUserDto {
  @IsEmail()
  email!: string;

  @IsEnum(Object.values(UserRole))
  role!: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string; // Para roles de tienda específica

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

export class UpdateUserRoleDto {
  @IsEnum(Object.values(UserRole))
  role!: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string; // Para roles específicos de tienda
}