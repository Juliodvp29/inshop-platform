import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener ConfigService
  const configService = app.get(ConfigService);

  // Configurar CORS
  app.enableCors();

  // Configurar validation pipes globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Puerto desde variables de entorno
  const port = configService.get('PORT') || 3333;

  await app.listen(port);

  Logger.log(`🚀 Auth Service running on: http://localhost:${port}`);
}

bootstrap();