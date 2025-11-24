// apps/api-gateway/src/app/app.controller.ts

import { HttpService } from '@nestjs/axios';
import { Controller, Get, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { SERVICES } from '../config/services.config';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly httpService: HttpService) { }

  /**
   * Health check del API Gateway
   */
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'API Gateway',
      version: '1.0.0',
    };
  }

  /**
   * Status de todos los microservicios
   */
  @Get('health/services')
  async getServicesHealth() {
    const services = [];

    // Check Auth Service
    try {
      const authHealth = await firstValueFrom(
        this.httpService.get(`${SERVICES.AUTH.url}/`, {
          timeout: 3000,
        })
      );
      services.push({
        name: SERVICES.AUTH.name,
        status: 'up',
        url: SERVICES.AUTH.url,
        responseTime: authHealth.headers['x-response-time'] || 'N/A',
      });
    } catch (error: any) {
      this.logger.error(`❌ ${SERVICES.AUTH.name} is down:`, error.message);
      services.push({
        name: SERVICES.AUTH.name,
        status: 'down',
        url: SERVICES.AUTH.url,
        error: error.message,
      });
    }

    const allUp = services.every((s) => s.status === 'up');

    return {
      gateway: 'up',
      timestamp: new Date().toISOString(),
      allServicesUp: allUp,
      services,
    };
  }
}