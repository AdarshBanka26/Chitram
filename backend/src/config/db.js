import mongoose from 'mongoose';
import env from './env.js';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return mongoose.connection;

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== 'production', // build indexes automatically in dev
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    // eslint-disable-next-line no-console
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;