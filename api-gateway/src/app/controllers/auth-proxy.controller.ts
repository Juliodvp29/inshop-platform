// apps/api-gateway/src/app/controllers/auth-proxy.controller.ts

import { HttpService } from '@nestjs/axios';
import {
  All,
  Controller,
  HttpStatus,
  Logger,
  Req,
  Res,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';
import { catchError, firstValueFrom } from 'rxjs';
import { SERVICES } from '../../config/services.config';

@Controller('auth')
export class AuthProxyController {
  private readonly logger = new Logger(AuthProxyController.name);

  constructor(private readonly httpService: HttpService) { }

  @All('*')
  async proxyToAuthService(@Req() req: Request, @Res() res: Response) {
    try {
      // DEBUG: Ver qué está llegando
      this.logger.debug('=== DEBUG INFO ===');
      this.logger.debug(`req.url: ${req.url}`);
      this.logger.debug(`req.originalUrl: ${req.originalUrl}`);
      this.logger.debug(`req.baseUrl: ${req.baseUrl}`);
      this.logger.debug(`req.path: ${req.path}`);
      this.logger.debug('==================');

      // req.url puede venir como:
      // - "/register" si usamos @Controller('auth')
      // - "/api/auth/register" si algo está mal configurado

      let path = req.url;

      // Si el path incluye /api/auth, removerlo
      if (path.startsWith('/api/auth')) {
        path = path.replace('/api/auth', '');
      }

      // Si el path NO empieza con /, agregarlo
      if (!path.startsWith('/')) {
        path = '/' + path;
      }

      // URL final: http://localhost:3333/auth/register
      const authServiceUrl = `${SERVICES.AUTH.url}/auth${path}`;

      this.logger.log(
        `📡 Proxying ${req.method} ${req.originalUrl} → ${authServiceUrl}`
      );

      // Headers a reenviar
      const headers = { ...req.headers };
      delete headers.host;
      delete headers['content-length'];

      // Hacer la petición
      const response = await firstValueFrom(
        this.httpService
          .request({
            method: req.method,
            url: authServiceUrl,
            data: req.body,
            headers,
            params: req.query,
            validateStatus: () => true,
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`Axios error:`, error.message);
              if (error.response) {
                this.logger.error(`Response status: ${error.response.status}`);
                this.logger.error(`Response data:`, error.response.data);
              }
              throw error;
            })
          )
      );

      this.logger.log(`Response ${response.status} from Auth Service`);

      return res.status(response.status).json(response.data);
    } catch (error: any) {
      this.logger.error('Proxy error:', error.message);

      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }

      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Auth Service is unavailable',
        error: 'Service Unavailable',
      });
    }
  }
}