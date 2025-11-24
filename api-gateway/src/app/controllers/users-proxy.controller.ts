
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

@Controller('api/users')
export class UsersProxyController {
  private readonly logger = new Logger(UsersProxyController.name);

  constructor(private readonly httpService: HttpService) { }

  @All('*')
  async proxyToAuthService(@Req() req: Request, @Res() res: Response) {
    try {
      let path = req.url;

      if (!path.startsWith('/')) {
        path = '/' + path;
      }

      // Los endpoints de users están en el Auth Service
      const authServiceUrl = `${SERVICES.AUTH.url}/users${path}`;

      this.logger.log(
        `Proxying ${req.method} ${req.originalUrl} → ${authServiceUrl}`
      );

      const headers = { ...req.headers };
      delete headers.host;
      delete headers['content-length'];

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
              this.logger.error(`Error:`, error.message);
              throw error;
            })
          )
      );

      this.logger.log(`Response ${response.status}`);

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