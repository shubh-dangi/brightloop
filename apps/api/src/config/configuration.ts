export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  appName: process.env.APP_NAME || 'Subpulse',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/subpulse_db?schema=public',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET ||
      'subpulse_default_dev_secret_access_token_min_32_characters!',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'subpulse_default_dev_secret_refresh_token_min_32_characters!',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  s3: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'placeholder',
    bucket: process.env.AWS_S3_BUCKET || 'subpulse-saas-uploads',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || 're_placeholder',
    from: process.env.EMAIL_FROM || 'noreply@subpulse.local',
  },
});
