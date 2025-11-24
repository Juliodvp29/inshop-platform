// apps/api-gateway/src/app/app.module.ts

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthProxyController } from './controllers/auth-proxy.controller';
import { UsersProxyController } from './controllers/users-proxy.controller';
import { CustomRateLimitGuard } from './guards/rate-limit.guard';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '../../../../.env'),
    }),

    // Rate Limiting global
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos
        limit: 100, // 100 requests
      },
    ]),

    // HTTP Client para hacer requests a microservicios
    HttpModule.register({
      timeout: 15000, // 15 segundos de timeout
      maxRedirects: 5,
    }),
  ],
  controllers: [
    AppController,
    AuthProxyController, // ← Controller para proxy de auth
    UsersProxyController // ← Controller para proxy de users
  ],
  providers: [
    AppService,
    // Rate Limiting global
    {
      provide: APP_GUARD,
      useClass: CustomRateLimitGuard,
    },
  ],
})
export class AppModule { }