import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const config = {
    type: 'postgres' as const,
    host: process.env.AUTH_DB_HOST || 'localhost',
    port: parseInt(process.env.AUTH_DB_PORT || '5432', 10),
    username: process.env.AUTH_DB_USER || 'postgres',
    // No usar contraseña en desarrollo con trust mode
    password: undefined,
    database: process.env.AUTH_DB_NAME || 'auth_db',
    // entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Disable glob loading
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    autoLoadEntities: true,
  };

  console.log('🔍 Database Configuration:');
  console.log('  HOST:', config.host);
  console.log('  PORT:', config.port);
  console.log('  DATABASE:', config.database);
  console.log('  USER:', config.username);
  console.log('  PASSWORD:', 'TRUST MODE (no password)');
  console.log('  NODE_ENV:', process.env.NODE_ENV);

  return config;
};