
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener ConfigService
  const configService = app.get(ConfigService);

  // Configurar CORS
  app.enableCors({
    origin: '*', // En producción, especificar los dominios permitidos
    credentials: true,
  });

  // IMPORTANTE: Configurar validation pipes globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extras
      transform: true, // Transforma los payloads a instancias de DTO
      transformOptions: {
        enableImplicitConversion: true, // Convierte tipos automáticamente
      },
      // IMPORTANTE: No fallar en el primer error, mostrar todos
      stopAtFirstError: false,
      // Validar cada propiedad incluso si es undefined
      skipMissingProperties: false,
    })
  );

  // Puerto desde variables de entorno
  const port = configService.get('PORT') || 3333;

  await app.listen(port);

  Logger.log(`Auth Service running on: http://localhost:${port}`);
  Logger.log(`Available endpoints:
    - POST   /auth/register
    - POST   /auth/login
    - GET    /auth/google
    - GET    /auth/google/callback
    - POST   /auth/refresh
    - POST   /auth/logout
    - GET    /auth/me
    - PATCH  /users/:id/role
  `);
}

bootstrap();