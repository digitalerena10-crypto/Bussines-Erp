const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const requiredVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

// Validate required environment variables
const hasDbUrl = !!process.env.DATABASE_URL;
const hasDbParams = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;

if (!hasDbUrl && !hasDbParams) {
  console.error('\n=================================================');
  console.error('❌ RAILWAY DEPLOYMENT ERROR: DATABASE MISSING');
  console.error('=================================================');
  console.error('🔴 You must add a Postgres database and link DATABASE_URL.');
  console.error('=================================================\n');
  process.exit(1);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  // Database
  db: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'v4ult_erp_emergency_secret_2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'v4ult_erp_emergency_refresh_2026',
    expiry: process.env.JWT_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = env;
