// apps/api-gateway/src/main.ts

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:4200', // Storefront
      'http://localhost:4201', // Admin Panel
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const port = configService.get('GATEWAY_PORT') || 3000;

  await app.listen(port);

  logger.log(`API Gateway is running on: http://localhost:${port}/api`);
  logger.log(`Available routes:
    Health Checks:
    - GET    /api/health
    - GET    /api/health/services
    
    Authentication (proxied to Auth Service):
    - POST   /api/auth/register
    - POST   /api/auth/login
    - GET    /api/auth/google
    - GET    /api/auth/google/callback
    - POST   /api/auth/refresh
    - POST   /api/auth/logout
    - GET    /api/auth/me
    - PATCH  /api/users/:id/role
  `);
}

bootstrap();