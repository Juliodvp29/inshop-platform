import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsEnum(Object.values(UserRole), {
    message: 'role must be a valid role value',
  })
  role!: string;
}
