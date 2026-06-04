import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env';

let connectPromise: Promise<typeof mongoose> | undefined;

function isAtlasUrl(url: string) {
  return url.startsWith('mongodb+srv://');
}

export function configureDnsForAtlas(url: string) {
  if (!isAtlasUrl(url)) return;

  const servers = env.DNS_SERVERS
    ?.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  dns.setServers(servers && servers.length > 0 ? servers : ['1.1.1.1', '8.8.8.8']);
}

function buildConnectionOptions(url: string) {
  const baseOptions = {
    appName: env.MONGO_APP_NAME,
    maxPoolSize: env.MONGO_MAX_POOL_SIZE,
    serverSelectionTimeoutMS: env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
    connectTimeoutMS: env.MONGO_CONNECT_TIMEOUT_MS,
    retryWrites: env.MONGO_RETRY_WRITES
  };

  if (isAtlasUrl(url)) {
    return {
      ...baseOptions,
      tls: true
    };
  }

  return baseOptions;
}

export async function connect() {
  const url = env.MONGO_URL;
  configureDnsForAtlas(url);
  mongoose.set('strictQuery', false);
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!connectPromise) {
    connectPromise = mongoose.connect(url, buildConnectionOptions(url));
  }
  await connectPromise;
  return mongoose;
}

export default mongoose;