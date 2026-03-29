const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const requiredVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

// Validate required environment variables
const missing = requiredVars.filter((key) => !process.env[key]);
const hasDbUrl = !!process.env.DATABASE_URL;
const hasDbParams = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;

if (missing.length > 0 || (!hasDbUrl && !hasDbParams)) {
  console.error('\n=================================================');
  console.error('❌ RAILWAY DEPLOYMENT ERROR [RAILWAY-FIX-V3]');
  console.error('=================================================');
  if (missing.length > 0) {
    console.error(`🔴 MISSING SECURITY KEYS: ${missing.join(', ')}`);
  }
  if (!hasDbUrl && !hasDbParams) {
    console.error('🔴 MISSING DATABASE: DATABASE_URL is not set.');
  }
  console.error('\n👉 FIX: Go to Railway Dashboard -> Variables');
  console.error('   Ensure DATABASE_URL, JWT_SECRET, and JWT_REFRESH_SECRET are set.');
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
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
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
