import mongoose from 'mongoose';
import { getConfig } from './consul';

let MONGODB_URI: string;

async function getMongoUri() {
  if (!MONGODB_URI) {
    const config = await getConfig();
    const uri = config.MONGODB_URI;
    
    // Validate MongoDB URI format before caching
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error(`Invalid MONGODB_URI format. Expected to start with 'mongodb://' or 'mongodb+srv://'. Got: '${uri.substring(0, 50)}...'`);
    }
    
    MONGODB_URI = uri;
  }
  return MONGODB_URI;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Get MongoDB URI from Consul or environment
    const uri = await getMongoUri();
    console.log(uri,'=====')
    if (!uri) {
      throw new Error('MONGODB_URI not found in Consul or environment variables');
    }

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        console.log(mongoose)
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e:any) {
    cached.promise = null;
    console.error('❌ MongoDB connection error: bener iki to yooo?', e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;