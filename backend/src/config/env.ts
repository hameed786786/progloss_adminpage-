import 'dotenv/config';
import { z } from 'zod';

const booleanFromString = z.preprocess((value) => {
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),
  MONGO_URL: z.string().default('mongodb://localhost:27017/progloss'),
  DNS_SERVERS: z.string().optional(),
  MONGO_APP_NAME: z.string().default('progloss'),
  MONGO_MAX_POOL_SIZE: z.coerce.number().int().positive().default(10),
  MONGO_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  MONGO_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  MONGO_RETRY_WRITES: booleanFromString.default(true),
  JWT_SECRET: z.string().min(10).default('dev-secret-change-me'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_DAYS: z.string().default('30'),
  RATE_LIMIT_WINDOW_MS: z.string().default(String(15 * 60 * 1000)),
  RATE_LIMIT_MAX: z.string().default('100'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173,http://localhost:8080')
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error('Invalid environment variables', result.error.format());
  process.exit(1);
}

export const env = result.data;

if (env.NODE_ENV === 'production' && !env.MONGO_URL.startsWith('mongodb+srv://')) {
  console.error('Invalid environment variables', {
    MONGO_URL: 'Production deployments must use a MongoDB Atlas connection string that starts with mongodb+srv://'
  });
  process.exit(1);
}
