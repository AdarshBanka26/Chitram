import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongoUri: process.env.MONGODB_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    visionModel: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    enabled: Boolean(process.env.OPENAI_API_KEY),
  },

  useAtlasVectorSearch: String(process.env.USE_ATLAS_VECTOR_SEARCH).toLowerCase() === 'true',
};

// Fail fast on the few env vars we truly cannot run without.
export const assertRequiredEnv = () => {
  const missing = [];
  if (!env.mongoUri) missing.push('MONGODB_URI');
  if (!process.env.JWT_ACCESS_SECRET) missing.push('JWT_ACCESS_SECRET');
  if (!process.env.JWT_REFRESH_SECRET) missing.push('JWT_REFRESH_SECRET');

  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error(`\n[config] Missing required environment variables: ${missing.join(', ')}`);
    console.error('[config] Copy .env.example to .env and fill in the values.\n');
    process.exit(1);
  }

  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    console.warn('[config] Cloudinary credentials missing — media uploads will fail until set.');
  }
  if (!env.openai.enabled) {
    console.warn('[config] OPENAI_API_KEY missing — AI features will run in fallback mode.');
  }
};

export default env;