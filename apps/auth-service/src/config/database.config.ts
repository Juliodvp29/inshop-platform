import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.AUTH_DB_HOST || 'localhost',
  port: parseInt(process.env.AUTH_DB_PORT || '5432', 10),
  username: process.env.AUTH_DB_USER || 'postgres',
  password: process.env.AUTH_DB_PASSWORD || 'postgres123',
  database: process.env.AUTH_DB_NAME || 'auth_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  autoLoadEntities: true,
});