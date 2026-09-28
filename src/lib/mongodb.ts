import mongoose from 'mongoose';
import dns from 'dns';

// Fix Node.js DNS srv resolution issues (e.g. ECONNREFUSED) by preferring IPv4
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local or Vercel Environment Variables');
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    };

    console.log('\x1b[36m[MongoDB]\x1b[0m 🔄 Connexion à MongoDB Atlas en cours...');

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
      console.log(`\x1b[32m[MongoDB] ✅ CONNECTÉ AVEC SUCCÈS AU CLUSTER !\x1b[0m (Base: ${m.connection.name || 'stonelink'})`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error(`\x1b[31m[MongoDB] ❌ ÉCHEC DE CONNEXION :\x1b[0m ${e.message}`);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
