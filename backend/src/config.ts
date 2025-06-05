import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 3333,
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key_change_in_production',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5174'],
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5174',
  database: {
    url: process.env.DATABASE_URL
  },
  email: {
    defaultImapPort: 993,
    defaultSmtpPort: 587
  }
}; 