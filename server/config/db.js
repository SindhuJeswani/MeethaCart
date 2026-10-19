import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEV_URI_FILE = path.join(__dirname, '..', '.mongo_dev_uri');

/**
 * Connect to MongoDB with automatic dev-fallback
 * Tries local/Atlas MongoDB first. If unavailable in dev, uses MongoMemoryServer
 * and shares the URI across processes via .mongo_dev_uri.
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meethacart';

  // 1. Try standard connection
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[Database] MongoDB Connected to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    console.warn(`[Database] Standard MongoDB connection unavailable (${error.message}). Checking dev fallback...`);

    // 2. Check if an in-memory dev instance is already running from another process
    if (fs.existsSync(DEV_URI_FILE)) {
      try {
        const savedUri = fs.readFileSync(DEV_URI_FILE, 'utf-8').trim();
        if (savedUri) {
          const conn = await mongoose.connect(savedUri, {
            serverSelectionTimeoutMS: 2000
          });
          console.log(`[Database] Connected to active dev MongoDB instance: ${savedUri}`);
          return conn;
        }
      } catch (savedErr) {
        // Saved instance died or was restarted; remove stale file and start fresh
        try { fs.unlinkSync(DEV_URI_FILE); } catch (e) {}
      }
    }

    // 3. Start a new in-memory instance and persist URI for sibling processes
    try {
      console.log('[Database] Starting in-memory embedded MongoDB server for seamless development...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();

      fs.writeFileSync(DEV_URI_FILE, memoryUri, 'utf-8');

      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] In-memory MongoDB connected successfully at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[Database] Failed to start in-memory MongoDB:', memErr.message);
      throw memErr;
    }
  }
};
