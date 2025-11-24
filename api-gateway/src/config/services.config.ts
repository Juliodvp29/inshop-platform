/**
 * Configuración de URLs de microservicios
 */
export const SERVICES = {
  AUTH: {
    name: 'Auth Service',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3333',
  },
  // Agregar más servicios conforme se vayan creando
  // TENANT: {
  //   name: 'Tenant Service',
  //   url: process.env.TENANT_SERVICE_URL || 'http://localhost:3002',
  // },
} as const;

/**
 * Rutas que no requieren autenticación
 */
export const PUBLIC_ROUTES = [
  '/auth/register',
  '/auth/login',
  '/auth/google',
  '/auth/google/callback',
  '/auth/refresh',
  '/health',
] as const;

