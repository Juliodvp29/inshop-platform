import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './dto/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Registro de nuevo usuario
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role: UserRole.CUSTOMER,
    });

    await this.userRepository.save(user);

    // Generar tokens
    return this.generateAuthResponse(user);
  }

  /**
   * Login de usuario
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    if (!user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Actualizar último login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generar tokens
    return this.generateAuthResponse(user);
  }

  /**
   * Refrescar access token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthResponseDto> {
    // Buscar refresh token en BD
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    // Verificar si está revocado o expirado
    if (!tokenRecord.isValid) {
      throw new UnauthorizedException('Refresh token expirado o revocado');
    }

    // Revocar el token antiguo
    tokenRecord.isRevoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    // Generar nuevos tokens
    return this.generateAuthResponse(tokenRecord.user);
  }

  /**
   * Logout - revocar refresh token
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, userId },
    });

    if (tokenRecord) {
      tokenRecord.isRevoked = true;
      await this.refreshTokenRepository.save(tokenRecord);
    }
  }

  /**
   * Validar usuario por ID (para JWT Strategy)
   */
  async validateUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return user;
  }

  /**
   * Generar respuesta de autenticación con tokens
   */
  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Generar Access Token (corta duración)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      secret: process.env.JWT_SECRET,
    } as any);

    // Generar Refresh Token (larga duración)
    const refreshTokenValue = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    } as any);

    // Guardar refresh token en BD
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    const refreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role,
      },
    };
  }
}