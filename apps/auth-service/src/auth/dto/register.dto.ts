
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @IsString({ message: 'El email debe ser un texto' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede tener más de 50 caracteres' })
  password!: string;

  @IsString({ message: 'El nombre debe ser un texto' })
  @IsOptional()
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  firstName?: string;

  @IsString({ message: 'El apellido debe ser un texto' })
  @IsOptional()
  @MaxLength(100, { message: 'El apellido no puede tener más de 100 caracteres' })
  lastName?: string;

  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsOptional()
  @MaxLength(20, { message: 'El teléfono no puede tener más de 20 caracteres' })
  phone?: string;
}