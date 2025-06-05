export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3333,
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key_change_in_production',
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5174',
  email: {
    host: process.env.EMAIL_HOST || '',
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 993,
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
  }
}; 