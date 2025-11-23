import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const config = {
    type: 'postgres' as const,
    host: process.env.AUTH_DB_HOST || 'localhost',
    port: parseInt(process.env.AUTH_DB_PORT || '5432', 10),
    username: process.env.AUTH_DB_USER || 'postgres',
    password: process.env.AUTH_DB_PASSWORD || 'postgres123',
    database: process.env.AUTH_DB_NAME || 'auth_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    autoLoadEntities: true,
  };

  console.log('🔍 Database Configuration:');
  console.log('  HOST:', config.host);
  console.log('  PORT:', config.port);
  console.log('  DATABASE:', config.database);
  console.log('  USER:', config.username);
  console.log('  PASSWORD:', config.password ? `✓ SET(${config.password.substring(0, 3)}...)` : '✗ NOT SET');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  AUTH_DB_PASSWORD from env:', process.env.AUTH_DB_PASSWORD ? '✓ SET' : '✗ NOT SET');

  return config;
};
